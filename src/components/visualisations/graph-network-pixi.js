import React, { useEffect, useState} from 'react';
import axios from 'axios';
import * as d3 from "d3";
import {Link} from 'react-router-dom';
import { Spinner, Badge, FormGroup, Input } from 'reactstrap';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import dataWorker from "./graph-data.worker.js";
import {webglSupport} from "../../helpers";
import HelpArticle from '../../components/help-article';
import GraphSearch from './graph-network-search';
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
        d.visible = true;
        let radius = d.size || 30;
        let x = d.x;
        let y = d.y;
        if (leftX<=x && rightX>=x && topY<=y && bottomY>=y) {
          d.gfx = new PIXI.Graphics();
          d.gfx.interactive = true;
          d.gfx.on("click", ()=>publicFunctions.clickNode(d))
          d.gfx.on("tap", ()=>publicFunctions.clickNode(d))
          let lineWidth = 1;
          let strokeStyle = hexColor(d.strokeColor);
          //d.visible = true;
          // circle
          if (typeof d.selected!=="undefined" && d.selected) {
            lineWidth = 3;
            strokeStyle = "0x33729f";
            radius+=5;
          }
          else if (typeof d.associated!=="undefined" && d.associated) {
            lineWidth = 3;
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
            let minusY = spaces.length/2;
            //label = label.replace(/\s/g,"\n");
            let text = new PIXI.BitmapText(label,{fontName: "Arial", fontSize: 11, align : 'center'});
            text.maxWidth = radius+(lineWidth*2);
            text.x = x-((radius/2)+(lineWidth*2)+1);
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
      if (
        leftX<=sx && rightX>=sx
        && topY<=sy && bottomY>=sy
      ) {
        let line = new PIXI.Graphics();
        let lWidth = 1;
        let strokeStyle = 0x666666;
        if (typeof d.associated!=="undefined" && d.associated) {
          lWidth = 3;
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

const PersonNetwork = props => {
  const [initiated, setInitiated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawingIndicator, setDrawingIndicator] = useState([]);
  const [data, setData] = useState(null);
  const [step, setStep] = useState(1);
  const [stepLoading, setStepLoading] = useState(false);
  const [detailsCardVisible, setDetailsCardVisible] = useState(false);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchInputType, setSearchInputType] = useState("");
  const [searchContainerReload, setSearchContainerReload] = useState(false);
  const [nodeLink, setNodeLink] = useState([]);
  const [relatedNodesHTML, setRelatedNodesHTML] = useState([]);
  const [helpVisible, setHelpVisible] = useState(false);

  const toggleDetailsCard = (value=null) => {
    let visible = !detailsCardVisible;
    if (value!==null) visible = value;
    if (!visible) {
      clearAssociated();
    }
    else {
      setStep(1);
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
      setLoading(false);
      let workerParams = {APIPath:APIPath};
      dataLoadingWorker.postMessage(workerParams);
      let newData = await new Promise ((resolve,reject)=>{
        dataLoadingWorker.addEventListener('message',(e) =>{
          resolve(e.data);
        }, false);
      });
      let parsedData = JSON.parse(newData.data);
      parsedData = JSON.parse(parsedData.data);
      setData(parsedData);
      setDrawing(true);
      setSearchInput("");
      setSearchInputType("");
    }
    if (loading) {
      load();
    }
  },[loading]);

  useEffect(()=> {
    const drawGraph = async() => {
      setDrawing(false);
      setDrawingIndicator("drawing...");
      let centerX = width/2;
      let centerY = height/2;
      transform.x = centerX;
      transform.y = centerY;

      transformEnd();

      nodes = data.nodes;
      links = data.links;
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
      // center to 1st node (ordered by incoming links) and draw
      container.moveCenter(nodes[0].x, nodes[0].y);
    }
    if (drawing && initiated) {
      drawGraph();
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

  const loadNodeDetails = async(_id, newStep=null) => {
    if (newStep===null) {
      newStep = step;
    }
    setStepLoading(true);
    let responseData = await axios({
      method: 'get',
      url: APIPath+'item-network-related-nodes',
      crossDomain: true,
      params: {_id:_id,step:newStep}
    })
    .then(function (response) {
      return response.data.data;
    })
    .catch(function (error) {
      console.log(error)
    });
    let nodeType = selectedNode.type;
    setNodeLink(<Link href={"/"+nodeType+"/"+selectedNode.id} to={"/"+nodeType+"/"+selectedNode.id}><b>{selectedNode.label}</b> [{nodeType}]</Link>);

    let relatedNodesIds = [_id];
    let linkArray = ["Classpiece", "Organisation", "Person", "Event"];
    let nodesHTML = responseData.map((node,i)=>{
      if (relatedNodesIds.indexOf(node._id)===-1) {
        relatedNodesIds.push(node._id);
      }
      let nodeType = node.type;
      let nodeLink = <span><b>{node.label}</b> <small>[{nodeType}]</small></span>
      if (linkArray.indexOf(nodeType)>-1) {
        nodeLink = <Link href={`${nodeType}/${node._id}`} to={`${nodeType}/${node._id}`}><b>{node.label}</b> <small>[{nodeType}]</small></Link>;
      }
      return <li key={i}>{nodeLink}</li>;
    });

    for (let i=0;i<links.length;i++) {
      let link = links[i];
      if (relatedNodesIds.indexOf(link.source.id)>-1 && relatedNodesIds.indexOf(link.target.id)>-1) {
        link.associated = true;
      }
      else link.associated = false;
    }
    setRelatedNodesHTML(nodesHTML);
    redraw();
    setStepLoading(false);
  }

  const setSteps = (val=1)=> {
    setStep(val);
    loadNodeDetails(selectedNode.id,val);
  }

  publicFunctions.clickNode = (d)=> {
    let prevNode = nodes.find(n=>n.selected);
    if (typeof prevNode!=="undefined") {
      delete prevNode.selected;
    }
    d.selected=true;
    selectedNode = nodes.find(n=>n.id===d.id);
    // load node details;
    loadNodeDetails(d.id);
    toggleDetailsCard(true);
    selectedNodes();
  }

  const clearAssociated = () => {
    for (let n=0;n<associatedNodes.length; n++) {
      let item = associatedNodes[n];
      item.associated = false;
      delete item.associated;
    }
    for (let l=0;l<associatedLinks.length; l++) {
      let item = associatedLinks[l];
      let link = links.find(i=>i.refId===item);
      link.associated = false;
      delete link.associated;
    }
    associatedNodes = [];
    associatedLinks = [];
    selectedNode.selected=false;
    delete selectedNode.selected;
    textContainer.removeChildren();
    redraw();
  };

  const selectedNodes = ()=> {
    clearAssociated();
    // get associated links
    let incomingLinks = links.filter(l=>l.target.id===selectedNode.id);
    let outgoingLinks = links.filter(l=>l.source.id===selectedNode.id);
    incomingLinks = incomingLinks.map(l=>l.refId);
    outgoingLinks = outgoingLinks.map(l=>l.refId);
    let newAssociatedLinks = incomingLinks.concat(outgoingLinks.filter(i => incomingLinks.indexOf(i)===-1));
    let mergedAssociatedLinks = newAssociatedLinks.concat(props.relatedLinks.filter(i => newAssociatedLinks.indexOf(i)===-1));
    if (mergedAssociatedLinks.length>0) {
      mergedAssociatedLinks = Array.from(new Set(mergedAssociatedLinks));
    }

    // associate new links
    let associatedNodeIds = [];
    mergedAssociatedLinks.forEach(l=>{
      let link = links.find(i=>i.refId===l);
      link.associated=true;
      let sourceId = link.source.id, targetId = link.target.id;
      if (associatedNodeIds.indexOf(sourceId)===-1) {
        associatedNodeIds.push(sourceId);
      }
      if (associatedNodeIds.indexOf(targetId)===-1) {
        associatedNodeIds.push(targetId);
      }
    });
    let mergedNodesIds = [...associatedNodeIds,...props.relatedNodes];
    // get associated nodes
    let newAssociatedNodes = nodes.filter(n=>mergedNodesIds.indexOf(n.id)>-1);

    // associate new nodes
    newAssociatedNodes.forEach(n=>{
      n.associated=true;
    });
    associatedNodes = newAssociatedNodes;
    associatedLinks = mergedAssociatedLinks;

    redraw();
  };

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
    setSearchContainerReload(true);
  }

  const searchNodeType = (e) =>{
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInputType(value);

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
    setSearchContainerReload(true);
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
    setSearchContainerReload(true);
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
  let step1Color = "light";
  let step2Color = "light";
  let step3Color = "light";
  let step4Color = "light";
  let step5Color = "light";
  let step6Color = "light";
  if (step===1) {
    step1Color = "secondary";
  }
  if (step===2) {
    step2Color = "secondary";
  }
  if (step===3) {
    step3Color = "secondary";
  }
  if (step===4) {
    step4Color = "secondary";
  }
  if (step===5) {
    step5Color = "secondary";
  }
  if (step===6) {
    step6Color = "secondary";
  }

  let detailsLoader = [];
  if (stepLoading) {
    detailsLoader = <Spinner className="node-details-loader" color="info" size="sm"/>;
  }
  let detailsCard =  <div className={"card graph-details-card"+detailsCardVisibleClass}>
      <div className="graph-details-card-close" onClick={()=>toggleDetailsCard()}>
        <i className="fa fa-times" />
      </div>
      <div className="card-title"><h4>Node details {detailsLoader}</h4></div>

      <div className="card-body">
        <div className="card-content">
          <div className="node-relations-title">
            <div>
              <label>Entity: </label> {nodeLink}
            </div>
            <div>
              <label>Steps:</label>{' '}
              <Badge color={step1Color} pill size="sm" onClick={()=>setSteps(1)}>1</Badge>{' '}
              <Badge color={step2Color} pill size="sm" onClick={()=>setSteps(2)}>2</Badge>{' '}
              <Badge color={step3Color} pill size="sm" onClick={()=>setSteps(3)}>3</Badge>{' '}
              <Badge color={step4Color} pill size="sm" onClick={()=>setSteps(4)}>4</Badge>{' '}
              <Badge color={step5Color} pill size="sm" onClick={()=>setSteps(5)}>5</Badge>{' '}
              <Badge color={step6Color} pill size="sm" onClick={()=>setSteps(6)}>6</Badge>
            </div>
          </div>
          <div>
            <label>Related nodes [<b>{relatedNodesHTML.length}</b>]</label>
          </div>
          <div  className="node-relations-list">
            <ul className="entries-list">{relatedNodesHTML}</ul>
          </div>
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
  if (!loading && data!==null) {
    searchContainerNodes = <GraphSearch nodes={data.nodes} centerNode={centerNode} reload={searchContainerReload} />;
  }
  let searchContainer = <div className={"graph-search-container"+searchContainerVisibleClass}>
    <div className="close-graph-search-container" onClick={()=>toggleSearchContainerVisible()}>
      <i className="fa fa-times" />
    </div>
    <FormGroup className="graph-search-input">
      <Input type="text" name="text" placeholder="Search node..." value={searchInput} onChange={(e)=>searchNode(e)}/>
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
  return (
    <div style={{position:"relative", display: "block"}}>
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
      <HelpArticle permalink={"network-graph-help"} visible={helpVisible} toggle={toggleHelp}/>
    </div>
  )
}
export default PersonNetwork;
