import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import { Link } from 'react-router-dom';
import { Label, Collapse, FormGroup, Input, Spinner } from 'reactstrap';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import PropTypes from 'prop-types';

import DataWorker from './Person.data.worker';
import { debounce, jsonStringToObject, webglSupport } from '../../helpers';
import LazyList from '../Lazylist';

const APIPath = process.env.REACT_APP_APIPATH;

const HelpArticle = lazy(() => import('../Help.article'));

/// d3 network

let app;
let container;
let nodes;
let links;
let width = 600;
const height = 400;
const resolution = window.devicePixelRatio || 1;
const transform = { s: 1, x: 0, y: 0 };
let selectedNode;
let lineContainer;
let nodesContainer;
const publicFunctions = {};

const transformEnd = () => {
  container.screenWidth = width;
  container.options.screenWidth = width;
  app.renderer.resize(width, height);
  const point = container.center;
  transform.x = point.x;
  transform.y = point.y;
};

const hexColor = (value) => value.replace('#', '0x');

const loader = new PIXI.Loader();

const drawNodes = async () => {
  if (typeof nodes === 'undefined') {
    return false;
  }
  if (typeof loader.resources.Arial === 'undefined') {
    loader.add('Arial', '/arial-bitmap/Arial.xml');
  }
  loader.load(() => {
    const bbox = container.getVisibleBounds();
    const { x: leftX, y: topY } = bbox;
    const rightX = bbox.x + bbox.width;
    const bottomY = bbox.y + bbox.height;
    const { length } = nodes;
    for (let i = 0; i < length; i += 1) {
      const d = nodes[i];
      const { x, y } = d;
      if (leftX < x && rightX > x && topY < y && bottomY > y) {
        let radius = d.size || 30;
        d.visible = true;
        d.gfx = new PIXI.Graphics();
        d.gfx.interactive = true;
        d.gfx.on('click', (e) => publicFunctions.clickNode(e, d));
        d.gfx.on('tap', (e) => publicFunctions.clickNode(e, d));
        let lineWidth = 1;
        let strokeStyle = hexColor(d.strokeColor);
        if (i === 0) {
          d.expanded = true;
        }
        // circle
        if (typeof d.selected !== 'undefined' && d.selected) {
          lineWidth = 5;
          strokeStyle = 0x33729f;
          radius += 5;
        } else if (typeof d.associated !== 'undefined' && d.associated) {
          lineWidth = 4;
          strokeStyle = 0x33729f;
          radius += 4;
        }
        d.gfx.beginFill(hexColor(d.color));
        if (container.scaled > 0.1) {
          d.gfx.lineStyle(lineWidth, strokeStyle);
        }
        d.gfx.drawCircle(x, y, radius);
        nodesContainer.addChild(d.gfx);
        if (d.label !== '' && container.scaled > 0.3) {
          const label = d.label.trim().replace(/  +/g, ' ');
          const spaces = label.split(' ');
          const minusY = spaces.length / 2;
          const text = new PIXI.BitmapText(label, {
            fontName: 'Arial',
            fontSize: 11,
            align: 'center',
          });
          text.maxWidth = radius + lineWidth * 2;
          text.x = x - (radius / 2 + lineWidth * 2 + 1);
          text.y = y - 10 * minusY;
          nodesContainer.addChild(text);
        }
      }
    }
  });
  return false;
};

const drawLines = () => {
  if (typeof links === 'undefined') {
    return false;
  }
  const bbox = container.getVisibleBounds();
  const { x: leftX, y: topY } = bbox;
  const rightX = bbox.x + bbox.width;
  const bottomY = bbox.y + bbox.height;
  const { length } = links;
  for (let i = 0; i < length; i += 1) {
    const d = links[i];
    const { x: sx, y: sy } = d.source;
    const { x: tx, y: ty } = d.target;
    if (
      (leftX < sx &&
        rightX > sx &&
        topY < sy &&
        bottomY > sy &&
        leftX < tx &&
        rightX > tx &&
        topY < ty &&
        bottomY > ty) ||
      nodes.length < 100
    ) {
      const line = new PIXI.Graphics();
      let lWidth = 0.5;
      let strokeStyle = 0x666666;
      if (typeof d.associated !== 'undefined' && d.associated) {
        lWidth = 5;
        strokeStyle = 0x33729f;
      }
      line.lineStyle(lWidth, strokeStyle);
      line.moveTo(sx, sy);
      line.lineTo(tx, ty);
      lineContainer.addChild(line);
    }
  }
  return false;
};

const redraw = () => {
  lineContainer.removeChildren();
  nodesContainer.removeChildren();
  const { scaled } = container;
  drawNodes();
  if (nodes.length < 100 || scaled > 0.2) {
    drawLines();
  }
};

const moving = () => {
  lineContainer.removeChildren();
};

const movedEnd = () => {
  const { center: point } = container;
  transform.x = point.x;
  transform.y = point.y;
  redraw();
};

const zoomedEnd = () => {
  transform.s = container.scaled;
  redraw();
};

const doubleClickZoom = () => {
  container.zoomPercent(0.25, true);
};

const dataLoadingWorker = new DataWorker();

function PersonNetwork(props) {
  // state
  const [initiated, setInitiated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawingIndicator, setDrawingIndicator] = useState(null);
  const [data, setData] = useState(null);
  const [searchData, setSearchData] = useState([]);
  const [detailsCardVisible, setDetailsCardVisible] = useState(false);
  const [detailsCardOpen, setDetailsCardOpen] = useState(true);
  const [detailsCardEntityInfo, setDetailsCardEntityInfo] = useState([]);
  const [detailsCardContent, setDetailsCardContent] = useState([]);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchInputType, setSearchInputType] = useState('');
  const [helpVisible, setHelpVisible] = useState(false);
  const [loadingNode, setLoadingNode] = useState(false);
  const [nodeId, setNodeId] = useState(null);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [contextMenuExpanded, setContextMenuExpanded] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const [activePaths, setActivePaths] = useState([]);

  // props
  const { _id: propsId } = props;

  const clearAssociated = () => {
    if (selectedNode !== null) {
      setActiveNode(null);
      const { id = '' } = selectedNode;
      const node = nodes.find((n) => n.id === id) || null;
      if (node !== null) {
        node.selected = false;
        node.associated = false;
        redraw();
      }
    }
  };

  const toggleDetailsCard = (value = null) => {
    let visible = !detailsCardVisible;
    if (value !== null) visible = value;
    if (!visible) {
      clearAssociated();
    } else {
      setDetailsCardOpen(true);
    }
    setDetailsCardVisible(visible);
  };

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  };

  const toggleDetailsCardCollapse = () => {
    setDetailsCardOpen(!detailsCardOpen);
  };

  useEffect(() => {
    const initiateGraph = () => {
      setInitiated(true);
      const graphContainer = document.getElementById('graph-container');
      width = graphContainer.offsetWidth - 2;

      PIXI.Renderer.create = function create(options) {
        if (webglSupport()) {
          return new PIXI.Renderer(options);
        }
        throw new Error(
          'WebGL unsupported in this browser, use "pixi.js-legacy" for fallback canvas2d support.'
        );
      };

      app = new PIXI.Application({
        width,
        height,
        antialias: true,
        backgroundAlpha: 1,
        resolution,
        backgroundColor: 0xffffff,
        autoResize: true,
        preserveDrawingBuffer: false,
        sharedTicker: true,
      });

      document.getElementById('pixi-network').appendChild(app.view);

      container = new Viewport({
        screenWidth: width,
        screenHeight: height,
        worldWidth: width,
        worldHeight: height,
        interaction: app.renderer.plugins.interaction,
        ticker: PIXI.Ticker.shared,
        bounce: false,
        decelerate: false,
      })
        .on('moved', () => debounce(moving(), 500))
        .on('moved-end', () => debounce(movedEnd(), 500))
        .on('zoomed-end', () => debounce(zoomedEnd(), 500));
      app.stage.addChild(container);

      container.drag({ wheel: false });

      lineContainer = new PIXI.Container();
      nodesContainer = new PIXI.Container();
      container.addChild(lineContainer);
      container.addChild(nodesContainer);
    };
    if (!initiated) {
      initiateGraph();
    }
  }, [initiated]);

  useEffect(() => {
    const load = async () => {
      setDrawingIndicator(
        <div>
          loading data<span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </div>
      );
      setLoading(false);
      if (propsId === null || propsId === '') {
        return false;
      }
      const workerParams = { _id: propsId, step: 1, APIPath };
      dataLoadingWorker.postMessage(workerParams);
      const newData = await new Promise((resolve) => {
        dataLoadingWorker.addEventListener(
          'message',
          (e) => {
            resolve(e.data);
          },
          false
        );
      });
      const workerResponseData = jsonStringToObject(newData);
      const parsedData = jsonStringToObject(workerResponseData.data);
      const { nodes: newNodes = [] } = parsedData;
      setData(parsedData);
      setSearchData(newNodes);
      setDrawing(true);
      setSearchInput('');
      setSearchInputType('');
      return false;
    };
    if (loading) {
      load();
    }
  }, [loading, propsId]);

  useEffect(() => {
    const drawGraph = async () => {
      setDrawing(false);
      setDrawingIndicator(
        <div>
          drawing<span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </div>
      );
      const centerX = width / 2;
      const centerY = height / 2;
      transform.x = centerX;
      transform.y = centerY;

      transformEnd();

      setDrawingIndicator(
        <div>
          drawing<span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </div>
      );
      nodes = data.nodes;
      links = data.links;
      d3.select('#graph-zoom-in').on('click', () => {
        container.zoomPercent(0.25, true);
        debounce(zoomedEnd(), 500);
      });
      d3.select('#graph-zoom-out').on('click', () => {
        if (container.scaled < 0.1) {
          return false;
        }
        container.zoomPercent(-0.25, true);
        debounce(zoomedEnd(), 500);
        return false;
      });
      d3.select('#graph-pan-up').on('click', () => {
        const newX = transform.x;
        const newY = transform.y + 50;
        container.moveCenter(newX, newY);
        debounce(zoomedEnd(), 500);
      });
      d3.select('#graph-pan-right').on('click', () => {
        const newX = transform.x - 50;
        const newY = transform.y;
        container.moveCenter(newX, newY);
        debounce(zoomedEnd(), 500);
      });
      d3.select('#graph-pan-down').on('click', () => {
        const newX = transform.x;
        const newY = transform.y - 50;
        container.moveCenter(newX, newY);
        debounce(zoomedEnd(), 500);
      });
      d3.select('#graph-pan-left').on('click', () => {
        const newX = transform.x + 50;
        const newY = transform.y;
        container.moveCenter(newX, newY);
        debounce(zoomedEnd(), 500);
      });
      setDrawingIndicator(
        <div>
          drawing complete<span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </div>
      );
      setTimeout(() => {
        setDrawingIndicator(null);
      }, 1000);

      // recenter viewport and draw
      container.moveCenter(nodes[0].x, nodes[0].y);
    };
    if (drawing && initiated) {
      drawGraph();
    }
    return () => false;
  }, [drawing, initiated, data]);

  useEffect(() => {
    let resizeTimer;
    const updateCanvasSize = () => {
      const gContainer = document.getElementById('graph-container');
      width = gContainer.offsetWidth - 2;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        transformEnd();
        redraw();
      }, 250);
    };
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  const parseSegments = (segments, i) => {
    const output = [];
    const { length } = segments;
    for (let j = 0; j < length; j += 1) {
      const segment = segments[j];
      const { source, target, relationship } = segment;
      const linkArray = ['Classpiece', 'Organisation', 'Person', 'Resource'];
      const { _id: sId = '', label: sLabel = '', type: sType = '' } = source;
      const { _id: tId = '', label: tLabel = '', type: tType = '' } = target;
      const { _id: rId = '', type: rType = '' } = relationship;
      let sourceLabel = (
        <span>
          {sLabel} <small>[{sType}]</small>
        </span>
      );
      let targetLabel = (
        <span>
          {tLabel} <small>[{tType}]</small>
        </span>
      );
      if (linkArray.indexOf(sType) > -1) {
        const sourceHref = `/${sType.toLowerCase()}/${sId}`;
        sourceLabel = (
          <Link to={sourceHref} href={sourceHref}>
            {sLabel} <small>[{sType}]</small>
          </Link>
        );
      }
      if (linkArray.indexOf(tType) > -1) {
        const targetHref = `/${tType.toLowerCase()}/${tId}`;
        targetLabel = (
          <Link to={targetHref} href={targetHref}>
            {tLabel} <small>[{tType}]</small>
          </Link>
        );
      }
      const returnItem = [];
      const sourceItem = (
        <div className="source" key={`source-${sId}`}>
          {sourceLabel}
        </div>
      );
      const prevIndex = j - 1;
      if (j === 0) {
        returnItem.push(sourceItem);
      } else if (j > 0 && sId !== segments[prevIndex].target._id) {
        returnItem.push(sourceItem);
      }
      returnItem.push(
        <div className="relationship" key={`relationship-${rId}`}>
          {rType}
          <div className="line" />
          <div className="arrow" />
        </div>
      );
      returnItem.push(
        <div className="target" key={`target-${tId}`}>
          {targetLabel}
        </div>
      );
      output.push(returnItem);
    }
    const outputHTML = <li key={`segment-${i}`}>{output}</li>;
    return outputHTML;
  };

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const cSource = cancelToken.source();

    const loadNode = async (_id) => {
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
        params: { sourceId: propsId, targetId: _id },
        cancelToken: cSource.token,
      })
        .then((response) => response.data.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined') {
        const [first] = responseData;
        const { length } = responseData;
        const { source, target } = first;
        const segments = [];
        setActivePaths(responseData);
        for (let i = 0; i < length; i += 1) {
          const { segments: iSegments } = responseData[i];
          const segmentsHTML = parseSegments(iSegments, i);
          segments.push(
            <div key={i} className="related-nodes-paths-block">
              <div className="related-nodes-paths-count">[{i + 1}]</div>
              <ul className="related-nodes-paths">{segmentsHTML}</ul>
            </div>
          );
        }
        const linkArray = [
          'Classpiece',
          'Organisation',
          'Person',
          'Event',
          'Resource',
        ];
        const { _id: sId = '', label: sLabel = '', type: sType = '' } = source;
        const { _id: tId = '', label: tLabel = '', type: tType = '' } = target;
        let sourceLabel = <span>{sLabel}</span>;
        let targetLabel = <span>{tLabel}</span>;
        if (linkArray.indexOf(sType) > -1) {
          const sourceHref = `/${sType.toLowerCase()}/${sId}`;
          sourceLabel = (
            <Link href={sourceHref} to={sourceHref}>
              <span>{sLabel}</span>
            </Link>
          );
        }
        if (linkArray.indexOf(tType) > -1) {
          const targetHref = `/${tType.toLowerCase()}/${tId}`;
          targetLabel = (
            <Link href={targetHref} to={targetHref}>
              <span>{tLabel}</span>
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
        setLoadingNode(false);
      }
    };

    if (nodeId !== null && loadingNode) {
      loadNode(nodeId);
    }
    return () => {
      cSource.cancel('api request cancelled');
    };
  }, [nodeId, loadingNode, propsId]);

  const loadNodeDetails = (_id) => {
    if (_id === propsId) {
      const node = data.nodes.find((n) => n.id === _id) || null;
      if (node !== null) {
        setDetailsCardEntityInfo(node.label);
        setDetailsCardContent('');
      }
    } else {
      setNodeId(_id);
      setLoadingNode(true);
    }
  };

  publicFunctions.clickNode = (e, dParam) => {
    const d = dParam;
    const x = e.data.originalEvent.clientX - 5;
    const y = e.data.originalEvent.clientY - 5;
    setContextMenu({ visible: true, x, y });
    d.selected = true;
    setContextMenuExpanded(d.expanded);
    setActiveNode(d);
  };

  const viewNodeDetails = () => {
    const prevNode = nodes.find((n) => n.selected) || null;
    if (prevNode !== null) {
      delete prevNode.selected;
    }
    selectedNode = nodes.find((n) => n.id === activeNode.id) || null;
    // load node details
    loadNodeDetails(activeNode.id);
    toggleDetailsCard(true);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const expandNode = async () => {
    setDrawingIndicator(
      <div>
        loading data<span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </div>
    );
    const workerParams = { _id: activeNode.id, step: 1, APIPath };
    dataLoadingWorker.postMessage(workerParams);
    const responseData = await new Promise((resolve) => {
      dataLoadingWorker.addEventListener(
        'message',
        (e) => {
          resolve(e.data);
        },
        false
      );
    });
    let parsedData = jsonStringToObject(responseData);
    parsedData = jsonStringToObject(parsedData.data);
    activeNode.expanded = true;

    const newNodes = [];
    const { length: nLength } = nodes;
    for (let i = 0; i < nLength; i += 1) {
      const n = nodes[i];
      newNodes.push(n);
    }
    const { nodes: pnNodes = [] } = parsedData;
    const { length: pnLength } = pnNodes;
    for (let i = 0; i < pnLength; i += 1) {
      const sn = pnNodes[i];
      const findSN = nodes.find((n) => n.id === sn.id) || null;
      if (findSN === null) {
        newNodes.push(sn);
      }
    }
    const newLinks = [];
    const { lengthL: lLength } = links;
    for (let i = 0; i < lLength; i += 1) {
      const l = links[i];
      newLinks.push(l);
    }

    const { links: pLinks = [] } = parsedData;
    const { length: plLength } = pLinks;
    for (let j = 0; j < plLength; j += 1) {
      const sl = pLinks[j];
      const findSL = nodes.find((l) => l.id === sl.id) || null;
      if (findSL === null) {
        newLinks.push(sl);
      }
    }

    setDrawingIndicator(
      <div>
        drawing<span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </div>
    );
    nodes = newNodes;
    links = newLinks;
    redraw();

    container.moveCenter(activeNode.x - 30, activeNode.y - 30);
    setDrawingIndicator(
      <div>
        drawing complete<span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </div>
    );
    setTimeout(() => {
      setDrawingIndicator(null);
    }, 1000);
    setContextMenu({ visible: false, x: 0, y: 0 });

    setSearchData(nodes);
  };

  const selectedNodes = useCallback(() => {
    clearAssociated();
    const segments = [];
    const { length: apLength } = activePaths;
    for (let a = 0; a < apLength; a += 1) {
      const ap = activePaths[a];
      const { segments: apSegments } = ap;
      const { length: apsLength } = apSegments;
      for (let j = 0; j < apsLength; j += 1) {
        segments.push(apSegments[j]);
      }
    }
    // associated links
    const newAssociatedLinks = [];
    const newAssociatedNodes = [];
    const { length: sLength } = segments;
    for (let i = 0; i < sLength; i += 1) {
      const seg = segments[i];
      const { relationship, source, target } = seg;
      const { _id: rId } = relationship;
      const { _id: sId } = source;
      const { _id: tId } = target;
      if (newAssociatedLinks.indexOf(rId) === -1) {
        newAssociatedLinks.push(rId);
      }
      if (newAssociatedNodes.indexOf(sId) === -1) {
        newAssociatedNodes.push(sId);
      }
      if (newAssociatedNodes.indexOf(tId) === -1) {
        newAssociatedNodes.push(tId);
      }
    }
    const identifyLinks = links.filter(
      (l) => newAssociatedLinks.indexOf(l.id) > -1
    );
    const identifyNodes = nodes.filter(
      (n) => newAssociatedNodes.indexOf(n.id) > -1
    );
    identifyLinks.forEach((lParam) => {
      const l = lParam;
      l.associated = true;
      return l;
    });
    identifyNodes.forEach((nParam) => {
      const n = nParam;
      n.associated = true;
      return n;
    });
    redraw();
  }, [activePaths]);

  useEffect(() => {
    if (activePaths.length > 0) {
      selectedNodes();
    }
  }, [activePaths, selectedNodes]);

  const searchNode = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInput(value);
    const copy = { ...data };
    const { nodes: dataNodes = [] } = copy;
    const { length } = dataNodes;
    const visibleNodes = [];
    for (let i = 0; i < length; i += 1) {
      const n = dataNodes[i];
      const { label = '', type = '' } = n;
      if (searchInputType !== '') {
        if (
          type.toLowerCase() === searchInputType.toLowerCase() &&
          label.toLowerCase().includes(value.toLowerCase())
        ) {
          n.visible = true;
          visibleNodes.push(n);
        }
      } else if (label.toLowerCase().includes(value.toLowerCase())) {
        n.visible = true;
        visibleNodes.push(n);
      } else n.visible = false;
    }
    copy.nodes = dataNodes;
    setData(data);
    setSearchData(visibleNodes);
  };

  const clearSearchNode = () => {
    setSearchInput('');
    setSearchInputType('');
    const copy = { ...data };
    const { nodes: dataNodes = [] } = copy;
    const { length } = dataNodes;
    for (let i = 0; i < length; i += 1) {
      const n = dataNodes[i];
      n.visible = true;
    }
    copy.nodes = dataNodes;
    setData(data);
    setSearchData(copy.nodes);
  };

  const searchNodeType = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInputType(value);
    if (value === '') {
      clearSearchNode();
    } else {
      const copy = { ...data };
      const { nodes: dataNodes = [] } = copy;
      const { length } = dataNodes;
      const visibleNodes = [];
      for (let i = 0; i < length; i += 1) {
        const n = dataNodes[i];
        if (
          n.type.toLowerCase() === value.toLowerCase() &&
          n.label.toLowerCase().includes(searchInput.toLowerCase())
        ) {
          visibleNodes.push(n);
          n.visible = true;
        } else n.visible = false;
      }
      copy.nodes = dataNodes;
      setData(data);
      setSearchData(visibleNodes);
    }
  };

  const centerNode = (_id) => {
    const node = nodes.find((n) => n.id === _id) || null;
    if (node !== null) {
      const { length } = nodes;
      for (let i = 0; i < length; i += 1) {
        const n = nodes[i];
        n.selected = false;
      }
      node.selected = true;
      container.moveCenter(node.x, node.y);
    }
  };

  const renderSearchItemHTML = (n) => {
    if (typeof n === 'undefined') {
      return [];
    }
    const { id = '', label = '', type = '' } = n;
    return (
      <div
        key={id}
        data-id={id}
        onClick={() => centerNode(id)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="center to node"
      >
        {label} <small>[{type}]</small>
      </div>
    );
  };

  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
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

  const helpIcon = (
    <div
      className="graph-help-toggle"
      onClick={() => toggleHelp()}
      title="Help"
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="toggle help"
    >
      <i className="fa fa-question-circle" />
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

  const detailsCardVisibleClass = detailsCardVisible ? '' : ' hidden';
  const gdcclass = detailsCardOpen ? '' : 'closed';
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
      <div
        className="graph-details-collapse"
        onClick={() => toggleDetailsCardCollapse()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle details"
      >
        <i className={`fa fa-angle-down ${gdcclass}`} />
      </div>
      <div className="card-title">
        <h4>Node details</h4>
      </div>
      <Collapse isOpen={detailsCardOpen}>
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
      </Collapse>
    </div>
  );
  const searchContainerVisibleClass = searchContainerVisible ? ' visible' : '';
  let searchContainerNodes = null;
  if (!loading && searchData.length > 0) {
    searchContainerNodes = (
      <LazyList
        limit={30}
        range={15}
        items={searchData}
        containerClass="graph-search-container-nodes"
        renderItem={renderSearchItemHTML}
      />
    );
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
          name="search_node"
          placeholder="Search node"
          value={searchInput}
          onChange={(e) => searchNode(e)}
        />
        <i
          className="fa fa-times-circle"
          onClick={() => clearSearchNode()}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="clear search node"
        />
      </FormGroup>
      <FormGroup className="graph-search-input-type">
        <Input
          type="select"
          name="search_node_type"
          value={searchInputType}
          onChange={(e) => searchNodeType(e)}
        >
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
  );

  const legendPanel = (
    <div className="graph-legend-panel">
      <ul>
        <li>
          <span
            style={{ borderColor: '#1e9dd8', backgroundColor: '#1ed8bf' }}
          />{' '}
          Classpiece
        </li>
        <li>
          <span
            style={{ borderColor: '#c9730a', backgroundColor: '#f9cd1b' }}
          />{' '}
          Event
        </li>
        <li>
          <span
            style={{ borderColor: '#5343b7', backgroundColor: '#9b8cf2' }}
          />{' '}
          Organisation
        </li>
        <li>
          <span
            style={{ borderColor: '#519b1b', backgroundColor: '#5dc910' }}
          />{' '}
          Person
        </li>
        <li>
          <span
            style={{ borderColor: '#0982a0', backgroundColor: '#00cbff' }}
          />{' '}
          Resource
        </li>
      </ul>
    </div>
  );
  // contextMenu
  const contextMenuDisplay = contextMenu.visible ? 'block' : 'none';
  const contextMenuStyle = {
    display: contextMenuDisplay,
    left: contextMenu.x,
    top: contextMenu.y,
  };
  const cmExpanded = contextMenuExpanded ? null : (
    <div
      onClick={() => expandNode()}
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="expand node"
    >
      Expand
    </div>
  );
  const contextMenuHTML = (
    <div
      className="graph-context-menu"
      style={contextMenuStyle}
      onMouseLeave={() => {
        setContextMenu({ visible: false, x: 0, y: 0 });
      }}
    >
      <div
        onClick={() => viewNodeDetails()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="view node details"
      >
        View details
      </div>
      {cmExpanded}
    </div>
  );
  const graphDrawingStatus =
    drawingIndicator !== null ? (
      <div className="graph-drawing">{drawingIndicator}</div>
    ) : null;

  return (
    <div style={{ position: 'relative', display: 'block' }}>
      {contextMenuHTML}
      {graphDrawingStatus}
      <div id="pixi-network" onDoubleClick={() => doubleClickZoom()} />
      <div className="graph-actions">
        {panPanel}
        {zoomPanel}
        {searchIcon}
        {helpIcon}
      </div>
      {detailsCard}
      {searchContainer}
      {legendPanel}
      <Suspense fallback={[]}>
        <HelpArticle
          permalink="item-network-graph-help"
          visible={helpVisible}
          toggle={toggleHelp}
        />
      </Suspense>
    </div>
  );
}
PersonNetwork.defaultProps = {
  _id: '',
};
PersonNetwork.propTypes = {
  _id: PropTypes.string,
};
export default PersonNetwork;
