import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import { Link } from 'react-router-dom';
import { Label, Collapse, FormGroup, Input, Spinner } from 'reactstrap';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import PropTypes from 'prop-types';

import DataWorker from './person-data.worker';
import { webglSupport, jsonStringToObject } from '../../helpers';
import HelpArticle from '../help-article';
import LazyList from '../lazylist';

const APIPath = process.env.REACT_APP_APIPATH;

/// d3 network

let app;
let container;
let nodes;
let links;
let width = 600;
const height = 660;
const resolution = window.devicePixelRatio || 1;
const transform = { s: 1, x: 0, y: 0 };
let associatedNodes = [];
let associatedLinks = [];
let selectedNode;
let lineContainer;
let nodesContainer;
let textContainer;
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

const splitArray = (array, size) => {
  const newArr = [];
  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size);
    newArr.push(chunk);
  }
  return newArr;
};

const drawNodes = async () => {
  if (typeof nodes === 'undefined') {
    return false;
  }
  if (typeof loader.resources.Arial === 'undefined') {
    loader.add('Arial', '/arial-bitmap/Arial.xml');
  }
  loader.load(() => {
    const bbox = container.getVisibleBounds();
    const leftX = bbox.x;
    const rightX = bbox.x + bbox.width;
    const topY = bbox.y;
    const bottomY = bbox.y + bbox.height;
    const nodesNum = nodes.length;
    const nodesSplit = splitArray(nodes, 500);
    for (let j = 0; j < nodesSplit.length; j += 1) {
      const newNodes = nodesSplit[j];
      for (let i = 0; i < newNodes.length; i += 1) {
        const d = newNodes[i];
        if (i === 0) {
          d.expanded = true;
        }
        d.visible = true;
        let radius = d.size || 30;
        const { x } = d;
        const { y } = d;
        if (nodesNum <= 500) {
          d.gfx = new PIXI.Graphics();
          d.gfx.interactive = true;
          d.gfx.on('click', (e) => publicFunctions.clickNode(e, d));
          d.gfx.on('tap', (e) => publicFunctions.clickNode(e, d));
          let lineWidth = 1;
          let strokeStyle = hexColor(d.strokeColor);
          d.visible = true;
          // circle
          if (typeof d.selected !== 'undefined' && d.selected) {
            lineWidth = 5;
            strokeStyle = '0x33729f';
            radius += 5;
          } else if (typeof d.associated !== 'undefined' && d.associated) {
            lineWidth = 5;
          } else {
            lineWidth = 1;
          }
          d.gfx.beginFill(hexColor(d.color));
          if (
            container.scaled > 0.2 ||
            (typeof d.selected !== 'undefined' && d.selected)
          ) {
            d.gfx.lineStyle(lineWidth, strokeStyle);
          }
          d.gfx.drawCircle(x, y, radius);
          nodesContainer.addChild(d.gfx);
          if (d.label !== '' && container.scaled > 0.2) {
            const label = d.label.trim().replace(/  +/g, ' ');
            const spaces = label.split(' ');
            const newSpaces = [];
            for (let k = 0; k < spaces.length; k += 1) {
              let space = spaces[k];
              const nextIndex = k + 1;
              if (
                nextIndex < spaces.length - 1 &&
                space.length < 6 &&
                spaces[nextIndex].length < 6
              ) {
                space += ` ${spaces[nextIndex]}`;
                spaces.splice(nextIndex, 1);
              }
              newSpaces.push(space);
            }
            const minusY = newSpaces.length / 2;

            const text = new PIXI.BitmapText(label, {
              fontName: 'Arial',
              fontSize: 11,
              align: 'center',
            });
            text.maxWidth = radius * 2 + lineWidth * 2;
            text.x = x - radius + lineWidth * 2;
            text.y = y - 10 * minusY;
            textContainer.addChild(text);
          }
        } else if (leftX <= x && rightX >= x && topY <= y && bottomY >= y) {
          d.gfx = new PIXI.Graphics();
          d.gfx.interactive = true;
          d.gfx.on('click', (e) => publicFunctions.clickNode(e, d));
          d.gfx.on('tap', (e) => publicFunctions.clickNode(e, d));
          let lineWidth = 1;
          let strokeStyle = hexColor(d.strokeColor);
          d.visible = true;
          // circle
          if (typeof d.selected !== 'undefined' && d.selected) {
            lineWidth = 5;
            strokeStyle = '0x33729f';
            radius += 5;
          } else if (typeof d.associated !== 'undefined' && d.associated) {
            lineWidth = 5;
          } else {
            lineWidth = 1;
          }
          d.gfx.beginFill(hexColor(d.color));
          if (
            container.scaled > 0.2 ||
            (typeof d.selected !== 'undefined' && d.selected)
          ) {
            d.gfx.lineStyle(lineWidth, strokeStyle);
          }
          d.gfx.drawCircle(x, y, radius);
          nodesContainer.addChild(d.gfx);
          if (d.label !== '' && container.scaled > 0.2) {
            const label = d.label.trim().replace(/  +/g, ' ');
            const spaces = label.split(' ');
            const newSpaces = [];
            for (let k = 0; k < spaces.length; k += 1) {
              let space = spaces[k];
              const nextIndex = k + 1;
              if (
                nextIndex < spaces.length - 1 &&
                space.length < 6 &&
                spaces[nextIndex].length < 6
              ) {
                space += ` ${spaces[nextIndex]}`;
                spaces.splice(nextIndex, 1);
              }
              newSpaces.push(space);
            }
            const minusY = newSpaces.length / 2;

            const text = new PIXI.BitmapText(label, {
              fontName: 'Arial',
              fontSize: 11,
              align: 'center',
            });
            text.maxWidth = radius * 2 + lineWidth * 2;
            text.x = x - radius + lineWidth * 2;
            text.y = y - 10 * minusY;
            textContainer.addChild(text);
          }
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
  const leftX = bbox.x;
  const rightX = bbox.x + bbox.width;
  const topY = bbox.y;
  const bottomY = bbox.y + bbox.height;
  const linksNum = links.length;
  const linksSplit = splitArray(links, 500);
  for (let j = 0; j < linksSplit.length; j += 1) {
    const newLinks = linksSplit[j];
    for (let i = 0; i < newLinks.length; i += 1) {
      const d = newLinks[i];
      const sx = d.source.x;
      const sy = d.source.y;
      const tx = d.target.x;
      const ty = d.target.y;
      if (linksNum <= 500) {
        const line = new PIXI.Graphics();
        let lWidth = 0.2;
        let strokeStyle = 0x666666;
        if (typeof d.associated !== 'undefined' && d.associated) {
          lWidth = 5;
          strokeStyle = 0x33729f;
        }
        line.lineStyle(lWidth, strokeStyle);
        line.moveTo(sx, sy);
        line.lineTo(tx, ty);
        lineContainer.addChild(line);
      } else if (leftX <= sx && rightX >= sx && topY <= sy && bottomY >= sy) {
        const line = new PIXI.Graphics();
        let lWidth = 0.2;
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
  }
  return false;
};

const redraw = () => {
  lineContainer.removeChildren();
  nodesContainer.removeChildren();
  textContainer.removeChildren();
  drawNodes();
  drawLines();
};

const moving = () => {
  lineContainer.removeChildren();
  textContainer.removeChildren();
};

const movedEnd = () => {
  const point = container.center;
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

const PersonNetwork = (props) => {
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
    const newAccosiatedNodes = nodes.filter(
      (n) => associatedNodes.indexOf(n.id) > -1
    );
    for (let n = 0; n < newAccosiatedNodes.length; n += 1) {
      const item = newAccosiatedNodes[n];
      if (typeof item !== 'undefined') {
        item.associated = false;
        delete item.associated;
      }
    }
    const newAccosiatedLinks = links.filter(
      (l) => associatedLinks.indexOf(l.id) > -1
    );
    for (let l = 0; l < newAccosiatedLinks.length; l += 1) {
      const item = newAccosiatedLinks[l];
      if (typeof item !== 'undefined') {
        item.associated = false;
        delete item.associated;
      }
    }
    associatedNodes = [];
    associatedLinks = [];
    selectedNode.selected = false;
    delete selectedNode.selected;
    textContainer.removeChildren();
    redraw();
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
        transparent: false,
        resolution,
        backgroundColor: 0xffffff,
        autoResize: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
        sharedTicker: true,
      });

      document.getElementById('pixi-network').appendChild(app.view);

      container = new Viewport({
        screenWidth: width,
        screenHeight: height,
        worldWidth: 1000,
        worldHeight: 1000,
        interaction: app.renderer.plugins.interaction,
        ticker: PIXI.Ticker.shared,
        bounce: false,
        decelerate: false,
        passiveWheel: false,
      })
        .on('moved', () => moving())
        .on('moved-end', () => movedEnd())
        .on('zoomed-end', () => zoomedEnd());
      app.stage.addChild(container);
      container.drag({ wheel: false });

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
      let parsedData = jsonStringToObject(newData);
      parsedData = jsonStringToObject(parsedData.data);
      const newNodes = jsonStringToObject(parsedData.nodes);
      setData(parsedData);
      setSearchData(newNodes);
      setDrawing(true);
      setSearchInput('');
      setSearchInputType('');
      setLoading(false);
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
          simulating<span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </div>
      );
      const centerX = width / 2;
      const centerY = height / 2;
      transform.x = centerX;
      transform.y = centerY;

      transformEnd();

      /* let simulationParams = {nodes:data.nodes, links: data.links, centerX:centerX-50,centerY:centerY-50};
      forceSimulationWorker.postMessage(simulationParams);
      let simulation = await new Promise ((resolve,reject)=>{
        forceSimulationWorker.addEventListener('message',(e) =>{
          resolve(e.data);
        }, false);
      });
      let simulationData = jsonStringToObject(simulation.data); */
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
        zoomedEnd();
      });
      d3.select('#graph-zoom-out').on('click', () => {
        if (container.scaled < 0.1) {
          return false;
        }
        container.zoomPercent(-0.25, true);
        zoomedEnd();
        return false;
      });
      d3.select('#graph-pan-up').on('click', () => {
        const newX = transform.x;
        const newY = transform.y + 50;
        container.moveCenter(newX, newY);
        zoomedEnd();
      });
      d3.select('#graph-pan-right').on('click', () => {
        const newX = transform.x - 50;
        const newY = transform.y;
        container.moveCenter(newX, newY);
        zoomedEnd();
      });
      d3.select('#graph-pan-down').on('click', () => {
        const newX = transform.x;
        const newY = transform.y - 50;
        container.moveCenter(newX, newY);
        zoomedEnd();
      });
      d3.select('#graph-pan-left').on('click', () => {
        const newX = transform.x + 50;
        const newY = transform.y;
        container.moveCenter(newX, newY);
        zoomedEnd();
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
  });

  const parseSegments = (segments, i) => {
    const output = [];
    for (let j = 0; j < segments.length; j += 1) {
      const segment = segments[j];
      const { source } = segment;
      const { target } = segment;
      const { relationship } = segment;
      const linkArray = ['Classpiece', 'Organisation', 'Person', 'Resource'];
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
        <div className="source" key={`source-${j}`}>
          {sourceLabel}
        </div>
      );
      const prevIndex = j - 1;
      if (j === 0) {
        returnItem.push(sourceItem);
      } else if (j > 0 && source._id !== segments[prevIndex].target._id) {
        returnItem.push(sourceItem);
      }
      returnItem.push(
        <div className="relationship" key={`relationship-${i}`}>
          {relationship.type}
          <div className="line" />
          <div className="arrow" />
        </div>
      );
      returnItem.push(
        <div className="target" key={`target-${i}`}>
          {targetLabel}
        </div>
      );
      output.push(returnItem);
    }
    const outputHTML = <li key={i}>{output}</li>;
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
        const { source } = responseData[0];
        const { target } = responseData[0];
        const segments = [];
        setActivePaths(responseData);
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
        const linkArray = [
          'Classpiece',
          'Organisation',
          'Person',
          'Event',
          'Resource',
        ];
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
      const node = data.nodes.find((n) => n.id === _id);
      if (typeof node !== 'undefined') {
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
    const prevNode = nodes.find((n) => n.selected);
    if (typeof prevNode !== 'undefined') {
      delete prevNode.selected;
    }
    selectedNode = nodes.find((n) => n.id === activeNode.id);
    // load node details ;
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
    for (let i = 0; i < nodes.length; i += 1) {
      const n = nodes[i];
      newNodes.push(n);
    }
    for (let i = 0; i < parsedData.nodes.length; i += 1) {
      const sn = parsedData.nodes[i];
      const findSN = nodes.find((n) => n.id === sn.id);
      if (typeof findSN === 'undefined') {
        newNodes.push(sn);
      }
    }
    const newLinks = [];
    for (let i = 0; i < links.length; i += 1) {
      const l = links[i];
      newLinks.push(l);
    }

    for (let j = 0; j < parsedData.links.length; j += 1) {
      const sl = parsedData.links[j];
      const findSL = nodes.find((l) => l.id === sl.id);
      if (typeof findSL === 'undefined') {
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
    for (let a = 0; a < activePaths.length; a += 1) {
      const ap = activePaths[a];
      for (let j = 0; j < ap.segments.length; j += 1) {
        segments.push(ap.segments[j]);
      }
    }
    // associated links
    const newAssociatedLinks = [];
    const newAssociatedNodes = [];
    for (let i = 0; i < segments.length; i += 1) {
      const seg = segments[i];
      if (newAssociatedLinks.indexOf(seg.relationship._id) === -1) {
        newAssociatedLinks.push(seg.relationship._id);
      }
      if (newAssociatedNodes.indexOf(seg.source._id) === -1) {
        newAssociatedNodes.push(seg.source._id);
      }
      if (newAssociatedNodes.indexOf(seg.target._id) === -1) {
        newAssociatedNodes.push(seg.target._id);
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

    associatedLinks = newAssociatedLinks;
    associatedNodes = newAssociatedNodes;
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
    const visibleNodes = data.nodes.filter((n) => {
      if (searchInputType !== '') {
        if (
          n.type.toLowerCase() === searchInputType.toLowerCase() &&
          n.label.toLowerCase().includes(value.toLowerCase())
        ) {
          return true;
        }
      } else if (n.label.toLowerCase().includes(value.toLowerCase())) {
        return true;
      }
      return false;
    });
    const dataNodes = data.nodes;
    for (let i = 0; i < dataNodes.length; i += 1) {
      const n = dataNodes[i];
      if (visibleNodes.indexOf(n) > -1) {
        n.visible = true;
      } else n.visible = false;
    }
    data.nodes = dataNodes;
    setData(data);
    setSearchData(visibleNodes);
  };

  const clearSearchNode = () => {
    setSearchInput('');
    setSearchInputType('');
    const dataNodes = data.nodes;
    for (let i = 0; i < dataNodes.length; i += 1) {
      const n = dataNodes[i];
      n.visible = true;
    }
    data.nodes = dataNodes;
    setData(data);
    setSearchData(data.nodes);
  };

  const searchNodeType = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInputType(value);
    if (value === '') {
      clearSearchNode();
    } else {
      const visibleNodes = data.nodes.filter((n) => {
        if (
          n.type.toLowerCase() === value.toLowerCase() &&
          n.label.toLowerCase().includes(searchInput.toLowerCase())
        ) {
          return true;
        }
        return false;
      });
      const dataNodes = data.nodes;
      for (let i = 0; i < dataNodes.length; i += 1) {
        const n = dataNodes[i];
        if (visibleNodes.indexOf(n) > -1) {
          n.visible = true;
        } else n.visible = false;
      }
      data.nodes = dataNodes;
      setData(data);
      setSearchData(visibleNodes);
    }
  };

  const centerNode = (_id) => {
    const node = nodes.find((n) => n.id === _id);
    if (typeof node !== 'undefined') {
      for (let i = 0; i < nodes.length; i += 1) {
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
    return (
      <div
        key={n.id}
        data-id={n.id}
        onClick={() => centerNode(n.id)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="center to node"
      >
        {n.label} <small>[{n.type}]</small>
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

  let detailsCardVisibleClass = ' hidden';
  if (detailsCardVisible) {
    detailsCardVisibleClass = '';
  }
  let gdcclass = '';
  if (!detailsCardOpen) {
    gdcclass = 'closed';
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
  let searchContainerVisibleClass = '';
  if (searchContainerVisible) {
    searchContainerVisibleClass = ' visible';
  }
  let searchContainerNodes = [];
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
  let contextMenuDisplay = 'none';
  if (contextMenu.visible) {
    contextMenuDisplay = 'block';
  }
  const contextMenuStyle = {
    display: contextMenuDisplay,
    left: contextMenu.x,
    top: contextMenu.y,
  };
  let cmExpanded = (
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
  if (contextMenuExpanded) {
    cmExpanded = [];
  }
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
  let graphDrawingStatus = [];
  if (drawingIndicator !== null) {
    graphDrawingStatus = (
      <div className="graph-drawing">{drawingIndicator}</div>
    );
  }
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
      <HelpArticle
        permalink="item-network-graph-help"
        visible={helpVisible}
        toggle={toggleHelp}
      />
    </div>
  );
};
PersonNetwork.defaultProps = {
  _id: '',
};
PersonNetwork.propTypes = {
  _id: PropTypes.string,
};
export default PersonNetwork;
