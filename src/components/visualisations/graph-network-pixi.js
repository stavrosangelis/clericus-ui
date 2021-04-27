import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import { Link } from 'react-router-dom';
import { Label, Spinner, Badge, FormGroup, Input } from 'reactstrap';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import PropTypes from 'prop-types';

import DataWorker from './graph-data.worker';
import { webglSupport } from '../../helpers';
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

const loader = new PIXI.Loader();

const hexColor = (value) => value.replace('#', '0x');

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
    const nodesSplit = splitArray(nodes, 500);
    for (let j = 0; j < nodesSplit.length; j += 1) {
      const newNodes = nodesSplit[j];
      for (let i = 0; i < newNodes.length; i += 1) {
        const d = newNodes[i];
        d.visible = true;
        let radius = d.size || 30;
        const { x } = d;
        const { y } = d;
        if (leftX <= x && rightX >= x && topY <= y && bottomY >= y) {
          d.gfx = new PIXI.Graphics();
          d.gfx.interactive = true;
          d.gfx.on('click', () => publicFunctions.clickNode(d));
          d.gfx.on('tap', () => publicFunctions.clickNode(d));
          let lineWidth = 1;
          let strokeStyle = hexColor(d.strokeColor);
          // d.visible = true;
          // circle
          if (typeof d.selected !== 'undefined' && d.selected) {
            lineWidth = 5;
            strokeStyle = 0x33729f;
            radius += 5;
          } else if (typeof d.associated !== 'undefined' && d.associated) {
            lineWidth = 4;
            strokeStyle = 0x33729f;
            radius += 4;
          } else {
            lineWidth = 1;
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
            // label = label.replace(/\s/g,"\n");
            const text = new PIXI.BitmapText(label, {
              fontName: 'Arial',
              fontSize: 11,
              align: 'center',
            });
            text.maxWidth = radius + lineWidth * 2;
            text.x = x - (radius / 2 + lineWidth * 2 + 1);
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
  const linksSplit = splitArray(links, 500);
  for (let j = 0; j < linksSplit.length; j += 1) {
    const newLinks = linksSplit[j];
    for (let i = 0; i < newLinks.length; i += 1) {
      const d = newLinks[i];
      const sx = d.source.x;
      const sy = d.source.y;
      const tx = d.target.x;
      const ty = d.target.y;
      if (leftX <= sx && rightX >= sx && topY <= sy && bottomY >= sy) {
        const line = new PIXI.Graphics();
        let lWidth = 1;
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

const GraphNetwork = (props) => {
  // state
  const [initiated, setInitiated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawingIndicator, setDrawingIndicator] = useState([]);
  const [data, setData] = useState(null);
  const [searchData, setSearchData] = useState([]);
  const [step, setStep] = useState(1);
  const [stepLoading, setStepLoading] = useState(false);
  const [detailsCardVisible, setDetailsCardVisible] = useState(false);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchInputType, setSearchInputType] = useState('');
  const [nodeLink, setNodeLink] = useState([]);
  const [relatedNodesItems, setRelatedNodesItems] = useState([]);
  const [helpVisible, setHelpVisible] = useState(false);
  const [loadingNode, setLoadingNode] = useState(false);
  const [nodeId, setNodeId] = useState(null);

  // props
  const { relatedLinks, relatedNodes } = props;

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
      setStep(1);
    }
    setDetailsCardVisible(visible);
  };

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
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
      setDrawingIndicator('loading data...');
      setLoading(false);
      const workerParams = { APIPath };
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
      let parsedData = JSON.parse(newData.data);
      parsedData = JSON.parse(parsedData.data);
      setData(parsedData);
      setSearchData(parsedData.nodes);
      setDrawing(true);
      setSearchInput('');
      setSearchInputType('');
    };
    if (loading) {
      load();
    }
  }, [loading]);

  useEffect(() => {
    const drawGraph = async () => {
      setDrawing(false);
      setDrawingIndicator('drawing...');
      const centerX = width / 2;
      const centerY = height / 2;
      transform.x = centerX;
      transform.y = centerY;

      transformEnd();

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

      setDrawingIndicator('drawing complete.');
      setTimeout(() => {
        setDrawingIndicator('');
      }, 1000);
      // center to 1st node (ordered by incoming links) and draw
      container.moveCenter(nodes[0].x, nodes[0].y);
    };
    if (drawing && initiated) {
      drawGraph();
    }
  }, [drawing, initiated, data]);

  useEffect(() => {
    let resizeTimer;
    const updateCanvasSize = () => {
      const graphContainer = document.getElementById('graph-container');
      width = graphContainer.offsetWidth - 2;
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

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const loadNode = async (_id, stepParam = null) => {
      let newStep = stepParam;
      if (newStep === null) {
        newStep = step;
      }
      setRelatedNodesItems([]);
      setStepLoading(true);
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}item-network-related-nodes`,
        crossDomain: true,
        params: { _id, step: newStep },
        cancelToken: source.token,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      if (typeof responseData !== 'undefined') {
        const nodeType = selectedNode.type;
        setNodeLink(
          <Link
            href={`/${nodeType}/${selectedNode.id}`}
            to={`/${nodeType}/${selectedNode.id}`}
          >
            <b>{selectedNode.label}</b> [{nodeType}]
          </Link>
        );

        const relatedNodesIds = [_id];
        const linkArray = [
          'Classpiece',
          'Organisation',
          'Person',
          'Event',
          'Resource',
        ];
        const nodesItems = [];
        for (let i = 0; i < responseData.length; i += 1) {
          const node = responseData[i];
          if (relatedNodesIds.indexOf(node._id) === -1) {
            relatedNodesIds.push(node._id);
          }
          let link = false;
          if (linkArray.indexOf(nodeType) > -1) {
            link = true;
          }
          node.i = i;
          node.link = link;
          nodesItems.push(node);
        }
        for (let i = 0; i < links.length; i += 1) {
          const link = links[i];
          if (
            relatedNodesIds.indexOf(link.source.id) > -1 &&
            relatedNodesIds.indexOf(link.target.id) > -1
          ) {
            link.associated = true;
          } else link.associated = false;
        }
        setRelatedNodesItems(nodesItems);
        redraw();
        setStepLoading(false);
        setLoadingNode(false);
      }
    };

    if (nodeId !== null && loadingNode) {
      loadNode(nodeId);
    }
    return () => {
      source.cancel('api request cancelled');
    };
  }, [nodeId, loadingNode, step]);

  const loadNodeDetails = (_id, stepParam = null) => {
    let newStep = stepParam;
    if (newStep === null) {
      newStep = step;
    }
    setNodeId(_id);
    setLoadingNode(true);
  };

  const renderRelatedNodeHTMLItem = (item) => {
    if (typeof item === 'undefined' || item === null) {
      return null;
    }
    const itemType = item.type;
    let itemLink = (
      <span>
        <b>{item.label}</b> <small>[{itemType}]</small>
      </span>
    );
    if (item.link) {
      itemLink = (
        <Link href={`${itemType}/${item._id}`} to={`${itemType}/${item._id}`}>
          <b>{item.label}</b> <small>[{itemType}]</small>
        </Link>
      );
    }
    return <div key={item.i}>{itemLink}</div>;
  };

  const setSteps = (val = 1) => {
    setStep(val);
    loadNodeDetails(selectedNode.id, val);
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
    newAssociatedNodes.forEach((nParam) => {
      const n = nParam;
      n.associated = true;
      return n;
    });
    associatedNodes = newAssociatedNodes;
    associatedLinks = mergedAssociatedLinks;

    redraw();
  };

  publicFunctions.clickNode = (dParam) => {
    const d = dParam;
    const prevNode = nodes.find((n) => n.selected);
    if (typeof prevNode !== 'undefined') {
      delete prevNode.selected;
    }
    d.selected = true;
    selectedNode = nodes.find((n) => n.id === d.id);
    toggleDetailsCard(true);
    // load node details;
    loadNodeDetails(d.id);
    selectedNodes();
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

  const searchNode = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    if (data === null) {
      return false;
    }
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
    return false;
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
      selectedNode = node;
      node.selected = true;
      container.moveCenter(node.x, node.y);
      toggleDetailsCard(true);
      loadNodeDetails(node.id);
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
  let step1Color = 'light';
  let step2Color = 'light';
  let step3Color = 'light';
  let step4Color = 'light';
  let step5Color = 'light';
  let step6Color = 'light';
  if (step === 1) {
    step1Color = 'secondary';
  }
  if (step === 2) {
    step2Color = 'secondary';
  }
  if (step === 3) {
    step3Color = 'secondary';
  }
  if (step === 4) {
    step4Color = 'secondary';
  }
  if (step === 5) {
    step5Color = 'secondary';
  }
  if (step === 6) {
    step6Color = 'secondary';
  }

  let detailsLoader = [];
  if (stepLoading) {
    detailsLoader = (
      <Spinner className="node-details-loader" color="info" size="sm" />
    );
  }
  const detailsCard = (
    <div className={`card graph-details-card${detailsCardVisibleClass}`}>
      <div
        className="graph-details-card-close"
        onClick={() => toggleDetailsCard()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle details"
      >
        <i className="fa fa-times" />
      </div>
      <div className="card-title">
        <h4>Node details {detailsLoader}</h4>
      </div>

      <div className="card-body">
        <div className="card-content">
          <div className="node-relations-title">
            <div>
              <Label>Entity: </Label> {nodeLink}
            </div>
            <div>
              <Label>Steps:</Label>{' '}
              <Badge
                color={step1Color}
                pill
                size="sm"
                onClick={() => setSteps(1)}
              >
                1
              </Badge>{' '}
              <Badge
                color={step2Color}
                pill
                size="sm"
                onClick={() => setSteps(2)}
              >
                2
              </Badge>{' '}
              <Badge
                color={step3Color}
                pill
                size="sm"
                onClick={() => setSteps(3)}
              >
                3
              </Badge>{' '}
              <Badge
                color={step4Color}
                pill
                size="sm"
                onClick={() => setSteps(4)}
              >
                4
              </Badge>{' '}
              <Badge
                color={step5Color}
                pill
                size="sm"
                onClick={() => setSteps(5)}
              >
                5
              </Badge>{' '}
              <Badge
                color={step6Color}
                pill
                size="sm"
                onClick={() => setSteps(6)}
              >
                6
              </Badge>
            </div>
          </div>
          <div>
            <Label>
              Related nodes [<b>{relatedNodesItems.length}</b>]
            </Label>
          </div>
          <LazyList
            limit={30}
            range={15}
            items={relatedNodesItems}
            containerClass="node-relations-list"
            listClass="entries-list"
            renderItem={renderRelatedNodeHTMLItem}
          />
        </div>
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
  const graphDrawing =
    drawingIndicator.length > 0 ? (
      <div className="graph-drawing">{drawingIndicator}</div>
    ) : (
      []
    );
  return (
    <div style={{ position: 'relative', display: 'block' }}>
      {graphDrawing}
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
        permalink="network-graph-help"
        visible={helpVisible}
        toggle={toggleHelp}
      />
    </div>
  );
};
GraphNetwork.defaultProps = {
  relatedLinks: [],
  relatedNodes: [],
};
GraphNetwork.propTypes = {
  relatedLinks: PropTypes.array,
  relatedNodes: PropTypes.array,
};
export default GraphNetwork;
