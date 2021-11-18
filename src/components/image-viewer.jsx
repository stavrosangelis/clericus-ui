import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, FormGroup, Input } from 'reactstrap';
import PropTypes from 'prop-types';
import LazyList from './lazylist';

const Viewer = (props) => {
  // state
  const [loading, setLoading] = useState(true);
  const [dimensionsLoaded, setDimensionsLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [width, setWidth] = useState();
  const [height, setHeight] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const imgRef = useRef(null);
  const tooltipRef = useRef(null);

  const [peopleData, setPeopleData] = useState([]);
  const [searchData, setSearchData] = useState([]);

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipTop, setTooltipTop] = useState(0);
  const [tooltipLeft, setTooltipLeft] = useState(0);
  const [tooltipRight, setTooltipRight] = useState('');
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipTriangle, setTooltipTriangle] = useState('');

  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // props
  const { item: propsItem, visible, path, label, toggle } = props;
  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  };

  const imgLoaded = () => {
    const peopleProps = propsItem.resources.filter((r) => {
      if (r.ref.resourceType === 'image' && r.term.label === 'hasPart') {
        return true;
      }
      return false;
    });
    setPeopleData(peopleProps);
    setLoading(false);
  };

  const imgDimensions = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const img = imgRef.current.querySelector('img');
    let newScale = 1;
    if (img !== null) {
      const currentWidth = img.naturalWidth;
      const currentHeight = img.naturalHeight;
      let newWidth = currentWidth;
      let newHeight = currentHeight;
      let ratio = 0;
      if (currentHeight > windowHeight) {
        newHeight = windowHeight;
        ratio = currentHeight / windowHeight;
        newWidth = currentWidth / ratio;
        newScale = windowHeight / currentHeight;
      }

      if (newWidth > windowWidth) {
        newWidth = windowWidth;
        ratio = currentWidth / windowWidth;
        newHeight = currentHeight / ratio;
        newScale = windowWidth / currentWidth;
      }
      // center image
      let newLeft = `-${(currentWidth - windowWidth) / 2}px`;
      let newTop = `-${(currentHeight - windowHeight) / 2}px`;
      // center left
      if (currentWidth < windowWidth) {
        newLeft = `${(windowWidth - newWidth) / 2}px`;
      }
      if (currentHeight < windowHeight) {
        newTop = `${(windowHeight - newHeight) / 2}px`;
      }

      setLeft(newLeft);
      setTop(newTop);
      setScale(newScale);
      setWidth(currentWidth);
      setHeight(currentHeight);
      setDimensionsLoaded(true);
    }
  };

  const imgDragStart = (e) => {
    if (e.type === 'mousedown' || e.type === 'click') {
      setDragging(true);
      setX(e.pageX);
      setY(e.pageY);
    }
  };

  const imgDragEnd = (e) => {
    e.stopPropagation();
    setDragging(false);
    setX(0);
    setY(0);
  };

  const updateZoom = (value) => {
    let newScale = parseFloat(scale, 10).toFixed(1);
    if (value === 'plus') {
      if (newScale < 2) {
        newScale = parseFloat(newScale, 10) + 0.1;
      }
    }
    if (value === 'minus') {
      if (newScale > 0.1) {
        newScale = parseFloat(newScale, 10) - 0.1;
      }
    }

    setScale(newScale);
  };

  const updatePan = (direction) => {
    const add = 50;
    let newTop = top;
    let newLeft = left;
    if (direction === 'up') {
      newTop = top.replace('px', '');
      newTop = parseFloat(top, 10) - add;
      newTop += 'px';
    }

    if (direction === 'right') {
      newLeft = left.replace('px', '');
      newLeft = parseFloat(left, 10) + add;
      newLeft += 'px';
    }

    if (direction === 'down') {
      newTop = top.replace('px', '');
      newTop = parseFloat(top, 10) + add;
      newTop += 'px';
    }

    if (direction === 'left') {
      newLeft = left.replace('px', '');
      newLeft = parseFloat(left, 10) - add;
      newLeft += 'px';
    }
    setTop(newTop);
    setLeft(newLeft);
  };

  const peopleToSearchData = (data) => {
    const newData = [];
    for (let i = 0; i < data.length; i += 1) {
      const n = data[i];
      let _id = null;
      let name = '';
      let altName = '';
      if (typeof n.ref !== 'undefined') {
        _id = n.ref._id;
        name = n.ref.label.replace(/\s\s/g, ' ');
      }
      if (typeof n.ref.person !== 'undefined' && n.ref.person.label !== '') {
        const personLabel = n.ref.person.label.replace(/\s\s/g, ' ');
        if (personLabel !== name) {
          altName = personLabel;
        }
      }
      const newitem = {
        i,
        _id,
        name,
        altName,
      };
      newData.push(newitem);
    }
    return newData;
  };

  useEffect(() => {
    if (!loading && visible && !dimensionsLoaded) {
      imgDimensions();
    }
  });

  useEffect(() => {
    const imgDrag = (e) => {
      e.stopPropagation();
      if (!dragging || !visible) {
        return false;
      }
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const img = imgRef.current;
      const newX = e.pageX - x;
      const newY = e.pageY - y;
      const newStyle = img.style;
      const transform = newStyle.transform.split(' ');
      let translateX = transform[0];
      let translateY = transform[1];
      translateX = translateX.replace('translateX(', '');
      translateX = translateX.replace(')px', '');
      translateX = parseFloat(translateX, 10);
      translateY = translateY.replace('translateY(', '');
      translateY = translateY.replace(')px', '');
      translateY = parseFloat(translateY, 10);

      const newTranslateX = translateX + newX;
      const newTranslateY = translateY + newY;

      if (
        e.pageX > windowWidth ||
        e.pageY > windowHeight ||
        e.pageX < 0 ||
        e.pageY <= 60 ||
        (e.pageY <= 220 && e.pageX >= windowWidth - 65)
      ) {
        setDragging(false);
        setX(0);
        setY(0);
      } else {
        setX(e.pageX);
        setY(e.pageY);
        setLeft(`${newTranslateX}px`);
        setTop(`${newTranslateY}px`);
      }
      return false;
    };
    window.addEventListener('mousemove', imgDrag);
    return () => {
      window.removeEventListener('mousemove', imgDrag);
    };
  }, [dragging, x, y, visible]);

  useEffect(() => {
    if (!visible && top !== 0 && left !== 0) {
      setDimensionsLoaded(false);
    }
  }, [visible, top, left]);

  useEffect(() => {
    if (!loading && peopleData.length > 0) {
      const newData = peopleToSearchData(peopleData);
      setSearchData(newData);
    }
  }, [peopleData, loading]);

  // render
  let visibilityStyle = { visibility: 'hidden' };
  if (visible) {
    visibilityStyle = { visibility: 'visible' };
  }

  let img = (
    <div className="row">
      <div className="col-12">
        <div style={{ padding: '100px 40px', textAlign: 'center' }}>
          <Spinner color="light" />
        </div>
      </div>
    </div>
  );
  const imgPath = path;

  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  const centerNode = (_id) => {
    const nodes = peopleData;
    const node = nodes.find((n) => n.ref._id === _id);
    if (typeof node !== 'undefined') {
      const meta = node.ref.metadata.image.default;
      const { x: metaX } = meta;
      const index = nodes.indexOf(node);
      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        if (i === index) n.selected = true;
        else n.selected = false;
      }
      setPeopleData(nodes);
      setX(metaX);
    }
    setLoading(true);
    setLoading(false);
  };

  const renderSearchItemHTML = (n) => {
    if (n._id === null) {
      return false;
    }
    const rLabel = [];
    if (n.name !== '') {
      rLabel.push(<span key="name">{n.name}</span>);
    }
    if (n.altName !== '') {
      rLabel.push(<br key="break" />);
      rLabel.push(<small key="alname">[{n.altName}]</small>);
    }
    return (
      <div
        key={n._id}
        data-id={n._id}
        onClick={() => centerNode(n._id)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="center node"
      >
        {rLabel}
      </div>
    );
  };

  if (imgPath !== null) {
    const showTooltip = (e, resource) => {
      const elem = e.target;
      const box = elem.getBoundingClientRect();
      let stateLeft = left;
      if (typeof stateLeft === 'string') {
        stateLeft = left.replace('px', '');
      }
      let stateTop = top;
      if (typeof stateTop === 'string') {
        stateTop = top.replace('px', '');
      }
      let newTooltipLeft = box.x + box.width + 12;
      const newTooltipTop = box.y + box.height / 2;
      let triangle = 'left';
      let affiliationText = '';
      if (
        typeof resource.person.affiliations !== 'undefined' &&
        resource.person.affiliations.length > 0
      ) {
        const affiliations = resource.person.affiliations.filter((i) => {
          if (
            i.ref.organisationType === 'Diocese' ||
            i.ref.organisationType === 'ReligiousOrder'
          ) {
            return true;
          }
          return false;
        });
        if (typeof affiliations !== 'undefined') {
          affiliationText = affiliations.map((a) => a.ref.label).join(' | ');
        }
      }
      let affiliationOutput = [];
      if (affiliationText !== '') {
        affiliationOutput = <div>{affiliationText}</div>;
      }
      let altName = [];
      const resourceLabel = resource.label.replace(/\s\s/g, ' ');
      if (
        typeof resource.person !== 'undefined' &&
        resource.person.label !== ''
      ) {
        const personLabel = resource.person.label.replace(/\s\s/g, ' ');
        if (personLabel !== resourceLabel) {
          altName = (
            <div>
              <i>[{resource.person.label}]</i>
            </div>
          );
        }
      }
      const tLabel = (
        <div className="text-center">
          <div>{resource.label}</div>
          {altName}
          {affiliationOutput}
        </div>
      );
      setDragging(false);
      setTooltipVisible(true);
      setTooltipTop(newTooltipTop);
      setTooltipLeft(newTooltipLeft);
      setTooltipRight('auto');
      setTooltipContent(tLabel);
      setTooltipTriangle(triangle);

      const tooltipHTML = tooltipRef.current;
      const tooltipWidth = tooltipHTML.offsetWidth;
      let newTooltipRight = 0;
      const windowWidth = window.innerWidth;

      if (newTooltipLeft + tooltipWidth > windowWidth) {
        newTooltipLeft = 'auto';
        newTooltipRight = windowWidth - box.x + 12;
        triangle = 'right';
      }

      setTooltipLeft(newTooltipLeft);
      setTooltipRight(newTooltipRight);
      setTooltipTriangle(triangle);
    };
    const people = [];
    for (let i = 0; i < peopleData.length; i += 1) {
      const r = peopleData[i];
      const resource = r.ref;
      if (typeof resource.person !== 'undefined') {
        let selected = '';
        if (typeof r.selected !== 'undefined' && r.selected) {
          selected = ' selected';
        }
        const meta = resource.metadata.image.default;
        const personStyle = {
          width: parseFloat(meta.width, 10),
          height: parseFloat(meta.height, 10),
          top: meta.y,
          left: meta.x,
        };
        if (parseFloat(meta.rotate, 10) !== 0) {
          personStyle.transform = `rotate(${meta.rotate}deg)`;
        }

        const link = `/person/${resource.person._id}`;
        const person = (
          <Link
            id={`tooltip-toggle-${resource._id}`}
            key={i}
            to={link}
            href={link}
            className={`classpiece-person${selected}`}
            style={personStyle}
            alt={resource.label}
            onMouseOver={(e) => showTooltip(e, resource)}
            onMouseLeave={() => hideTooltip()}
          >
            <span>{resource.label}</span>
          </Link>
        );
        people.push(person);
      }
    }

    const peopleLayer = (
      <div
        className="classpiece-people"
        onMouseDown={(e) => imgDragStart(e)}
        onMouseUp={(e) => imgDragEnd(e)}
        onDragEnd={(e) => imgDragEnd(e)}
        onTouchStart={(e) => imgDragStart(e)}
        onTouchEnd={(e) => imgDragEnd(e)}
        draggable={false}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="drag image"
      >
        {people}
      </div>
    );

    const imgStyle = {
      width,
      height,
      transform: `translateX(${left}) translateY(${top}) scaleX(${scale}) scaleY(${scale})`,
    };
    img = (
      <div
        style={imgStyle}
        className="classpiece-full-size"
        ref={imgRef}
        onDoubleClick={() => updateZoom('plus')}
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
        onMouseDown={(e) => imgDragStart(e)}
        onMouseUp={(e) => imgDragEnd(e)}
        onDragEnd={(e) => imgDragEnd(e)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="drag image"
      >
        {peopleLayer}
        <img
          src={imgPath}
          onLoad={() => imgLoaded()}
          alt={label}
          draggable={false}
        />
      </div>
    );
  }

  const searchNode = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInput(value);
    const visibleNodes = peopleData.filter((n) => {
      if (
        n.ref.label.toLowerCase().includes(value.toLowerCase()) ||
        (typeof n.ref.person !== 'undefined' &&
          n.ref.person.label.toLowerCase().includes(value.toLowerCase()))
      ) {
        return true;
      }
      return false;
    });
    const newData = peopleToSearchData(visibleNodes);
    setSearchData(newData);
  };

  const clearSearchNode = () => {
    setSearchInput('');
    const newData = peopleToSearchData(peopleData);
    setSearchData(newData);
  };

  const searchIcon = (
    <div
      className="img-viewer-search-toggle"
      onClick={() => toggleSearchContainerVisible()}
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="toggle search container"
    >
      <i className="fa fa-search" />
    </div>
  );
  const zoomPanel = (
    <div className="zoom-container">
      <div
        className="zoom-action"
        onClick={() => updateZoom('plus')}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="zoom in"
      >
        <i className="fa fa-plus" />
      </div>
      <div
        className="zoom-action"
        onClick={() => updateZoom('minus')}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="zoom out"
      >
        <i className="fa fa-minus" />
      </div>
    </div>
  );

  const panPanel = (
    <div className="pan-container">
      <div
        className="pan-action up"
        onClick={() => updatePan('up')}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="pan up"
      >
        <i className="fa fa-chevron-up" />
      </div>

      <div
        className="pan-action right"
        onClick={() => updatePan('right')}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="pan right"
      >
        <i className="fa fa-chevron-right" />
      </div>

      <div
        className="pan-action down"
        onClick={() => updatePan('down')}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="pan down"
      >
        <i className="fa fa-chevron-down" />
      </div>

      <div
        className="pan-action left"
        onClick={() => updatePan('left')}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="pan left"
      >
        <i className="fa fa-chevron-left" />
      </div>
    </div>
  );
  let searchContainerVisibleClass = '';
  if (searchContainerVisible) {
    searchContainerVisibleClass = ' visible';
  }

  let searchList = [];
  if (!loading && searchData.length > 0) {
    searchList = (
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
    <div
      className={`img-viewer-search-container graph-search-container${searchContainerVisibleClass}`}
    >
      <div
        className="close-graph-search-container"
        onClick={() => toggleSearchContainerVisible()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="hide search container"
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
      {searchList}
    </div>
  );

  // tooltip
  const tooltipStyle = {
    top: tooltipTop,
    left: tooltipLeft,
    right: tooltipRight,
  };
  let tooltipVisibleClass = '';
  if (tooltipVisible) {
    tooltipVisibleClass = ' active';
  }
  const tooltipHTML = (
    <div
      className={`classpiece-tooltip${tooltipVisibleClass}`}
      style={tooltipStyle}
      onMouseOver={() => hideTooltip()}
      onFocus={() => false}
      onBlur={() => false}
      ref={tooltipRef}
    >
      {tooltipContent}
      <div className={`classpiece-triangle-${tooltipTriangle}`} />
    </div>
  );
  return (
    <div style={visibilityStyle} className="classpiece-viewer">
      <div
        className="classpiece-viewer-bg"
        onClick={() => toggle()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="show classpiece viewer"
      />
      <div className="classpiece-viewer-header">
        <h4>{label}</h4>
        <div className="classpiece-viewer-close">
          <i
            className="pe-7s-close"
            onClick={() => toggle()}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="hide classpiece viewer"
          />
        </div>
      </div>
      {img}
      {zoomPanel}
      {panPanel}
      {searchIcon}
      {tooltipHTML}
      {searchContainer}
    </div>
  );
};

Viewer.defaultProps = {
  visible: false,
  path: '',
  label: '',
  toggle: () => {},
  item: null,
};
Viewer.propTypes = {
  visible: PropTypes.bool,
  path: PropTypes.string,
  label: PropTypes.string,
  toggle: PropTypes.func,
  item: PropTypes.object,
};

export default Viewer;
