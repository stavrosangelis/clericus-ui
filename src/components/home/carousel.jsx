import React, { useState, useEffect, useRef } from 'react';
import {
  Spinner,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption,
} from 'reactstrap';
import axios from 'axios';

import '../../scss/carousel.scss';

const { REACT_APP_APIPATH: APIPath } = process.env;

function HomeSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [items, setItems] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState([]);
  const [imgPaths, setImgPaths] = useState([]);
  const prevImgPaths = useRef(null);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}carousel`,
        crossDomain: true,
        signal: controller.signal,
      })
        .then((response) => response.data.data)
        .catch((error) => console.log(error));
      if (!unmounted) {
        setLoading(false);
        const { data: newItems = [] } = responseData;
        if (newItems.length > 0) {
          const newPaths = newItems.map(
            (i) =>
              i.imageDetails.paths.find((p) => p.pathType === 'thumbnail').path
          );
          const newIndicators = newItems.map((i) => ({
            key: i._id,
          }));
          setItems(newItems);
          setIndicators(newIndicators);
          setImgPaths(newPaths);
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
    const loadImages = (itemsParam) => {
      if (imgPaths.length > 0) {
        const newImagePaths = Object.assign([], imgPaths);
        for (let i = 0; i < itemsParam.length; i += 1) {
          const item = itemsParam[i];
          const { path } = item.imageDetails.paths.find(
            (p) => p.pathType === 'source'
          );

          const imageLoader = new Image();
          imageLoader.src = path;
          imageLoader.onload = () => {
            newImagePaths[i] = path;
            setImgPaths(newImagePaths);
          };
        }
      }
    };
    if (
      prevImgPaths.current === null &&
      imgPaths.length > 0 &&
      items.length > 0
    ) {
      prevImgPaths.current = imgPaths;
      loadImages(items);
    }
  }, [items, imgPaths]);

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  const defaultItem = (
    <CarouselItem
      onExiting={() => setAnimating(true)}
      onExited={() => setAnimating(false)}
      key={0}
    >
      <div className="carousel-default-item">
        <Spinner style={{ width: '60px', height: '60px' }} color="info" />
      </div>
    </CarouselItem>
  );

  let slides = [defaultItem];
  const itemsLength = items.length;
  if (itemsLength > 0) {
    slides = [];
  }
  for (let i = 0; i < itemsLength; i += 1) {
    const item = items[i];
    const imgURL = imgPaths[i];

    const carouselImgStyle = {
      backgroundImage: `url(${imgURL})`,
      backgroundSize: 'cover',
    };
    const caption = [];
    if (item.caption !== '') {
      caption.push(<span key={0}>{item.caption}</span>);
    }
    if (item.url !== '') {
      caption.push(
        <a
          key={1}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm carousel-caption-link"
        >
          More...
        </a>
      );
    }
    let overlay = [];
    if (caption.length > 0) {
      overlay = <div className="carousel-overlay" />;
    }
    slides.push(
      <CarouselItem
        onExiting={() => setAnimating(true)}
        onExited={() => setAnimating(false)}
        key={item._id}
      >
        <div className="carousel-img" style={carouselImgStyle} />
        {overlay}
        <CarouselCaption captionText={caption} captionHeader={item.label} />
      </CarouselItem>
    );
  }

  return (
    <Carousel
      activeIndex={activeIndex}
      next={next}
      previous={previous}
      pause="hover"
      className="home-carousel"
      ride="carousel"
    >
      <CarouselIndicators
        items={indicators}
        activeIndex={activeIndex}
        onClickHandler={goToIndex}
      />
      {slides}
      <CarouselControl
        direction="prev"
        directionText="Previous"
        onClickHandler={previous}
      />
      <CarouselControl
        direction="next"
        directionText="Next"
        onClickHandler={next}
      />
    </Carousel>
  );
}

export default HomeSlider;
