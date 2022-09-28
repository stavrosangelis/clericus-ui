import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import { Link } from 'react-router-dom';
import { Label, Spinner, FormGroup, Input } from 'reactstrap';
import PropTypes from 'prop-types';

const { REACT_APP_APIPATH: APIPath } = process.env;

/// d3 network

let canvas;
let ctx;
let nodes;
let links;
let width = 600;
const height = 600;
let transform = { k: 1, x: 0, y: 0 };
let associatedNodes = [];
let associatedLinks = [];
let selectedNode;

const drawNodes = (coords) => {
  const lx = coords.x;
  const ty = coords.y;
  const scale = coords.k;
  for (let i = 0; i < nodes.length; i += 1) {
    const d = nodes[i];
    d.visible = false;
    d.radius = d.size;
    let { radius } = d;
    const { x } = d;
    const { y } = d;
    const newX = lx + x * scale;
    const newY = ty + y * scale;
    if (newX > 0 && newX < width && newY > 0 && newY < height) {
      d.visible = true;
      const labelRows = d.label.split(' ').filter((j) => j !== '');
      ctx.beginPath();
      // circle
      if (typeof d.selected !== 'undefined' && d.selected) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#33729f';
        radius += 5;
      } else if (typeof d.associated !== 'undefined' && d.associated) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = d.strokeColor;
      } else {
        ctx.lineWidth = 1;
        ctx.strokeStyle = d.strokeColor;
      }
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = d.color;
      ctx.fill();
      ctx.stroke();
      const textX = x;
      let textY = y;
      const { length } = labelRows;
      if (length > 2) {
        textY -= 6;
      }
      for (let t = 0; t < labelRows.length; t += 1) {
        const label = labelRows[t];
        ctx.fillStyle = '#333333';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'Top';
        ctx.fillText(label, textX, textY);
        textY += 10;
      }

      ctx.closePath();
    }
  }
};

const drawLines = (coords) => {
  const coordsX = coords.x;
  const coordsY = coords.y;
  const scale = coords.k;
  // const colors = {1:'#DE9A96',2:'#F5D98B',3:'#FAF3A5',4:'#82CEB6',5:'#96E3E6',6:'#89BDE0'};
  for (let i = 0; i < links.length; i += 1) {
    const d = links[i];
    const sx = d.source.x;
    const sy = d.source.y;
    const tx = d.target.x;
    const ty = d.target.y;

    const newX = coordsX + sx * scale;
    const newY = coordsY + sy * scale;
    if (newX > 0 && newX < width && newY > 0 && newY < height) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      if (typeof d.associated !== 'undefined' && d.associated) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#33729f';
      } else {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#666';
      }
      let lineWidth = 0;
      let lineHeight = 0;
      let textX = 0;
      let textY = 0;
      let smallX;
      let smallY;
      if (sx > tx) {
        smallX = tx;
        lineWidth = sx - tx;
      } else {
        smallX = sx;
        lineWidth = tx - sx;
      }
      textX = smallX + lineWidth / 2;
      if (sy > ty) {
        smallY = ty;
        lineHeight = sy - ty;
      } else {
        smallY = sy;
        lineHeight = ty - sy;
      }
      textY = smallY + lineHeight / 2;
      ctx.fillStyle = '#666';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, textX, textY);

      ctx.stroke();
      ctx.closePath();
    }
  }
};

const zoomedEnd = async () => {
  if (d3.event !== null && d3.event.transform !== null) {
    transform = d3.event.transform;
  }
  const scale = transform.k;
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.translate(transform.x, transform.y);
  ctx.scale(scale, scale);
  drawLines(transform);
  drawNodes(transform);
  ctx.restore();
};

const zoomHandler = d3.zoom().scaleExtent([0.1, 8]).on('zoom', zoomedEnd);

const ClasspieceNetwork = (props) => {
  // state
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [data, setData] = useState(null);
  const [step, setStep] = useState(1);
  const [detailsCardVisible, setDetailsCardVisible] = useState(false);
  const [detailsCardEntityInfo, setDetailsCardEntityInfo] = useState([]);
  const [detailsCardContent, setDetailsCardContent] = useState([]);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // props
  const { _id, relatedLinks, relatedNodes } = props;

  const toggleDetailsCard = (value = null) => {
    let visible = !detailsCardVisible;
    if (value !== null) visible = value;
    setDetailsCardVisible(visible);
  };

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  };

  const clearAssociated = () => {
    for (let n = 0; n < associatedNodes.length; n += 1) {
      const item = associatedNodes[n];
      item.associated = false;
      delete item.associated;
    }
    for (let l = 0; l < associatedLinks.length; l += 1) {
      const item = associatedLinks[l];
      const link = links.find((i) => i.refId === item);
      link.associated = false;
      delete link.associated;
    }
    associatedNodes = [];
    associatedLinks = [];
  };

  const selectedNodes = () => {
    clearAssociated();
    // get associated links
    let incomingLinks = links.filter((l) => l.target.id === selectedNode.id);
    let outgoingLinks = links.filter((l) => l.source.id === selectedNode.id);
    incomingLinks = incomingLinks.map((l) => l.refId);
    outgoingLinks = outgoingLinks.map((l) => l.refId);

    const newAssociatedLinks = incomingLinks.concat(
      outgoingLinks.filter((i) => incomingLinks.indexOf(i) === -1)
    );
    let mergedAssociatedLinks = newAssociatedLinks.concat(
      relatedLinks.filter((i) => newAssociatedLinks.indexOf(i) === -1)
    );
    if (mergedAssociatedLinks.length > 0) {
      mergedAssociatedLinks = Array.from(new Set(mergedAssociatedLinks));
    }

    // associate new links
    const associatedNodeIds = [];
    mergedAssociatedLinks.forEach((l) => {
      const link = links.find((i) => i.refId === l);
      link.associated = true;
      const sourceId = link.source.id;
      const targetId = link.target.id;
      if (associatedNodeIds.indexOf(sourceId) === -1) {
        associatedNodeIds.push(sourceId);
      }
      if (associatedNodeIds.indexOf(targetId) === -1) {
        associatedNodeIds.push(targetId);
      }
    });
    const mergedNodesIds = [...associatedNodeIds, ...relatedNodes];
    // get associated nodes
    const newAssociatedNodes = nodes.filter(
      (n) => mergedNodesIds.indexOf(n.id) > -1
    );

    // associate new nodes
    newAssociatedNodes.forEach((n) => {
      const copy = n;
      copy.associated = true;
      return copy;
    });
    associatedNodes = newAssociatedNodes;
    associatedLinks = mergedAssociatedLinks;

    const scale = transform.k;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(scale, scale);
    drawLines(transform);
    drawNodes(transform);
    ctx.restore();
  };

  const parseSegments = (segments, i) => {
    const output = [];
    for (let j = 0; j < segments.length; j += 1) {
      const segment = segments[j];
      const { source } = segment;
      const { target } = segment;
      const { relationship } = segment;
      const linkArray = ['Classpiece', 'Organisation', 'Person'];
      const sourceType = source.type;
      const targetType = target.type;
      let sourceLabel = (
        <span>
          {source.label} <small>[{source.type}]</small>
        </span>
      );
      let targetLabel = (
        <span>
          {target.label} <small>[{target.type}]</small>
        </span>
      );
      if (linkArray.indexOf(sourceType) > -1) {
        const sourceHref = `/${source.type.toLowerCase()}/${source._id}`;
        sourceLabel = (
          <Link to={sourceHref} href={sourceHref}>
            {source.label} <small>[{source.type}]</small>
          </Link>
        );
      }
      if (linkArray.indexOf(targetType) > -1) {
        const targetHref = `/${target.type.toLowerCase()}/${target._id}`;
        targetLabel = (
          <Link to={targetHref} href={targetHref}>
            {target.label} <small>[{target.type}]</small>
          </Link>
        );
      }
      const returnItem = [];
      const sourceItem = (
        <div className="source" key={`source-${i}`}>
          {sourceLabel}
        </div>
      );
      const prevIndex = j - 1;
      if (i === 0) {
        returnItem.push(sourceItem);
      } else if (j > 0 && source._id !== segments[prevIndex].target._id) {
        returnItem.push(sourceItem);
      }
      returnItem.push(
        <div className="relationship" key={`relationship-${j}`}>
          {relationship.type}
          <div className="line" />
          <div className="arrow" />
        </div>
      );
      returnItem.push(
        <div className="target" key={`target-${j}`}>
          {targetLabel}
        </div>
      );
      output.push(returnItem);
    }
    const outputHTML = <li key={i}>{output}</li>;
    return outputHTML;
  };

  const loadNodeDetails = async (paramsId) => {
    if (paramsId === _id) {
      const node = data.nodes.find((n) => n.id === paramsId);
      if (typeof node !== 'undefined') {
        setDetailsCardEntityInfo(node.label);
        setDetailsCardContent('');
      }
    } else {
      setDetailsCardEntityInfo('');
      setDetailsCardContent(
        <div style={{ padding: '20pt', textAlign: 'center' }}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      );
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}item-network-related-paths`,
        crossDomain: true,
        params: { sourceId: _id, targetId: paramsId, step },
      })
        .then((response) => response.data.data)
        .catch((error) => console.log(error));
      const { source } = responseData[0];
      const { target } = responseData[0];
      const segments = [];
      for (let i = 0; i < responseData.length; i += 1) {
        const responseDataItem = responseData[i];
        const segmentsHTML = parseSegments(responseDataItem.segments, i);
        segments.push(
          <div key={i} className="related-nodes-paths-block">
            <div className="related-nodes-paths-count">[{i + 1}]</div>
            <ul className="related-nodes-paths">{segmentsHTML}</ul>
          </div>
        );
      }
      const linkArray = ['Classpiece', 'Organisation', 'Person'];
      const sourceType = source.type;
      const targetType = target.type;
      let sourceLabel = <span>{source.label}</span>;
      let targetLabel = <span>{target.label}</span>;
      if (linkArray.indexOf(sourceType) > -1) {
        const sourceHref = `/${source.type.toLowerCase()}/${source._id}`;
        sourceLabel = (
          <Link href={sourceHref} to={sourceHref}>
            <span>{source.label}</span>
          </Link>
        );
      }
      if (linkArray.indexOf(targetType) > -1) {
        const targetHref = `/${target.type.toLowerCase()}/${target._id}`;
        targetLabel = (
          <Link href={targetHref} to={targetHref}>
            <span>{target.label}</span>
          </Link>
        );
      }
      const title = (
        <div className="related-nodes-paths-label">
          <div className="source">
            <Label>Source</Label>: {sourceLabel}
          </div>
          <div className="target">
            <Label>Target</Label>: {targetLabel}
          </div>
        </div>
      );
      setDetailsCardEntityInfo(title);
      setDetailsCardContent(segments);
    }
  };

  const clickNode = (e) => {
    if (e.target.getAttribute('id') !== 'visualisation-canvas') {
      return false;
    }
    const visibleNodes = nodes.filter((n) => n.visible);
    const transformX = transform.x;
    const transformY = transform.y;
    const scale = transform.k;
    const x = e.offsetX / scale;
    const y = e.offsetY / scale;
    // locate node
    const clickedNodes = [];
    for (let i = 0; i < visibleNodes.length; i += 1) {
      const d = visibleNodes[i];
      const dx = d.x;
      const dy = d.y;
      const { radius } = d;
      const lx = dx - radius + transformX / scale;
      const rx = dx + radius + transformX / scale;
      const ty = dy - radius + transformY / scale;
      const by = dy + radius + transformY / scale;

      if (x >= lx && x <= rx && y >= ty && y <= by) {
        clickedNodes.push(d);
      }
    }
    clickedNodes.sort((a, b) => {
      const keyA = a.index;
      const keyB = b.index;
      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });
    let clickedNode = null;
    if (clickedNodes.length > 0) {
      [clickedNode] = clickedNodes;
    } else {
      return false;
    }
    clickedNode.selected = true;
    // load node details ;
    loadNodeDetails(clickedNode.id);
    toggleDetailsCard(true);
    if (selectedNode !== null) {
      const prevNode = nodes.find((n) => n === selectedNode);
      if (typeof prevNode !== 'undefined') {
        delete prevNode.selected;
      }
    }
    selectedNode = clickedNode;
    selectedNodes();
    return false;
  };

  useEffect(() => {
    const load = async () => {
      if (_id === null || _id === '') {
        return false;
      }
      setLoading(false);
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}item-network`,
        crossDomain: true,
        params: { _id, step },
      })
        .then((response) => JSON.parse(response.data.data))
        .catch((error) => console.log(error));
      setData(responseData);
      setDrawing(true);
      return false;
    };
    if (loading) {
      load();
    }
  }, [loading, _id, step]);

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('graph-container');
      width = container.offsetWidth - 2;
      if (ctx.canvas !== null) {
        transform = { k: 1, x: 0, y: 0 };
        ctx.save();
        canvas.attr('width', width);
        ctx.clearRect(0, 0, width, height);
        ctx.translate(0, 0);
        ctx.scale(1, 1);
        drawLines(transform);
        drawNodes(transform);
        ctx.restore();
      }
      zoomedEnd();
    };

    const drawGraph = () => {
      setDrawing(false);
      const container = d3.select('#network-graph');
      container.html('');
      canvas = container
        .append('canvas')
        .attr('id', 'visualisation-canvas')
        .attr('width', width)
        .attr('height', height);

      ctx = canvas.node().getContext('2d');
      nodes = data.nodes.map((d) => Object.create(d));
      links = data.links.map((d) => Object.create(d));

      nodes[0].fixed = true;
      nodes[0].x = width / 2;
      nodes[0].y = height / 2;
      const strength = -500;
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          'link',
          d3
            .forceLink(links)
            .id((d) => d.id)
            .strength(() => 1)
            .distance(() => 200)
        )
        .force('charge', d3.forceManyBody().strength(strength))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide(60))
        .stop();

      // control ticks aka performance trick
      const iterations = 50;
      const threshold = 0.001;
      simulation.restart();
      for (let i = iterations; i > 0; i -= 1) {
        simulation.tick();
        if (simulation.alpha() < threshold) {
          break;
        }
      }
      simulation.stop();

      d3.select('#graph-zoom-in').on('click', () => {
        zoomHandler.scaleBy(canvas, 1.25);
      });
      d3.select('#graph-zoom-out').on('click', () => {
        zoomHandler.scaleBy(canvas, 0.75);
      });
      d3.select('#graph-pan-up').on('click', () => {
        const currentTransform = d3.zoomTransform(canvas);
        const newX = currentTransform.x;
        const newY = currentTransform.y - 50;
        zoomHandler.translateBy(canvas, newX, newY);
      });
      d3.select('#graph-pan-right').on('click', () => {
        const currentTransform = d3.zoomTransform(canvas);
        const newX = currentTransform.x + 50;
        const newY = currentTransform.y;
        zoomHandler.translateBy(canvas, newX, newY);
      });
      d3.select('#graph-pan-down').on('click', () => {
        const currentTransform = d3.zoomTransform(canvas);
        const newX = currentTransform.x;
        const newY = currentTransform.y + 50;
        zoomHandler.translateBy(canvas, newX, newY);
      });
      d3.select('#graph-pan-left').on('click', () => {
        const currentTransform = d3.zoomTransform(canvas);
        const newX = currentTransform.x - 50;
        const newY = currentTransform.y;
        zoomHandler.translateBy(canvas, newX, newY);
      });

      zoomHandler(d3.select(ctx.canvas));
      updateDimensions();
    };
    if (drawing && data !== null) {
      drawGraph();
    }
  }, [drawing, data]);

  useEffect(() => {
    const updateCanvasSize = () => {
      const container = document.getElementById('graph-container');
      width = container.offsetWidth - 2;
    };
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('click', clickNode);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('click', clickNode);
    };
  });

  const updateStep = (value) => {
    setStep(value);
    setLoading(true);
  };

  const searchNode = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInput(value);
    const visibleNodes = data.nodes.filter((n) =>
      n.label.toLowerCase().includes(value.toLowerCase())
    );
    const dataNodes = data.nodes;
    for (let i = 0; i < dataNodes.length; i += 1) {
      const n = dataNodes[i];
      if (visibleNodes.indexOf(n) > -1) {
        n.visible = true;
      } else n.visible = false;
    }
    data.nodes = dataNodes;
    setData(data);
  };

  const clearSearchNode = () => {
    setSearchInput('');
    const dataNodes = data.nodes;
    for (let i = 0; i < dataNodes.length; i += 1) {
      const n = dataNodes[i];
      n.visible = true;
    }
    data.nodes = dataNodes;
    setData(data);
  };

  const centerNode = (paramsId) => {
    const node = nodes.find((n) => n.id === paramsId);
    if (typeof node !== 'undefined') {
      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        n.selected = false;
      }
      node.selected = true;
      zoomHandler.translateTo(canvas, node.x, node.y);
    }
  };

  const searchIcon = (
    <div
      className="graph-search-toggle"
      onClick={() => toggleSearchContainerVisible()}
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="toggle search container"
    >
      <i className="fa fa-search" />
    </div>
  );
  const panPanel = (
    <div className="pan-container">
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
  );
  const zoomPanel = (
    <div className="zoom-panel">
      <div id="graph-zoom-in" className="zoom-action">
        <i className="fa fa-plus" />
      </div>
      <div id="graph-zoom-out" className="zoom-action">
        <i className="fa fa-minus" />
      </div>
    </div>
  );
  let step1Active = '';
  let step2Active = '';
  let step3Active = '';
  let step4Active = '';
  let step5Active = '';
  let step6Active = '';
  if (step === 1) step1Active = ' active color1';
  if (step === 2) step2Active = ' active color2';
  if (step === 3) step3Active = ' active color3';
  if (step === 4) step4Active = ' active color4';
  if (step === 5) step5Active = ' active color5';
  if (step === 6) step6Active = ' active color6';
  const stepsPanel = (
    <div className="zoom-panel">
      <div
        className={`zoom-action${step1Active}`}
        onClick={() => updateStep(1)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="set step 1"
      >
        1
      </div>
      <div
        className={`zoom-action${step2Active}`}
        onClick={() => updateStep(2)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="set step 2"
      >
        2
      </div>
      <div
        className={`zoom-action${step3Active}`}
        onClick={() => updateStep(3)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="set step 3"
      >
        3
      </div>
      <div
        className={`zoom-action${step4Active}`}
        onClick={() => updateStep(4)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="set step 4"
      >
        4
      </div>
      <div
        className={`zoom-action${step5Active}`}
        onClick={() => updateStep(5)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="set step 5"
      >
        5
      </div>
      <div
        className={`zoom-action${step6Active}`}
        onClick={() => updateStep(6)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="set step 6"
      >
        6
      </div>
    </div>
  );

  let detailsCardVisibleClass = ' hidden';
  if (detailsCardVisible) {
    detailsCardVisibleClass = '';
  }
  const detailsCard = (
    <div className={`card graph-details-card${detailsCardVisibleClass}`}>
      <div
        className="graph-details-card-close"
        onClick={() => toggleDetailsCard()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="hide details"
      >
        <i className="fa fa-times" />
      </div>
      <div className="card-title">
        <h4>Node details</h4>
      </div>
      <div className="card-body">
        <div className="entity-info">{detailsCardEntityInfo}</div>
        <div className="card-content">{detailsCardContent}</div>
        <div className="card-footer">
          <button
            type="button"
            className="btn btn-xs btn-outline btn-secondary"
            onClick={() => toggleDetailsCard()}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
  let searchContainerVisibleClass = '';
  if (searchContainerVisible) {
    searchContainerVisibleClass = ' visible';
  }
  const searchContainerNodes = [];
  if (!loading && data !== null) {
    for (let i = 0; i < data.nodes.length; i += 1) {
      const n = data.nodes[i];
      if (typeof n.visible === 'undefined' || n.visible === true) {
        searchContainerNodes.push(
          <div
            key={i}
            onClick={() => centerNode(n.id)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="center view to node"
          >
            {n.label}
          </div>
        );
      }
    }
  }
  const searchContainer = (
    <div className={`graph-search-container${searchContainerVisibleClass}`}>
      <div
        className="close-graph-search-container"
        onClick={() => toggleSearchContainerVisible()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle search container"
      >
        <i className="fa fa-times" />
      </div>
      <FormGroup className="graph-search-input">
        <Input
          type="text"
          name="text"
          placeholder="Search node..."
          value={searchInput}
          onChange={(e) => searchNode(e)}
        />
        <i
          className="fa fa-times-circle"
          onClick={() => clearSearchNode()}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="clear nod search"
        />
      </FormGroup>
      <div className="graph-search-container-nodes">{searchContainerNodes}</div>
    </div>
  );
  return (
    <div style={{ position: 'relative', display: 'block' }}>
      <div id="network-graph" />
      <div className="graph-actions">
        {panPanel}
        {zoomPanel}
        {searchIcon}
        {stepsPanel}
      </div>
      {detailsCard}
      {searchContainer}
    </div>
  );
};
ClasspieceNetwork.defaultProps = {
  _id: '',
  relatedLinks: [],
  relatedNodes: [],
};
ClasspieceNetwork.propTypes = {
  _id: PropTypes.string,
  relatedLinks: PropTypes.array,
  relatedNodes: PropTypes.array,
};
export default ClasspieceNetwork;
