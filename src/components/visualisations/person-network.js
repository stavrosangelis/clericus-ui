import React, { useEffect, useState} from 'react';
import axios from 'axios';
import * as d3 from "d3";
import {Link} from 'react-router-dom';
import { Spinner, FormGroup, Input } from 'reactstrap';

const APIPath = process.env.REACT_APP_APIPATH;

/// d3 network

var canvas, ctx, nodes, links, width=600, height=600, transform={k:1,x:0,y:0}, associatedNodes=[], associatedLinks=[], selectedNode;

const zoomedEnd = async() => {
  if (d3.event!==null && d3.event.transform!==null) {
    transform = d3.event.transform;
  }
  let scale = transform.k;
  ctx.save();
  ctx.clearRect(0,0,width,height);
  ctx.translate(transform.x, transform.y);
  ctx.scale(scale, scale);
  drawLines(transform);
  drawNodes(transform);
  ctx.restore();
}

const zoom_handler = d3.zoom()
  .scaleExtent([0.1, 8])
  .on("zoom",zoomedEnd);

const drawNodes = (coords) => {
  let lx = coords.x;
  let ty = coords.y;
  let scale = coords.k;
  for (let i=0; i<nodes.length; i++) {
    let d = nodes[i];
    d.visible = false;
    d.radius = d.size;
    let radius = d.radius;
    let x = d.x;
    let y = d.y;
    let newX = lx+(x*scale);
    let newY = ty+(y*scale);
    if (newX>0 && newX<width && newY>0 && newY<height) {
      d.visible = true;
      let labelRows = d.label.split(" ").filter(i=>i!=="");
      ctx.beginPath();
      // circle
      if (typeof d.selected!=="undefined" && d.selected) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#33729f";
        radius+=5;
      }
      else if (typeof d.associated!=="undefined" && d.associated) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = d.strokeColor;
      }
      else {
        ctx.lineWidth = 1;
        ctx.strokeStyle = d.strokeColor;
      }
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = d.color;
      ctx.fill();
      ctx.stroke();
      let textX = x;
      let textY = y;
      let length = labelRows.length;
      if (length>2) {
        textY -= 6 ;
      }
      for (let t=0; t<labelRows.length; t++) {
        let label = labelRows[t];
        ctx.fillStyle = "#333333";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "Top";
        ctx.fillText(label, textX, textY)
        textY+=10;
      }

      ctx.closePath();
    }
  }
}

const drawLines = (coords) => {
  let coordsX = coords.x;
  let coordsY = coords.y;
  let scale = coords.k;
  //const colors = {1:'#DE9A96',2:'#F5D98B',3:'#FAF3A5',4:'#82CEB6',5:'#96E3E6',6:'#89BDE0'};
  for (let i=0; i<links.length; i++) {
    let d = links[i];
    let sx = d.source.x;
    let sy = d.source.y;
    let tx = d.target.x;
    let ty = d.target.y;

    let newX = coordsX+(sx*scale);
    let newY = coordsY+(sy*scale);
    if (newX>0 && newX<width && newY>0 && newY<height) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      if (typeof d.associated!=="undefined" && d.associated) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#33729f";
      }
      else {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#666";
      }
      let lineWidth = 0;
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
      ctx.fillStyle = "#666";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.label, textX, textY);

      ctx.stroke();
      ctx.closePath();
    }
  }
}


const PersonNetwork = props => {
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [data, setData] = useState(null);
  const [step, setStep] = useState(1);
  const [detailsCardVisible, setDetailsCardVisible] = useState(false);
  const [detailsCardEntityInfo, setDetailsCardEntityInfo] = useState([]);
  const [detailsCardContent, setDetailsCardContent] = useState([]);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const toggleDetailsCard = (value=null) => {
    let visible = !detailsCardVisible;
    if (value!==null) visible = value;
    setDetailsCardVisible(visible);
  }

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  }

  useEffect(()=> {
    const load = async() => {
      let _id = props._id;
      if (typeof _id==="undefined" || _id===null || _id==="") {
        return false;
      }
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'item-network',
        crossDomain: true,
        params: {_id:_id, step: step}
      })
      .then(function (response) {
        return JSON.parse(response.data.data);
      })
      .catch(function (error) {
      });
      setData(responseData);
      setDrawing(true);
    }
    if (loading) {
      load();
    }
  },[loading,props._id,step]);

  useEffect(()=> {
    const updateDimensions = () => {
      let container = document.getElementById('graph-container');
      width = container.offsetWidth-2;
      if (ctx.canvas!==null) {
        transform = {k:1,x:0,y:0};
        ctx.save();
        canvas.attr("width", width);
        ctx.clearRect(0,0,width,height);
        ctx.translate(0,0);
        ctx.scale(1, 1);
        drawLines(transform);
        drawNodes(transform);
        ctx.restore();
      }
      zoomedEnd();
    }

    const drawGraph = () => {
      setDrawing(false);
      let container = d3.select("#network-graph");
      container.html("");
      canvas = container
        .append("canvas")
        .attr("id", "visualisation-canvas")
  			.attr('width', width)
  			.attr('height', height);

      ctx = canvas.node().getContext('2d');
      nodes = data.nodes.map(d => Object.create(d));
      links = data.links.map(d => Object.create(d));

      nodes[0].fixed = true;
      nodes[0].x = width/2;
      nodes[0].y = height/2;
      let strength = -500;
      const simulation = d3.forceSimulation(nodes)
        .force("link",
        d3.forceLink(links)
            .id(d => d.id)
            .strength(d=>1)
            .distance(d=>200)
          )
        .force("charge", d3.forceManyBody().strength(strength))
        .force("center", d3.forceCenter(width/2, height/2))
        .force('collide', d3.forceCollide(60))
        .stop();

      // control ticks aka performance trick
      const iterations = 50;
      var threshold = 0.001;
      simulation.restart();
      for (var i = iterations; i > 0; --i) {
        simulation.tick();
        if(simulation.alpha() < threshold) {
          break;
        }
      }
      simulation.stop();

      d3.select("#graph-zoom-in")
      .on("click", function() {
        zoom_handler.scaleBy(canvas, 1.25);
      });
      d3.select("#graph-zoom-out")
      .on("click", function() {
        zoom_handler.scaleBy(canvas, 0.75);
      });
      d3.select("#graph-pan-up")
      .on("click", function() {
        let currentTransform = d3.zoomTransform(canvas);
        let newX = currentTransform.x;
        let newY = currentTransform.y - 50;
        zoom_handler.translateBy(canvas, newX, newY);
      });
      d3.select("#graph-pan-right")
      .on("click", function() {
        let currentTransform = d3.zoomTransform(canvas);
        let newX = currentTransform.x + 50;
        let newY = currentTransform.y;
        zoom_handler.translateBy(canvas, newX, newY);
      });
      d3.select("#graph-pan-down")
      .on("click", function() {
        let currentTransform = d3.zoomTransform(canvas);
        let newX = currentTransform.x;
        let newY = currentTransform.y + 50;
        zoom_handler.translateBy(canvas, newX, newY);
      });
      d3.select("#graph-pan-left")
      .on("click", function() {
        let currentTransform = d3.zoomTransform(canvas);
        let newX = currentTransform.x - 50;
        let newY = currentTransform.y;
        zoom_handler.translateBy(canvas, newX, newY);
      });

      zoom_handler(d3.select(ctx.canvas));
      updateDimensions();
    }
    if (drawing && data!==null) {
      drawGraph();
    }
  },[drawing, data]);

  useEffect(()=>{
    const updateCanvasSize = () => {
      let container = document.getElementById('graph-container');
      width = container.offsetWidth-2;
    }
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('click', clickNode);
    return(()=> {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('click', clickNode);
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
        console.log(source)
        console.log(segments[prevIndex].target)
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
      let linkArray = ["Classpiece", "Organisation", "Person"];
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

  const clickNode = (e) => {
    if (e.target.getAttribute("id")!=="visualisation-canvas") {
      return false;
    }
    let visibleNodes = nodes.filter(n=>n.visible);
    let transformX = transform.x;
    let transformY = transform.y;
    let scale = transform.k;
    let x = e.offsetX/scale;
    let y = e.offsetY/scale;
    // locate node
    let clickedNodes = [];
    for (let i=0; i<visibleNodes.length; i++) {
      let d = visibleNodes[i];
      let dx = d.x;
      let dy = d.y;
      let radius = d.radius;
      let lx = dx-radius+transformX/scale;
      let rx = dx+radius+transformX/scale;
      let ty = dy-radius+transformY/scale;
      let by = dy+radius+transformY/scale;

      if (x>=lx && x<=rx && y>=ty && y<=by) {
        clickedNodes.push(d);
      }
    }
    clickedNodes.sort((a,b)=>{
      let keyA=a.index;
      let keyB=b.index;
      if (keyA>keyB) return -1;
      if (keyA<keyB) return 1;
      return 0;
    });
    let clickedNode = null;
    if (clickedNodes.length>0) {
      clickedNode = clickedNodes[0];
    }
    else {
      return false;
    }
    clickedNode.selected=true;
    // load node details ;
    loadNodeDetails(clickedNode.id);
    toggleDetailsCard(true);
    if (selectedNode!==null) {
      let prevNode = nodes.find(n=>n===selectedNode);
      if (typeof prevNode!=="undefined") {
        delete prevNode.selected;
      }
    }
    selectedNode = clickedNode;
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

    let scale = transform.k;
    ctx.save();
    ctx.clearRect(0,0,width,height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(scale, scale);
    drawLines(transform);
    drawNodes(transform);
    ctx.restore();
  };

  const updateStep = (value) => {
    setStep(value);
    setLoading(true);
  }

  const searchNode = (e) =>{
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInput(value);
    let visibleNodes = data.nodes.filter(n=>n.label.toLowerCase().includes(value.toLowerCase()));
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
      zoom_handler.translateTo(canvas, node.x, node.y);
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
        searchContainerNodes.push(<div key={i} onClick={()=>centerNode(n.id)}>{n.label}</div>);
      }
    }
  }
  let searchContainer = <div className={"graph-search-container"+searchContainerVisibleClass}>
    <div className="close-graph-search-container" onClick={()=>toggleSearchContainerVisible()}>
      <i className="fa fa-times" />
    </div>
    <FormGroup className="graph-search-input">
      <Input type="text" name="text" placeholder="Search node..." value={searchInput} onChange={(e)=>searchNode(e)}/>
      <i className="fa fa-times-circle" onClick={()=>clearSearchNode()}/>
    </FormGroup>
    <div className="graph-search-container-nodes">
      {searchContainerNodes}
    </div>
  </div>
  return (
    <div style={{position:"relative", display: "block"}}>
      <div id="network-graph"></div>
      <div className="graph-actions">
        {panPanel}
        {zoomPanel}
        {searchIcon}
        {stepsPanel}
      </div>
      {detailsCard}
      {searchContainer}
    </div>
  )
}
export default PersonNetwork;
