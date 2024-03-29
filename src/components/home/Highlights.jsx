import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardBody } from 'reactstrap';

import '../../scss/highlights.scss';

const { REACT_APP_APIPATH: APIPath } = process.env;

function HighLights() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [width, setWidth] = useState('100%');
  const [containerInnerWidth, setContainerInnerWidth] = useState('100%');
  const [containerInnerLeft, setContainerInnerLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const container = useRef(null);

  const resize = useCallback(() => {
    const bbox = container.current.getBoundingClientRect();
    const containerWidth = bbox.width;
    let perc = 100;
    if (containerWidth <= 480) {
      perc = 100;
    }
    if (containerWidth > 480 && containerWidth < 576) {
      perc = 50;
    }
    if (containerWidth > 576 && containerWidth < 768) {
      perc = 33.333;
    }
    if (containerWidth > 767) {
      perc = 25;
    }
    let itemWidth = (containerWidth * perc) / 100;
    itemWidth -= 15;
    itemWidth = Math.ceil(itemWidth);
    setWidth(itemWidth);
    const newInnerWidth = items.length * (itemWidth + 15);
    setContainerInnerWidth(newInnerWidth);
  }, [items.length]);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      const params = {
        page: 1,
        limit: 8,
      };
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}ui-highlights`,
        crossDomain: true,
        params,
        signal: controller.signal,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (!unmounted) {
        setLoading(false);
        const { data = [] } = responseData;
        if (data.length > 0) {
          setItems(data);
        }
      }
    };
    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading]);

  useEffect(() => {
    if (!loading && items.length > 0) {
      resize();
    }
  }, [loading, items, resize]);

  useEffect(() => {
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  });

  const flipItems = useCallback(
    (direction) => {
      const bbox = container.current.getBoundingClientRect();
      const containerWidth = bbox.width;
      let newLeft = 0;
      const itemWidth = width + 15;
      let number = 1;
      if (direction === 'right') {
        newLeft = containerInnerLeft - itemWidth;
      } else if (direction === 'left') {
        newLeft = containerInnerLeft + itemWidth;
      }
      if (containerWidth <= 480) {
        number = 1;
      }
      if (containerWidth > 480 && containerWidth < 576) {
        number = 2;
      }
      if (containerWidth > 576 && containerWidth < 768) {
        number = 3;
      }
      if (containerWidth > 767) {
        number = 4;
      }

      let absLeft = Math.abs(newLeft);
      absLeft = Math.ceil(absLeft) + itemWidth * number;
      if (absLeft > containerInnerWidth) {
        newLeft = 0;
      }
      if (newLeft > 0) {
        newLeft = 0;
      }
      if (Number.isNaN(newLeft)) {
        newLeft = 0;
      }
      setContainerInnerLeft(newLeft);
    },
    [containerInnerLeft, containerInnerWidth, width]
  );

  const itemHTML = (item, key) => {
    const parseUrl = `/article/${item.permalink}`;
    let thumbnailPath = [];
    const featuredImage = item.featuredImageDetails;
    if (featuredImage !== null) {
      thumbnailPath = featuredImage.paths.find(
        (p) => p.pathType === 'thumbnail'
      ).path;
    }
    const newDate = new Date(item.updatedAt);
    const y = newDate.getFullYear();
    let m = newDate.getMonth();
    if (m < 10) {
      m = `0${m}`;
    }
    let d = newDate.getDay();
    if (d < 10) {
      d = `0${d}`;
    }
    const date = `${y}-${m}-${d}`;
    return (
      <div
        className="home-highlight-container"
        key={`${item._id}-${key}`}
        style={{ width }}
      >
        <Card className="home-highlight">
          <CardBody>
            <div
              className="home-highlight-img"
              style={{ backgroundImage: `url("${thumbnailPath}")` }}
            >
              <Link to={parseUrl} href={parseUrl}>
                <span className="hidden">{item.label}</span>
              </Link>
            </div>
            <div className="home-highlight-text">
              <h4>
                <Link to={parseUrl} href={parseUrl}>
                  {item.label}
                </Link>
              </h4>
              <div className="home-highlight-caption">
                <i className="pe-7s-user" /> {item.author}{' '}
                <i className="pe-7s-clock" /> {date}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  let highlights = [];
  if (!loading && items.length > 0) {
    highlights = items.map((item) => itemHTML(item, 1));
  }
  const containerInnerStyle = {
    width: containerInnerWidth,
    left: containerInnerLeft,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      flipItems('right');
    }, 3000);
    if (!timerActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, flipItems]);

  return (
    <div
      onMouseOver={() => setTimerActive(false)}
      onMouseOut={() => setTimerActive(true)}
      onFocus={() => false}
      onBlur={() => false}
    >
      <h3 className="section-title">
        <span>
          <span>H</span>ighlights
        </span>
        <div className="highlights-controls">
          <div
            className="left"
            onClick={() => {
              flipItems('left');
            }}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="flip items left"
          >
            <i className="fa fa-chevron-left" />
          </div>
          <div
            className="right"
            onClick={() => {
              flipItems('right');
            }}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="flip items right"
          >
            <i className="fa fa-chevron-right" />
          </div>
        </div>
      </h3>

      <div className="highlights-container" ref={container}>
        <div
          className="highlights-container-inner"
          ref={container}
          style={containerInnerStyle}
        >
          {highlights}
        </div>
      </div>
    </div>
  );
}

export default HighLights;
