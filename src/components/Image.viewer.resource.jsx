import React, { useState, useEffect, useRef } from 'react';
import { Spinner } from 'reactstrap';
import PropTypes from 'prop-types';

function Viewer(props) {
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

  // props
  const {
    visible,
    index,
    length,
    setIndex,
    path: imgPath,
    label,
    toggle,
  } = props;

  const imgRef = useRef(null);
  const imgLoaded = () => {
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
    // reset image position and dimension if index is updated
    if (visible) {
      setTimeout(() => {
        imgDimensions();
      }, 150);
    }
  }, [visible, index]);

  const updateIndex = (type) => {
    let prevIndex = index - 1;
    let nextIndex = index + 1;
    if (prevIndex < 0) {
      prevIndex = length - 1;
    }
    if (nextIndex >= length) {
      nextIndex = 0;
    }
    let newIndex = 0;
    if (type === 'prev') {
      newIndex = prevIndex;
    }
    if (type === 'next') {
      newIndex = nextIndex;
    }
    setIndex(newIndex);
  };

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

  if (imgPath !== null) {
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
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
        onMouseDown={(e) => imgDragStart(e)}
        onMouseUp={(e) => imgDragEnd(e)}
        onDragEnd={(e) => imgDragEnd(e)}
        onTouchStart={(e) => imgDragStart(e)}
        onTouchEnd={(e) => imgDragEnd(e)}
        onDoubleClick={() => updateZoom('plus')}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="pan image"
      >
        <img
          src={imgPath}
          onLoad={() => imgLoaded()}
          alt={label}
          draggable={false}
        />
      </div>
    );
  }

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
        aria-label="pandown"
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

  let prev = [];
  let next = [];
  if (length > 1) {
    prev = (
      <div
        className="img-viewer-actions img-viewer-left"
        onClick={() => updateIndex('prev')}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="show previous"
      >
        <i className="fa fa-angle-left" />
      </div>
    );
    next = (
      <div
        className="img-viewer-actions img-viewer-right"
        onClick={() => updateIndex('next')}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="show nexrt"
      >
        <i className="fa fa-angle-right" />
      </div>
    );
  }
  return (
    <div style={visibilityStyle} className="classpiece-viewer">
      <div
        className="classpiece-viewer-bg"
        onClick={() => toggle()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="show image viewer"
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
            aria-label="hide image viewer"
          />
        </div>
      </div>
      {img}
      {zoomPanel}
      {panPanel}
      {next}
      {prev}
    </div>
  );
}

Viewer.defaultProps = {
  visible: false,
  index: -1,
  length: 0,
  setIndex: () => {},
  path: '',
  label: '',
  toggle: () => {},
};
Viewer.propTypes = {
  visible: PropTypes.bool,
  index: PropTypes.number,
  length: PropTypes.number,
  setIndex: PropTypes.func,
  path: PropTypes.string,
  label: PropTypes.string,
  toggle: PropTypes.func,
};
export default Viewer;
