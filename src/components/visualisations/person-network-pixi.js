import React, { useEffect, useState, useCallback} from 'react';
import axios from 'axios';
import * as d3 from "d3";
import {Link} from 'react-router-dom';
import { Spinner, FormGroup, Input } from 'reactstrap';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import dataWorker from "./person-data.worker.js";
import simulationWorker from "./force-simulation.worker.js";
import {webglSupport,jsonStringToObject} from "../../helpers";
import HelpArticle from '../../components/help-article';
import LazyList from '../../components/lazylist';
const APIPath = process.env.REACT_APP_APIPATH;

/// d3 network

var app, container, nodes, links, width=600, height=660, resolution=window.devicePixelRatio || 1, transform={s:1,x:0,y:0}, associatedNodes=[], associatedLinks=[], selectedNode, lineContainer, nodesContainer, textContainer, publicFunctions = {};

const transformEnd = () => {
  container.screenWidth = width;
  container.options.screenWidth = width;
  app.renderer.resize(width,height);
  let point = container.center;
  transform.x = point.x;
  transform.y = point.y;
}

const redraw = () => {
  lineContainer.removeChildren();
  nodesContainer.removeChildren();
  textContainer.removeChildren();
  drawNodes();
  drawLines();
}

const moving = () => {
  lineContainer.removeChildren();
  textContainer.removeChildren();
}

const movedEnd = () => {
  let point = container.center;
  transform.x = point.x;
  transform.y = point.y;
  redraw();
}

const zoomedEnd = () => {
  transform.s = container.scaled;
  redraw();
}

const doubleClickZoom = () => {
  container.zoomPercent(0.25, true);
}

const hexColor = (value) => {
  return value.replace("#","0x");
}

const loader = new PIXI.Loader();

const splitArray = (array, size) =>{
  let newArr = [];
  for (let i=0; i<array.length; i+=size) {
    let chunk = array.slice(i, i+size);
    newArr.push(chunk);
  }
  return newArr;
}

const drawNodes = async () => {
  if (typeof nodes==="undefined") {
    return false;
  }
  if(typeof loader.resources['Arial']==="undefined") {
    loader.add("Arial", "/arial-bitmap/Arial.xml");
  }
  loader.load((loader, resources) => {
    let bbox = container.getVisibleBounds();
    let leftX = bbox.x;
    let rightX = bbox.x+bbox.width;
    let topY = bbox.y;
    let bottomY = bbox.y+bbox.height;
    let nodesSplit = splitArray(nodes, 500);
    for (let j=0;j<nodesSplit.length;j++) {
      let newNodes = nodesSplit[j];
      for (let i=0; i<newNodes.length; i++) {
        let d = newNodes[i];
        if (i===0) {
          d.expanded = true;
        }
        d.visible = true;
        let radius = d.size || 30;
        let x = d.x;
        let y = d.y;
        if (leftX<=x && rightX>=x && topY<=y && bottomY>=y) {
          d.gfx = new PIXI.Graphics();
          d.gfx.interactive = true;
          d.gfx.on("click", (e)=>publicFunctions.clickNode(e,d))
          d.gfx.on("tap", (e)=>publicFunctions.clickNode(e,d))
          let lineWidth = 1;
          let strokeStyle = hexColor(d.strokeColor);
          d.visible = true;
          // circle
          if (typeof d.selected!=="undefined" && d.selected) {
            lineWidth = 5;
            strokeStyle = "0x33729f";
            radius+=5;
          }
          else if (typeof d.associated!=="undefined" && d.associated) {
            lineWidth = 5;
          }
          else {
            lineWidth = 1;
          }
          d.gfx.beginFill(hexColor(d.color));
          if (container.scaled>0.3) {
            d.gfx.lineStyle(lineWidth,strokeStyle);
          }
          d.gfx.drawCircle(x, y, radius);
          nodesContainer.addChild(d.gfx);
          if (d.label!=="" && container.scaled>0.3) {
            let label = d.label.trim().replace(/  +/g," ");
            let spaces = label.split(" ");
            let newSpaces = [];
            for (let i=0;i<spaces.length;i++) {
              let space = spaces[i];
              let nextIndex = i+1;
              if (nextIndex<(spaces.length-1) && space.length<6 && spaces[nextIndex].length<6) {
                space += " "+spaces[nextIndex];
                spaces.splice(nextIndex, 1);
              }
              newSpaces.push(space);
            }
            let minusY = newSpaces.length/2;

            let text = new PIXI.BitmapText(label,{fontName: "Arial", fontSize: 11, align : 'center'});
            text.maxWidth = (radius*2)+(lineWidth*2);
            text.x = x-radius+(lineWidth*2);
            text.y = y-(10*minusY);
            textContainer.addChild(text);
          }
        }
      }
    }
  });

}

const drawLines = () => {
  if (typeof links==="undefined") {
    return false;
  }
  let bbox = container.getVisibleBounds();
  let leftX = bbox.x;
  let rightX = bbox.x+bbox.width;
  let topY = bbox.y;
  let bottomY = bbox.y+bbox.height;
  let linksSplit = splitArray(links, 500);
  for (let j=0;j<linksSplit.length; j++) {
    let newLinks = linksSplit[j];
    for (let i=0; i<newLinks.length; i++) {
      let d = newLinks[i];
      let sx = d.source.x;
      let sy = d.source.y;
      let tx = d.target.x;
      let ty = d.target.y;
      if (leftX<=sx && rightX>=sx && topY<=sy && bottomY>=sy) {
        let line = new PIXI.Graphics();
        let lWidth = 1;
        let strokeStyle = 0x666666;
        if (typeof d.associated!=="undefined" && d.associated) {
          lWidth = 5;
          strokeStyle = 0x33729f;
        }
        line.lineStyle(lWidth,strokeStyle);
        line.moveTo(sx, sy);
        line.lineTo(tx, ty);
        lineContainer.addChild(line);
      }
    }
  }
}

const dataLoadingWorker = new dataWorker();

const forceSimulationWorker = new simulationWorker();

const PersonNetwork = props => {
  const [initiated, setInitiated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawingIndicator, setDrawingIndicator] = useState([]);
  const [data, setData] = useState(null);
  const [searchData, setSearchData] = useState([]);
  const [detailsCardVisible, setDetailsCardVisible] = useState(false);
  const [detailsCardEntityInfo, setDetailsCardEntityInfo] = useState([]);
  const [detailsCardContent, setDetailsCardContent] = useState([]);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchInputType, setSearchInputType] = useState("");
  const [helpVisible, setHelpVisible] = useState(false);
  const [loadingNode, setLoadingNode] = useState(false);
  const [nodeId, setNodeId] = useState(null);

  const [contextMenu, setContextMenu] = useState({visible:false,x:0,y:0});
  const [contextMenuExpanded, setContextMenuExpanded] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const [activePaths, setActivePaths] = useState([]);

  const toggleDetailsCard = (value=null) => {
    let visible = !detailsCardVisible;
    if (value!==null) visible = value;
    if (!visible) {
      clearAssociated();
    }
    setDetailsCardVisible(visible);
  }

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  }

  useEffect(()=> {
    const initiateGraph = ()=> {
      setInitiated(true);
      let graphContainer = document.getElementById('graph-container');
      width = graphContainer.offsetWidth-2;
      PIXI.Renderer.create = function create (options) {
        if (webglSupport()) {
            return new PIXI.Renderer(options);
        }
        throw new Error('WebGL unsupported in this browser, use "pixi.js-legacy" for fallback canvas2d support.');
      };

      app = new PIXI.Application({
        width: width,
        height: height,
        antialias: true,
        transparent: false,
        resolution: resolution,
        backgroundColor: 0xFFFFFF,
        autoResize: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
        sharedTicker: true
      });

      document.getElementById("pixi-network").appendChild(app.view);

      container = new Viewport({
          screenWidth: width,
          screenHeight: height,
          worldWidth: 1000,
          worldHeight: 1000,
          interaction: app.renderer.plugins.interaction,
          ticker: PIXI.Ticker.shared,
          bounce: false,
          decelerate: false,
          passiveWheel: false
      })
      .on("moved",()=>moving())
      .on("moved-end",()=>movedEnd())
      .on("zoomed-end",()=>zoomedEnd())
      app.stage.addChild(container);
      container.drag({wheel:false});

      lineContainer = new PIXI.Container();
      nodesContainer = new PIXI.Container();
      textContainer = new PIXI.Container();
      container.addChild(lineContainer);
      container.addChild(nodesContainer);
      container.addChild(textContainer);

    };
    if (!initiated) {
      initiateGraph();
    }
  },[initiated]);

  useEffect(()=> {
    const load = async() => {
      setDrawingIndicator("loading data...");
      let _id = props._id;
      if (typeof _id==="undefined" || _id===null || _id==="") {
        return false;
      }
      let workerParams = {_id:_id, step: 1, APIPath:APIPath};
      dataLoadingWorker.postMessage(workerParams);
      let newData = await new Promise ((resolve,reject)=>{
        dataLoadingWorker.addEventListener('message',(e) =>{
          resolve(e.data);
        }, false);
      });
      let parsedData = jsonStringToObject(newData);
      parsedData = jsonStringToObject(parsedData.data);
      console.log(parsedData)
      setData(parsedData);
      setSearchData(parsedData.nodes);
      setDrawing(true);
      setSearchInput("");
      setSearchInputType("");
      setLoading(false);
    }
    if (loading) {
      load();
    }
  },[loading,props._id]);


  useEffect(()=> {
    const drawGraph = async() => {
      setDrawing(false);
      setDrawingIndicator("simulating...");
      let centerX = width/2;
      let centerY = height/2;
      transform.x = centerX;
      transform.y = centerY;

      transformEnd();

      let simulationParams = {nodes:data.nodes, links: data.links, centerX:centerX-50,centerY:centerY-50};
      forceSimulationWorker.postMessage(simulationParams);
      let simulation = await new Promise ((resolve,reject)=>{
        forceSimulationWorker.addEventListener('message',(e) =>{
          resolve(e.data);
        }, false);
      });
      let simulationData = jsonStringToObject(simulation.data);
      setDrawingIndicator("drawing...");
      nodes = simulationData.nodes;
      links = simulationData.links;

      d3.select("#graph-zoom-in")
      .on("click", function() {
        container.zoomPercent(0.25, true);
        zoomedEnd();
      });
      d3.select("#graph-zoom-out")
      .on("click", function() {
        if(container.scaled<0.1) {
          return false;
        }
        container.zoomPercent(-0.25, true);
        zoomedEnd();
      });
      d3.select("#graph-pan-up")
      .on("click", function() {
        let newX = transform.x;
        let newY = transform.y + 50;
        container.moveCenter(newX, newY);
        zoomedEnd();
      });
      d3.select("#graph-pan-right")
      .on("click", function() {
        let newX = transform.x - 50;
        let newY = transform.y;
        container.moveCenter(newX, newY);
        zoomedEnd();
      });
      d3.select("#graph-pan-down")
      .on("click", function() {
        let newX = transform.x;
        let newY = transform.y - 50;
        container.moveCenter(newX, newY);
        zoomedEnd();
      });
      d3.select("#graph-pan-left")
      .on("click", function() {
        let newX = transform.x + 50;
        let newY = transform.y;
        container.moveCenter(newX, newY);
        zoomedEnd();
      });
      setDrawingIndicator("drawing complete.");
      setTimeout(()=>{setDrawingIndicator("");},1000);

      // recenter viewport and draw
      container.moveCenter(nodes[0].x, nodes[0].y)
    }
    if (drawing && initiated) {
      drawGraph();
    }
    return () => {
      return false;
    }
  },[drawing,initiated,data]);

  useEffect(()=>{
    var resizeTimer;
    const updateCanvasSize = () => {
      let container = document.getElementById('graph-container');
      width = container.offsetWidth-2;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        transformEnd();
        redraw();
      }, 250);
    }
    window.addEventListener('resize', updateCanvasSize);
    return(()=> {
      window.removeEventListener('resize', updateCanvasSize);
    })
  })

  const parseSegments = (segments, i) => {
    let output = [];
    for (let i=0;i<segments.length; i++) {
      let segment = segments[i];
      let source = segment.source;
      let target = segment.target;
      let relationship = segment.relationship;
      let linkArray = ["Classpiece", "Organisation", "Person", "Resource"];
      let sourceType = source.type;
      let targetType = target.type;
      let sourceLabel = <span>{source.label} <small>[{source.type}]</small></span>;
      let targetLabel = <span>{target.label} <small>[{target.type}]</small></span>;
      if (linkArray.indexOf(sourceType)>-1) {
        let sourceHref = `/${source.type.toLowerCase()}/${source._id}`;
        sourceLabel = <Link to={sourceHref} href={sourceHref}>{source.label} <small>[{source.type}]</small></Link>
      }
      if (linkArray.indexOf(targetType)>-1) {
        let targetHref = `/${target.type.toLowerCase()}/${target._id}`;
        targetLabel = <Link to={targetHref} href={targetHref}>{target.label} <small>[{target.type}]</small></Link>;
      }
      let returnItem = [];
      let sourceItem = <div className="source" key={`source-${i}`}>{sourceLabel}</div>;
      let prevIndex = i-1;
      if (i===0) {
        returnItem.push(sourceItem);
      }
      else if (i>0 && source._id!==segments[prevIndex].target._id) {
        returnItem.push(sourceItem);
      }
      returnItem.push(<div className="relationship" key={`relationship-${i}`}>{relationship.type}<div className="line"></div><div className="arrow"></div></div>);
      returnItem.push(<div className="target" key={`target-${i}`}>{targetLabel}</div>);
      output.push(returnItem);
    }
    let outputHTML = <li key={i}>{output}</li>;
    return outputHTML;
  }

  useEffect(()=>{
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const loadNode = async(_id) => {
      setDetailsCardEntityInfo("");
      setDetailsCardContent(<div style={{padding: '20pt',textAlign: 'center'}}>
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'item-network-related-paths',
        crossDomain: true,
        params: {sourceId:props._id,targetId:_id},
        cancelToken: source.token
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      if (typeof responseData!=="undefined") {
        let source = responseData[0].source;
        let target = responseData[0].target;
        let segments = [];
        setActivePaths(responseData);
        for (let i=0;i<responseData.length; i++) {
          let responseDataItem = responseData[i];
          let segmentsHTML = parseSegments(responseDataItem.segments, i);
          segments.push(<div key={i} className="related-nodes-paths-block">
            <div className="related-nodes-paths-count">[{i+1}]</div>
            <ul className="related-nodes-paths">{segmentsHTML}</ul>
          </div>);
        }
        let linkArray = ["Classpiece", "Organisation", "Person", "Event", "Resource"];
        let sourceType = source.type;
        let targetType = target.type;
        let sourceLabel = <span>{source.label}</span>;
        let targetLabel = <span>{target.label}</span>
        if (linkArray.indexOf(sourceType)>-1) {
          let sourceHref = `/${source.type.toLowerCase()}/${source._id}`;
          sourceLabel = <Link href={sourceHref} to={sourceHref}><span>{source.label}</span></Link>;
        }
        if (linkArray.indexOf(targetType)>-1) {
          let targetHref = `/${target.type.toLowerCase()}/${target._id}`;
          targetLabel = <Link href={targetHref} to={targetHref}><span>{target.label}</span></Link>;
        }
        let title = <div className="related-nodes-paths-label">
          <div className="source"><label>Source</label>: {sourceLabel}</div>
          <div className="target"><label>Target</label>: {targetLabel}</div>
        </div>
        setDetailsCardEntityInfo(title);
        setDetailsCardContent(segments);
        setLoadingNode(false);
      }
    }

    if (nodeId!==null && loadingNode) {
      loadNode(nodeId);
    }
    return () => {
      source.cancel("api request cancelled");
    };
  },[nodeId, loadingNode, props._id]);

  const loadNodeDetails = (_id) => {
    if (_id===props._id) {
      let node = data.nodes.find(n=>n.id===_id);
      if (typeof node!=="undefined") {
        setDetailsCardEntityInfo(node.label);
        setDetailsCardContent("");
      }
    }
    else {
      setNodeId(_id);
      setLoadingNode(true);
    }
  }

  publicFunctions.clickNode = (e,d)=> {
    let x = e.data.originalEvent.clientX-5;
    let y = e.data.originalEvent.clientY-5;
    setContextMenu({visible:true,x:x,y:y});
    d.selected=true;
    setContextMenuExpanded(d.expanded);
    setActiveNode(d);
  }

  const viewNodeDetails = () => {
    let prevNode = nodes.find(n=>n.selected);
    if (typeof prevNode!=="undefined") {
      delete prevNode.selected;
    }
    selectedNode = nodes.find(n=>n.id===activeNode.id);
    // load node details ;
    loadNodeDetails(activeNode.id);
    toggleDetailsCard(true);
    setContextMenu({visible:false,x:0,y:0});
  }

  const expandNode = async() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    let responseData = await axios({
      method: 'get',
      url: APIPath+'item-network',
      crossDomain: true,
      params: {_id:activeNode.id,step:1},
      cancelToken: source.token
    })
    .then(function (response) {
      return response.data.data;
    })
    .catch(function (error) {
    });
    let parsedData = jsonStringToObject(responseData);
    activeNode.expanded = true;

    for (let i=0;i<parsedData.nodes.length; i++) {
      let sn = parsedData.nodes[i];
      let findSN = nodes.find(n=>n.id===sn.id);
      if (typeof findSN==="undefined") {
        nodes.push(sn);
      }
    }
    for (let j=0;j<parsedData.links.length; j++) {
      let sl = parsedData.links[j];
      let findSL = nodes.find(l=>l.id===sl.id);
      if (typeof findSL==="undefined") {
        links.push(sl);
      }
    }
    // simulating positions
    setDrawingIndicator("simulating...");

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links)
          .id(d => d.id)
          .strength(d=>1)
          .distance(d=>100)
        )
      .force("charge", d3.forceManyBody().strength((d, i)=>{ return i===0 ? -10000 : -500; }))
      .force("center", d3.forceCenter((nodes[0].x), (nodes[0].y)))
      .force('collide', d3.forceCollide(80))
      //.charge(function(d, i) { return i==0 ? -10000 : -500; })
      .stop();


    let max = (Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())))/2;
    for (let i = 0; i < max; i++) {
      simulation.tick();
    }
    simulation.stop();

    // simulating positions
    setDrawingIndicator("drawing...");
    redraw();

    container.moveCenter(activeNode.x, activeNode.y)
    setDrawingIndicator("drawing complete.");
    setTimeout(()=>{setDrawingIndicator("");},1000);
    setContextMenu({visible:false,x:0,y:0});

    setSearchData(nodes);
  }

  const clearAssociated = () => {
    let newAccosiatedNodes = nodes.filter(n=>associatedNodes.indexOf(n.id)>-1);
    for (let n=0;n<newAccosiatedNodes.length; n++) {
      let item = newAccosiatedNodes[n];
      if (typeof item!=="undefined") {
        item.associated = false;
        delete item.associated;
      }
    }
    let newAccosiatedLinks = links.filter(l=>associatedLinks.indexOf(l.id)>-1);
    for (let l=0;l<newAccosiatedLinks.length; l++) {
      let item = newAccosiatedLinks[l];
      if (typeof item!=="undefined") {
        item.associated = false;
        delete item.associated;
      }
    }
    associatedNodes = [];
    associatedLinks = [];
    selectedNode.selected=false;
    delete selectedNode.selected;
    textContainer.removeChildren();
    redraw();
  };

  const selectedNodes = useCallback(() => {
    clearAssociated();
    let segments = [];
    for (let a=0;a<activePaths.length;a++) {
      let ap = activePaths[a];
      for (let j=0;j<ap.segments.length; j++) {
        segments.push(ap.segments[j])
      }
    }
    // associated links
    let newAssociatedLinks = [];
    let newAssociatedNodes = [];
    for (let i=0;i<segments.length; i++) {
      let seg = segments[i];
      if (newAssociatedLinks.indexOf(seg.relationship._id)===-1) {
        newAssociatedLinks.push(seg.relationship._id)
      }
      if (newAssociatedNodes.indexOf(seg.source._id)===-1) {
        newAssociatedNodes.push(seg.source._id);
      }
      if (newAssociatedNodes.indexOf(seg.target._id)===-1) {
        newAssociatedNodes.push(seg.target._id);
      }
    }
    let identifyLinks = links.filter(l=>newAssociatedLinks.indexOf(l.id)>-1);
    let identifyNodes = nodes.filter(n=>newAssociatedNodes.indexOf(n.id)>-1);
    identifyLinks.forEach(l=>{
      l.associated=true;
    });
    identifyNodes.forEach(n=>{
      n.associated=true;
    });

    associatedLinks = newAssociatedLinks;
    associatedNodes = newAssociatedNodes;
    redraw();
  },[activePaths]);

  useEffect(()=>{
    if (activePaths.length>0) {
      selectedNodes();
    }
  },[activePaths,selectedNodes]);

  const searchNode = (e) =>{
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInput(value);
    let visibleNodes = data.nodes.filter(n=>{
      if (searchInputType!=="") {
        if (n.type.toLowerCase()===searchInputType.toLowerCase() && n.label.toLowerCase().includes(value.toLowerCase())) {
          return true;
        }
      }
      else if (n.label.toLowerCase().includes(value.toLowerCase())) {
        return true;
      }
      return false;
    });
    let dataNodes = data.nodes;
    for (let i=0;i<dataNodes.length; i++) {
      let n = dataNodes[i];
      if (visibleNodes.indexOf(n)>-1) {
        n.visible = true;
      }
      else n.visible = false;
    }
    data.nodes = dataNodes;
    setData(data);
    setSearchData(visibleNodes);
  }

  const searchNodeType = (e) =>{
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInputType(value);
    if (value==="") {
      clearSearchNode();
    }
    else {
      let visibleNodes = data.nodes.filter(n=>{
        if (n.type.toLowerCase()===value.toLowerCase() && n.label.toLowerCase().includes(searchInput.toLowerCase())) {
          return true;
        }
        return false;
      });
      let dataNodes = data.nodes;
      for (let i=0;i<dataNodes.length; i++) {
        let n = dataNodes[i];
        if (visibleNodes.indexOf(n)>-1) {
          n.visible = true;
        }
        else n.visible = false;
      }
      data.nodes = dataNodes;
      setData(data);
      setSearchData(visibleNodes);
    }
  }

  const clearSearchNode = () => {
    setSearchInput("");
    setSearchInputType("");
    let dataNodes = data.nodes;
    for (let i=0;i<dataNodes.length; i++) {
      let n = dataNodes[i];
      n.visible = true;
    }
    data.nodes = dataNodes;
    setData(data);
    setSearchData(data.nodes);
  }

  const centerNode = (_id) => {
    let node = nodes.find(n=>n.id===_id);
    if (typeof node!=="undefined") {
      for (let i=0;i<nodes.length;i++) {
        let n = nodes[i];
        n.selected=false;
      }
      node.selected=true;
      container.moveCenter(node.x, node.y)
    }
  }

  const renderSearchItemHTML = (n) => {
    if (typeof n==="undefined") {
      return ;
    }
    return <div key={n.id} data-id={n.id} onClick={()=>centerNode(n.id)}>{n.label} <small>[{n.type}]</small></div>
  }

  const toggleHelp = () => {
    setHelpVisible(!helpVisible)
  }

  const searchIcon = <div className="graph-search-toggle" onClick={()=>toggleSearchContainerVisible()}>
    <i className="fa fa-search" />
  </div>

  const helpIcon = <div className="graph-help-toggle" onClick={()=>toggleHelp()} title="Help">
    <i className="fa fa-question-circle" />
  </div>

  const panPanel = <div className="pan-container">
    <div className="pan-action up" id="graph-pan-up">
      <i className="fa fa-chevron-up" />
    </div>

    <div className="pan-action right" id="graph-pan-right">
      <i className="fa fa-chevron-right" />
    </div>

    <div className="pan-action down" id="graph-pan-down">
      <i className="fa fa-chevron-down" />
    </div>

    <div className="pan-action left" id="graph-pan-left">
      <i className="fa fa-chevron-left" />
    </div>
  </div>
  const zoomPanel = <div className="zoom-panel">
    <div
      id="graph-zoom-in"
      className="zoom-action">
      <i className="fa fa-plus" />
    </div>
    <div
      id="graph-zoom-out"
      className="zoom-action">
      <i className="fa fa-minus" />
    </div>
  </div>

  let detailsCardVisibleClass = " hidden";
  if (detailsCardVisible) {
    detailsCardVisibleClass = "";
  }
  let detailsCard =  <div className={"card graph-details-card"+detailsCardVisibleClass}>
      <div className="graph-details-card-close" onClick={()=>toggleDetailsCard()}>
        <i className="fa fa-times" />
      </div>
      <div className="card-title"><h4>Node details</h4></div>
      <div className="card-body">
        <div className="entity-info">
          {detailsCardEntityInfo}
        </div>
        <div className="card-content">
          {detailsCardContent}
        </div>
        <div className="card-footer">
          <button type="button" className="btn btn-xs btn-outline btn-secondary" onClick={()=>toggleDetailsCard()}>Close</button>
        </div>
      </div>
    </div>
  let searchContainerVisibleClass = "";
  if (searchContainerVisible) {
    searchContainerVisibleClass = " visible";
  }
  let searchContainerNodes = [];
  if (!loading && searchData.length>0) {
    searchContainerNodes = <LazyList
      limit={30}
      range={15}
      items={searchData}
      containerClass="graph-search-container-nodes"
      renderItem={renderSearchItemHTML}
      />
  }
  let searchContainer = <div className={"graph-search-container"+searchContainerVisibleClass}>
    <div className="close-graph-search-container" onClick={()=>toggleSearchContainerVisible()}>
      <i className="fa fa-times" />
    </div>
    <FormGroup className="graph-search-input">
      <Input type="text" name="search_node" placeholder="Search node..." value={searchInput} onChange={(e)=>searchNode(e)}/>
      <i className="fa fa-times-circle" onClick={()=>clearSearchNode()}/>
    </FormGroup>
    <FormGroup className="graph-search-input-type">
      <Input type="select" name="search_node_type" value={searchInputType} onChange={(e)=>searchNodeType(e)}>
        <option value="">All</option>
        <option value="Classpiece">Classpiece</option>
        <option value="Event">Event</option>
        <option value="Organisation">Organisation</option>
        <option value="Person">Person</option>
        <option value="Resource">Resource</option>
      </Input>
    </FormGroup>
    {searchContainerNodes}
  </div>

  const legendPanel = <div className="graph-legend-panel">
    <ul>
      <li><span style={{borderColor: '#1e9dd8',backgroundColor: '#1ed8bf'}}></span> Classpiece</li>
      <li><span style={{borderColor: '#c9730a',backgroundColor: '#f9cd1b'}}></span> Event</li>
      <li><span style={{borderColor: '#5343b7',backgroundColor: '#9b8cf2'}}></span> Organisation</li>
      <li><span style={{borderColor: '#519b1b',backgroundColor: '#5dc910'}}></span> Person</li>
      <li><span style={{borderColor: '#0982a0',backgroundColor: '#00cbff'}}></span> Resource</li>
    </ul>
  </div>
  //contextMenu
  let contextMenuDisplay = "none";
  if (contextMenu.visible) {
    contextMenuDisplay = "block";
  }
  let contextMenuStyle = {
    display: contextMenuDisplay,
    left: contextMenu.x,
    top: contextMenu.y
  }
  let cmExpanded = <div onClick={()=>expandNode()}>Expand</div> ;
  if (contextMenuExpanded) {
    cmExpanded = []
  }
  const contextMenuHTML = <div className="graph-context-menu" style={contextMenuStyle} onMouseLeave={()=>{setContextMenu({visible:false,x:0,y:0})}}>
    <div onClick={()=>viewNodeDetails()}>View details</div>
    {cmExpanded}
  </div>
  return (
    <div style={{position:"relative", display: "block"}}>
      {contextMenuHTML}
      <div className="graph-drawing">{drawingIndicator}</div>
      <div id="pixi-network" onDoubleClick={()=>doubleClickZoom()}></div>
      <div className="graph-actions">
        {panPanel}
        {zoomPanel}
        {searchIcon}
        {helpIcon}
      </div>
      {detailsCard}
      {searchContainer}
      {legendPanel}
      <HelpArticle permalink={"item-network-graph-help"} visible={helpVisible} toggle={toggleHelp}/>
    </div>
  )
}
export default PersonNetwork;
