import React, { useEffect, useState} from 'react';
import axios from 'axios';
import * as d3 from "d3";
import {Link} from 'react-router-dom';
import { Spinner, FormGroup, Input } from 'reactstrap';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import dataWorker from "./person-data.worker.js";
import simulationWorker from "./force-simulation.worker.js";
const APIPath = process.env.REACT_APP_APIPATH;

/// d3 network

var app, container, nodes, links, width=600, height=600, resolution=window.devicePixelRatio || 1, transform={s:1,x:0,y:0}, associatedNodes=[], associatedLinks=[], selectedNode, lineContainer, nodesContainer, textContainer, publicFunctions = {};

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
  redraw()
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
    for (let i=0; i<nodes.length; i++) {
      let d = nodes[i];
      d.visible = false;
      let radius = d.size;
      let x = d.x;
      let y = d.y;
      if (
        leftX<=x && rightX>=x
        && topY<=y && bottomY>=y
      ) {
        d.gfx = new PIXI.Graphics();
        d.gfx.interactive = true;
        d.gfx.on("click", ()=>publicFunctions.clickNode(d))
        d.gfx.on("tap", ()=>publicFunctions.clickNode(d))
        let lineWidth = 1;
        let strokeStyle = hexColor(d.strokeColor);
        d.visible = true;
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
          label = label.replace(/\s/g,"\n");
          let text = new PIXI.BitmapText(label,{font: `11px Arial`, align : 'center'});
          text.x = x-((radius/2)+(lineWidth*2));
          text.y = y-(10*minusY);
          textContainer.addChild(text);
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
  for (let i=0; i<links.length; i++) {
    let d = links[i];
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
        lWidth = 2;
        strokeStyle = 0x33729f;
      }
      line.lineStyle(lWidth,strokeStyle);
      line.moveTo(sx, sy);
      line.lineTo(tx, ty);
      lineContainer.addChild(line);
      // line label
      /*let lineWidth = 0;
      let lineHeight = 0;
      let textX = 0;
      let textY = 0;
      let smallX,smallY;
      if (sx>tx) {
        smallX = tx;
        lineWidth = sx-tx;
      }
      else {
        smallX = sx;
        lineWidth = tx-sx;
      }
      textX = smallX+(lineWidth/2);
      if (sy>ty) {
        smallY = ty;
        lineHeight = sy-ty;
      }
      else {
        smallY = sy;
        lineHeight = ty-sy;
      }
      textY= smallY+(lineHeight/2);
      let text = new PIXI.Text(d.label,{fontFamily : 'sans-serif', fontSize: 9, fill : 0x666666, align : 'center'});
      text.x = textX;
      text.y = textY;
      lineContainer.addChild(text);*/
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
  const [step, setStep] = useState(1);
  const [detailsCardVisible, setDetailsCardVisible] = useState(false);
  const [detailsCardEntityInfo, setDetailsCardEntityInfo] = useState([]);
  const [detailsCardContent, setDetailsCardContent] = useState([]);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchInputType, setSearchInputType] = useState("");

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
      setLoading(false);
      let workerParams = {_id:_id, step: step, APIPath:APIPath};
      dataLoadingWorker.postMessage(workerParams);
      let newData = await new Promise ((resolve,reject)=>{
        dataLoadingWorker.addEventListener('message',(e) =>{
          resolve(e.data);
        }, false);
      });
      setData(newData.data);
      setDrawing(true);
      setSearchInput("");
      setSearchInputType("");
    }
    if (loading) {
      load();
    }
  },[loading,props._id,step]);


  useEffect(()=> {
    const drawGraph = async() => {
      setDrawing(false);
      setDrawingIndicator("simulating...");
      let centerX = width/2;
      let centerY = height/2;
      transform.x = centerX;
      transform.y = centerY;

      transformEnd();

      let simulationParams = {nodes:data.nodes, links: data.links, centerX:centerX,centerY:centerY};
      forceSimulationWorker.postMessage(simulationParams);
      let simulation = await new Promise ((resolve,reject)=>{
        forceSimulationWorker.addEventListener('message',(e) =>{
          resolve(e.data);
        }, false);
      });
      setDrawingIndicator("drawing...");
      nodes = simulation.data.nodes;
      links = simulation.data.links;

      // recenter viewport
      container.moveCenter(nodes[0].x, nodes[0].y)

      d3.select("#graph-zoom-in")
      .on("click", function() {
        container.zoomPercent(0.25, true);
        zoomedEnd();
      });
      d3.select("#graph-zoom-out")
      .on("click", function() {
        if(container.scaled<0.15) {
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

      lineContainer.destroy();
      nodesContainer.destroy();
      textContainer.destroy();
      lineContainer = new PIXI.Container();
      nodesContainer = new PIXI.Container();
      textContainer = new PIXI.Container();
      container.addChild(lineContainer);
      container.addChild(nodesContainer);
      container.addChild(textContainer);

      drawLines();
      drawNodes();
      setDrawingIndicator("drawing complete.");
      setTimeout(()=>{setDrawingIndicator("");},1000);
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

  const parseSegments = (segments, i) => {
    let output = [];
    for (let i=0;i<segments.length; i++) {
      let segment = segments[i];
      let source = segment.source;
      let target = segment.target;
      let relationship = segment.relationship;
      let linkArray = ["Classpiece", "Organisation", "Person"];
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

  const loadNodeDetails = async(_id) => {
    if (_id===props._id) {
      let node = data.nodes.find(n=>n.id===_id);
      if (typeof node!=="undefined") {
        setDetailsCardEntityInfo(node.label);
        setDetailsCardContent("");
      }
    }
    else {
      setDetailsCardEntityInfo("");
      setDetailsCardContent(<div style={{padding: '20pt',textAlign: 'center'}}>
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'item-network-related-paths',
        crossDomain: true,
        params: {sourceId:props._id,targetId:_id,step:step}
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      let source = responseData[0].source;
      let target = responseData[0].target;
      let segments = [];
      for (let i=0;i<responseData.length; i++) {
        let responseDataItem = responseData[i];
        let segmentsHTML = parseSegments(responseDataItem.segments, i);
        segments.push(<div key={i} className="related-nodes-paths-block">
          <div className="related-nodes-paths-count">[{i+1}]</div>
          <ul className="related-nodes-paths">{segmentsHTML}</ul>
        </div>);
      }
      let linkArray = ["Classpiece", "Organisation", "Person", "Event"];
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
    }
  }

  publicFunctions.clickNode = (d)=> {
    let prevNode = nodes.find(n=>n.selected);
    if (typeof prevNode!=="undefined") {
      delete prevNode.selected;
    }
    d.selected=true;
    selectedNode = nodes.find(n=>n.id===d.id);
    // load node details ;
    loadNodeDetails(d.id);
    toggleDetailsCard(true);
    selectedNodes();
  }

  const clearAssociated = () => {
    for (let n=0;n<associatedNodes.length; n++) {
      let item = associatedNodes[n];
      if (typeof item!=="undefined") {
        item.associated = false;
        delete item.associated;
      }
    }
    for (let l=0;l<associatedLinks.length; l++) {
      let item = associatedLinks[l];
      let link = links.find(i=>i.refId===item);
      if (typeof link!=="undefined") {
        link.associated = false;
        delete link.associated;
      }
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

  const updateStep = (value) => {
    setStep(value);
    setLoading(true);
  }

  const searchNode = (e) =>{
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInput(value);
    let visibleNodes = data.nodes.filter(n=>{
      if (searchInputType!=="") {
        if (n.type===searchInputType && n.label.toLowerCase().includes(value.toLowerCase())) {
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
  }

  const searchNodeType = (e) =>{
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInputType(value);

    let visibleNodes = data.nodes.filter(n=>{
      if (n.type===value && n.label.toLowerCase().includes(searchInput.toLowerCase())) {
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

  const searchIcon = <div className="graph-search-toggle" onClick={()=>toggleSearchContainerVisible()}>
    <i className="fa fa-search" />
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
  let step1Active = "", step2Active = "", step3Active = "", step4Active = "", step5Active = "", step6Active = "";
  if (step===1) step1Active = " active color1";
  if (step===2) step2Active = " active color2";
  if (step===3) step3Active = " active color3";
  if (step===4) step4Active = " active color4";
  if (step===5) step5Active = " active color5";
  if (step===6) step6Active = " active color6";
  const stepsPanel = <div className="zoom-panel">
    <div className={"zoom-action"+step1Active} onClick={()=>updateStep(1)}>1</div>
    <div className={"zoom-action"+step2Active} onClick={()=>updateStep(2)}>2</div>
    <div className={"zoom-action"+step3Active} onClick={()=>updateStep(3)}>3</div>
    <div className={"zoom-action"+step4Active} onClick={()=>updateStep(4)}>4</div>
    <div className={"zoom-action"+step5Active} onClick={()=>updateStep(5)}>5</div>
    <div className={"zoom-action"+step6Active} onClick={()=>updateStep(6)}>6</div>
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
  if (!loading && data!==null) {
    for (let i=0;i<data.nodes.length; i++) {
      let n = data.nodes[i];
      if (typeof n.visible==="undefined" || n.visible===true) {
        searchContainerNodes.push(<div key={i} onClick={()=>centerNode(n.id)}>{n.label} <small>[{n.type}]</small></div>);
      }
    }
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
    <div className="graph-search-container-nodes">
      {searchContainerNodes}
    </div>
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
        {stepsPanel}
      </div>
      {detailsCard}
      {searchContainer}
      {legendPanel}
    </div>
  )
}
export default PersonNetwork;
