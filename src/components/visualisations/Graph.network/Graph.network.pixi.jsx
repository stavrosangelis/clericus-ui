import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import { Link } from 'react-router-dom';
import { Progress } from 'reactstrap';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import DataWorker from './Data.worker';
import { webglSupport, debounce } from '../../../helpers';
import HelpArticle from '../../Help.article';
import Search from './Search';
import Statistics from './Statistics';
import DetailsCardNode from './Details.card.node';
import DetailsCardPaths from './Details.card.paths';

// sprites
import classpieceSpr from '../../../assets/images/node.classpiece.png';
import classpieceSprSel from '../../../assets/images/node.classpiece.selected.png';
import classpieceSprOpq from '../../../assets/images/node.classpiece.opaque.png';
import eventSpr from '../../../assets/images/node.event.png';
import eventSprSel from '../../../assets/images/node.event.selected.png';
import eventSprOpq from '../../../assets/images/node.event.opaque.png';
import organisationSpr from '../../../assets/images/node.organisation.png';
import organisationSprSel from '../../../assets/images/node.organisation.selected.png';
import organisationSprOpq from '../../../assets/images/node.organisation.opaque.png';
import personSpr from '../../../assets/images/node.person.png';
import personSprSel from '../../../assets/images/node.person.selected.png';
import personSprOpq from '../../../assets/images/node.person.opaque.png';
import resourceSpr from '../../../assets/images/node.resource.png';
import resourceSprSel from '../../../assets/images/node.resource.selected.png';
import resourceSprOpq from '../../../assets/images/node.resource.opaque.png';

const { REACT_APP_APIPATH: APIPath } = process.env;

/// d3 network

let app;
let container;
let nodes;
let links;
let width = 600;
const height = 600;
const resolution = 1; // window.devicePixelRatio;
const transform = { s: 1, x: 0, y: 0 };
let associatedNodes = [];
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

const loader = new PIXI.Loader();

const drawNodes = async () => {
  if (typeof nodes === 'undefined') {
    return false;
  }
  if (typeof loader.resources.Arial === 'undefined') {
    loader.add('Arial', 'arial-bitmap/Arial.xml');
  }

  loader.load(() => {
    const { length: assocLength } = associatedNodes;
    const bbox = container.getVisibleBounds();
    const { x: leftX, y: topY, width: bbWidth = 0, height: bbHeight } = bbox;
    const rightX = leftX + bbWidth;
    const bottomY = topY + bbHeight;
    const { length } = nodes;
    for (let i = 0; i < length; i += 1) {
      const d = nodes[i];
      const { x, y } = d;
      if (leftX < x && rightX > x && topY < y && bottomY > y) {
        const {
          type,
          size = 30,
          selected = false,
          associated = false,
          label: dLabel = '',
        } = d;
        const radius = 30;
        let texture;
        let assoc = false;
        switch (type) {
          case 'Classpiece':
            texture = PIXI.Sprite.from(classpieceSpr);
            break;
          case 'Event':
            texture = PIXI.Sprite.from(eventSpr);
            break;
          case 'Organisation':
            texture = PIXI.Sprite.from(organisationSpr);
            break;
          case 'Person':
            texture = PIXI.Sprite.from(personSpr);
            break;
          case 'Resource':
            texture = PIXI.Sprite.from(resourceSpr);
            break;
          default:
            texture = PIXI.Sprite.from(classpieceSpr);
            break;
        }
        if (selected || associated) {
          switch (type) {
            case 'Classpiece':
              texture = PIXI.Sprite.from(classpieceSprSel);
              break;
            case 'Event':
              texture = PIXI.Sprite.from(eventSprSel);
              break;
            case 'Organisation':
              texture = PIXI.Sprite.from(organisationSprSel);
              break;
            case 'Person':
              texture = PIXI.Sprite.from(personSprSel);
              break;
            case 'Resource':
              texture = PIXI.Sprite.from(resourceSprSel);
              break;
            default:
              texture = PIXI.Sprite.from(classpieceSprSel);
              break;
          }
        } else if (assocLength > 0) {
          assoc = true;
          switch (type) {
            case 'Classpiece':
              texture = PIXI.Sprite.from(classpieceSprOpq);
              break;
            case 'Event':
              texture = PIXI.Sprite.from(eventSprOpq);
              break;
            case 'Organisation':
              texture = PIXI.Sprite.from(organisationSprOpq);
              break;
            case 'Person':
              texture = PIXI.Sprite.from(personSprOpq);
              break;
            case 'Resource':
              texture = PIXI.Sprite.from(resourceSprOpq);
              break;
            default:
              texture = PIXI.Sprite.from(classpieceSprOpq);
              break;
          }
        }
        if (size > 31) {
          const scale = size / 30;
          texture.scale.set(scale, scale);
        }
        texture.anchor.set(0.5);
        texture.x = x;
        texture.y = y;
        d.visible = true;
        d.texture = texture;
        d.texture.interactive = true;
        d.texture.on('click', () => publicFunctions.clickNode(d));
        d.texture.on('tap', () => publicFunctions.clickNode(d));
        const lineWidth = 1;
        nodesContainer.addChild(d.texture);
        if (dLabel !== '' && container.scaled > 0.5) {
          const label = dLabel.trim().replace(/  +/g, ' ');
          const spaces = label.split(' ');
          const minusY = spaces.length / 2;
          const text = new PIXI.BitmapText(label, {
            fontName: 'Arial',
            fontSize: 10,
            align: 'center',
            roundPixels: true,
            cacheAsBitmap: true,
            tint: 0x111111,
          });
          if (assoc) {
            text.alpha = 0.2;
          }
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
  const { scaled } = container;
  const { length: assocLength } = associatedNodes;
  const bbox = container.getVisibleBounds();
  const { x: leftX, y: topY, width: bbWidth = 0, height: bbHeight } = bbox;
  const rightX = leftX + bbWidth;
  const bottomY = topY + bbHeight;
  const { length } = links;
  for (let i = 0; i < length; i += 1) {
    const d = links[i];
    const { source, target, associated = false } = d;
    const { x: sx, y: sy } = source;
    const { x: tx, y: ty } = target;

    if (assocLength > 0 && associated) {
      const line = new PIXI.Graphics();
      let lWidth = 0.5;
      let strokeStyle = 0x666666;
      if (associated) {
        lWidth = 5;
        strokeStyle = 0x33729f;
      } else if (assocLength > 0) {
        line.alpha = 0.1;
      }
      line.lineStyle(lWidth, strokeStyle);
      line.moveTo(sx, sy);
      line.lineTo(tx, ty);
      lineContainer.addChild(line);
    } else if (
      scaled > 0.15 &&
      leftX < sx &&
      rightX > sx &&
      topY < sy &&
      bottomY > sy &&
      leftX < tx &&
      rightX > tx &&
      topY < ty &&
      bottomY > ty
    ) {
      const line = new PIXI.Graphics();
      let lWidth = 0.5;
      let strokeStyle = 0x666666;
      if (associated) {
        lWidth = 5;
        strokeStyle = 0x33729f;
      } else if (assocLength > 0) {
        line.alpha = 0.1;
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
  drawNodes();
  drawLines();
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

export default function GraphNetwork() {
  // state
  const [initiated, setInitiated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [data, setData] = useState(null);
  const [detailsCardVisible, setDetailsCardVisible] = useState(false);
  const [nodeLink, setNodeLink] = useState(null);
  const [relatedNodesItems, setRelatedNodesItems] = useState({
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    resources: [],
  });
  const [helpVisible, setHelpVisible] = useState(false);
  const [loadingNode, setLoadingNode] = useState(false);
  const [nodeId, setNodeId] = useState(null);
  const [stats, setStats] = useState({
    fileCreateTime: '0ms',
    links: 0,
    nodes: 0,
    simulationTime: '0ms',
  });
  const [searchNodeSource, setSearchNodeSource] = useState(null);
  const [searchNodeTarget, setSearchNodeTarget] = useState(null);

  const [webWorkerProgress, setWebWorkerProgress] = useState(0);
  const [webWorkerTotal, setWebWorkerTotal] = useState(0);

  const [shortestPath, setShortestPath] = useState(null);
  const [searchPathsSuccess, setSearchPathsSuccess] = useState(false);
  const [searchPathsError, setSearchPathsError] = useState('');
  const [openDetailsCard, setOpenDetailsCard] = useState(false);

  const clearAssociated = () => {
    const { length: nLength } = associatedNodes;
    const { length: lLength } = links;
    for (let n = 0; n < nLength; n += 1) {
      const item = associatedNodes[n];
      item.associated = false;
      delete item.associated;
    }
    for (let l = 0; l < lLength; l += 1) {
      const item = links[l];
      if (typeof item.associated !== 'undefined') {
        item.associated = false;
        delete item.associated;
      }
    }
    associatedNodes = [];
    if (
      typeof selectedNode !== 'undefined' &&
      typeof selectedNode.selected !== 'undefined'
    ) {
      selectedNode.selected = false;
      delete selectedNode.selected;
    }
    redraw();
  };

  const toggleDetailsCard = (value = null) => {
    let visible = !detailsCardVisible;
    if (value !== null) visible = value;
    if (!visible) {
      clearAssociated();
    }
    setDetailsCardVisible(visible);
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
      setLoading(false);
      const loadSize = await axios({
        method: 'get',
        url: `${APIPath}graph-network-size`,
        crossDomain: true,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      setWebWorkerTotal(loadSize);
      const workerParams = { APIPath };
      dataLoadingWorker.postMessage(workerParams);
      const newData = await new Promise((resolve) => {
        dataLoadingWorker.addEventListener(
          'message',
          (e) => {
            const [total = 0, eData = ''] = e.data;
            if (total > 0) {
              setWebWorkerProgress(total);
            }

            if (eData !== '') {
              resolve(eData);
            }
          },
          false
        );
      });
      let parsedData = JSON.parse(newData);
      parsedData = JSON.parse(parsedData.data);
      const { statistics, nodes: n = [], links: l = [] } = parsedData;
      setStats({
        fileCreateTime: statistics.fileCreateTime,
        links: l.length,
        nodes: n.length,
        simulationTime: statistics.simulationTime,
      });
      setData(parsedData);
      setDrawing(true);
    };
    if (loading) {
      load();
    }
  }, [loading]);

  useEffect(() => {
    const drawGraph = async () => {
      setDrawing(false);
      const centerX = width / 2;
      const centerY = height / 2;
      transform.x = centerX;
      transform.y = centerY;

      transformEnd();

      nodes = data.nodes;
      links = data.links;
      d3.select('#graph-zoom-in').on('click', () => {
        container.zoomPercent(0.25, true);
        debounce(zoomedEnd(), 500);
      });
      d3.select('#graph-zoom-out').on('click', () => {
        if (container.scaled < 0.03) {
          return false;
        }
        container.zoomPercent(-0.25, true);
        debounce(zoomedEnd(), 500);
        return false;
      });
      d3.select('#graph-pan-up').on('click', () => {
        const newX = transform.x;
        const newY = transform.y + 200;
        container.animate({
          time: 250,
          position: new PIXI.Point(newX, newY),
        });
        debounce(zoomedEnd(), 500);
      });
      d3.select('#graph-pan-right').on('click', () => {
        const newX = transform.x - 200;
        const newY = transform.y;
        container.animate({
          time: 250,
          position: new PIXI.Point(newX, newY),
        });
        debounce(zoomedEnd(), 500);
      });
      d3.select('#graph-pan-down').on('click', () => {
        const newX = transform.x;
        const newY = transform.y - 200;
        container.animate({
          time: 250,
          position: new PIXI.Point(newX, newY),
        });
        debounce(zoomedEnd(), 500);
      });
      d3.select('#graph-pan-left').on('click', () => {
        const newX = transform.x + 200;
        const newY = transform.y;
        container.animate({
          time: 250,
          position: new PIXI.Point(newX, newY),
        });
        debounce(zoomedEnd(), 500);
      });
      // center to 1st node (ordered by incoming links) and draw
      container.animate({
        time: 250,
        position: new PIXI.Point(nodes[0].x, nodes[0].y),
      });
    };
    if (drawing && initiated) {
      drawGraph();
      container.zoomPercent(0.5, true);
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
  }, []);

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const loadNode = async (_id) => {
      setRelatedNodesItems({
        classpieces: [],
        events: [],
        organisations: [],
        people: [],
        resources: [],
      });
      setDetailsCardVisible(false);
      setLoadingNode(true);
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}item-network-related-nodes`,
        crossDomain: true,
        params: { _id },
        cancelToken: source.token,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      if (typeof responseData !== 'undefined') {
        setDetailsCardVisible(true);
        const { id: sId = '', type: nodeType = '', label = '' } = selectedNode;
        setNodeLink(
          <Link to={`/${nodeType}/${sId}`}>
            <b>{label}</b> [{nodeType}]
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

        const classpieces = [];
        const events = [];
        const organisations = [];
        const people = [];
        const resources = [];
        const { length: nLength } = responseData;
        for (let i = 0; i < nLength; i += 1) {
          const node = responseData[i];
          const { _id: nId = '', type = 'Classpiece' } = node;
          if (relatedNodesIds.indexOf(nId) === -1) {
            relatedNodesIds.push(nId);
          }
          const link = linkArray.indexOf(nodeType) > -1;
          node.i = i;
          node.link = link;
          switch (type) {
            case 'Classpiece':
              classpieces.push(node);
              break;
            case 'Event':
              events.push(node);
              break;
            case 'Organisation':
              organisations.push(node);
              break;
            case 'Person':
              people.push(node);
              break;
            case 'Resource':
              resources.push(node);
              break;
            default:
              break;
          }
        }
        const { length: lLength } = links;
        for (let i = 0; i < lLength; i += 1) {
          const link = links[i];
          const { source: lSource, target: lTarget } = link;
          link.associated =
            relatedNodesIds.indexOf(lSource.id) > -1 &&
            relatedNodesIds.indexOf(lTarget.id) > -1;
        }
        setRelatedNodesItems({
          classpieces,
          events,
          organisations,
          people,
          resources,
        });
        redraw();
        setLoadingNode(false);
      }
    };

    if (nodeId !== null && loadingNode) {
      loadNode(nodeId);
    }
    return () => {
      source.cancel('api request cancelled');
    };
  }, [nodeId, loadingNode]);

  const loadNodeDetails = (_id) => {
    setNodeId(_id);
    setLoadingNode(true);
  };

  const selectedNodes = () => {
    clearAssociated();
    const { id: sId = '' } = selectedNode;
    // get associated links
    const associatedLinksFilter = links.filter(
      (l) => l.target.id === sId || l.source.id === sId
    );
    const newAssociatedLinks = new Set(
      associatedLinksFilter.map((l) => l.refId)
    );

    // associate new links
    const associatedNodeIds = [];
    newAssociatedLinks.forEach((l) => {
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
    // get associated nodes
    const newAssociatedNodes = nodes.filter(
      (n) => associatedNodeIds.indexOf(n.id) > -1
    );

    // associate new nodes
    newAssociatedNodes.forEach((nParam) => {
      const n = nParam;
      n.associated = true;
    });
    associatedNodes = newAssociatedNodes;

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

  const gotoNode = (id = '') => {
    if (id !== '') {
      const prevNode = nodes.find((n) => n.selected) || null;
      if (prevNode !== null) {
        delete prevNode.selected;
      }
    }
    const node = nodes.find((n) => n.id === id);
    node.selected = true;
    selectedNode = node;
    container.animate({
      time: 250,
      position: new PIXI.Point(node.x, node.y),
    });
    toggleDetailsCard(true);
    loadNodeDetails(id);
    selectedNodes();
  };

  const centerNode = (_id = null) => {
    if (_id !== null) {
      const node = nodes.find((n) => n.id === _id);
      if (typeof node !== 'undefined') {
        const { length } = nodes;
        for (let i = 0; i < length; i += 1) {
          const n = nodes[i];
          n.selected = false;
        }
        node.selected = true;
        selectedNode = node;
        container.animate({
          time: 250,
          position: new PIXI.Point(node.x, node.y),
        });
        toggleDetailsCard(true);
        loadNodeDetails(node.id);
        selectedNodes();
      }
    }
  };

  const moveToNode = (_id = null) => {
    if (_id !== null) {
      const node = nodes.find((n) => n.id === _id);
      if (typeof node !== 'undefined') {
        container.animate({
          time: 250,
          position: new PIXI.Point(node.x, node.y),
        });
      }
    }
  };

  const selectNode = (node = null, type = 'source') => {
    if (type === 'source') {
      setSearchNodeSource(node);
    } else if (type === 'target') {
      setSearchNodeTarget(node);
    }
  };

  const clearSelectedNode = (type = 'source') => {
    if (type === 'source') {
      setSearchNodeSource(null);
    } else if (type === 'target') {
      setSearchNodeTarget(null);
    }
  };

  const searchPaths = async () => {
    const { _id: sourceId = '', systemLabel: sourceSystemLabel = 'Person' } =
      searchNodeSource;
    const { _id: targetId = '', systemLabel: targetSystemLabel = 'Person' } =
      searchNodeTarget;
    let hasError = false;
    const responseData = await axios({
      method: 'post',
      url: `${APIPath}network-find-shortest-path`,
      crossDomain: true,
      data: {
        source: {
          _id: sourceId,
          systemLabel: sourceSystemLabel,
        },
        target: {
          _id: targetId,
          systemLabel: targetSystemLabel,
        },
      },
    })
      .then((response) => {
        const { data: res = [] } = response.data;
        return res;
      })
      .catch((error) => {
        const { data: err = '' } = error.response;
        setSearchPathsError(err);
        setSearchPathsSuccess(false);
        hasError = true;
      });
    if (!hasError) {
      setShortestPath(responseData);
      clearAssociated();
      // set source node
      selectedNode = nodes.find((n) => n.id === searchNodeSource._id);
      selectedNode.selected = true;
      container.animate({
        time: 250,
        position: new PIXI.Point(selectedNode.x, selectedNode.y),
      });
      const { length } = responseData;
      if (length > 0) {
        const { _id: sId = '' } = searchNodeSource;
        const { _id: tId = '' } = searchNodeTarget;
        const segmentNodesIds = [tId];
        const segmentLinksParts = [`${sId},${tId}`];
        for (let i = 0; i < length; i += 1) {
          const { end, start } = responseData[i];
          const { identity: startId = '' } = start;
          const { identity: endId = '' } = end;

          if (startId !== sId && segmentNodesIds.indexOf(startId) === -1) {
            segmentNodesIds.push(startId);
          }
          if (endId !== sId && segmentNodesIds.indexOf(endId) === -1) {
            segmentNodesIds.push(endId);
          }
          const pair = `${startId},${endId}`;
          if (segmentLinksParts.indexOf(pair) === -1) {
            segmentLinksParts.push(pair);
          }
        }

        const linksFilter = links.filter(
          (l) =>
            segmentLinksParts.indexOf(`${l.target.id},${l.source.id}`) > -1 ||
            segmentLinksParts.indexOf(`${l.source.id},${l.target.id}`) > -1
        );

        linksFilter.forEach((l) => {
          const link = l;
          link.associated = true;
        });

        const associatedNodesFilter = nodes.filter(
          (n) => segmentNodesIds.indexOf(n.id) > -1
        );
        associatedNodesFilter.forEach((nParam) => {
          const n = nParam;
          n.associated = true;
        });
        associatedNodes = associatedNodesFilter;
        redraw();
        setOpenDetailsCard(true);
        if (detailsCardVisible) {
          setDetailsCardVisible(false);
        }
      }
      if (searchPathsError !== '') {
        setSearchPathsError('');
      }
      setSearchPathsSuccess(true);
    }
  };

  useEffect(() => {
    if (searchPathsSuccess) {
      setSearchPathsSuccess(false);
    }
  }, [searchPathsSuccess]);

  const clearSearchPaths = () => {
    clearSelectedNode('source');
    clearSelectedNode('target');
    clearAssociated();
  };

  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
  };

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

  const detailsCard = detailsCardVisible ? (
    <DetailsCardNode
      clickNode={gotoNode}
      loadingNode={loadingNode}
      nodeLink={nodeLink}
      relatedNodesItems={relatedNodesItems}
      toggleDetailsCard={toggleDetailsCard}
    />
  ) : null;

  const detailsPathCard =
    shortestPath !== null ? (
      <DetailsCardPaths
        path={shortestPath}
        open={openDetailsCard}
        setOpen={setOpenDetailsCard}
        moveToNode={moveToNode}
        clear={clearSearchPaths}
      />
    ) : null;

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

  let loadingData = null;
  if (webWorkerProgress > 0 && webWorkerProgress <= webWorkerTotal) {
    const perc = (webWorkerProgress / webWorkerTotal) * 100;
    loadingData = (
      <div className="graph-progress">
        <div className="graph-progress-inner">
          <i>Loading data...</i>
          <Progress animated value={perc.toFixed(0)}>
            {perc.toFixed(2)}%
          </Progress>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'block' }}>
      {loadingData}
      <div id="pixi-network" onDoubleClick={() => doubleClickZoom()} />
      <div className="graph-actions">
        {panPanel}
        {zoomPanel}
        <Search
          center={centerNode}
          selectNode={selectNode}
          clearSelectedNode={clearSelectedNode}
          searchPaths={searchPaths}
          error={searchPathsError}
          success={searchPathsSuccess}
        />
        {helpIcon}
        <Statistics stats={stats} />
      </div>
      {detailsPathCard}
      {detailsCard}
      {legendPanel}
      <HelpArticle
        permalink="network-graph-help"
        visible={helpVisible}
        toggle={toggleHelp}
      />
    </div>
  );
}
