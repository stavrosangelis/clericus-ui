import React, { useState, useEffect } from 'react';
import {
  Spinner,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption
} from 'reactstrap';
import axios from 'axios';

import defaultImg from '../../assets/images/carousel-default.png';

const APIPath = process.env.REACT_APP_APIPATH;

const HomeSlider = (props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState([]);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'slideshow-items',
        crossDomain: true,
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setItems(responseData.data);
    }
    if (loading) {
      load();
    }
  },[loading]);

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  }

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  }

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  }

  let defaultItem = <CarouselItem
    onExiting={() => setAnimating(true)}
    onExited={() => setAnimating(false)}
    key={0}
  >
    <div className="carousel-default-item">
      <Spinner style={{ width: '60px', height: '60px' }} color="info" />
    </div>
    <img height={460} alt="" src={defaultImg}/>
  </CarouselItem>
  let slides = [defaultItem];
  let itemsLength = items.length;
  if (itemsLength>0) {
    slides = [];
  }
  for (let i=0;i<itemsLength;i++) {
    let item = items[i];
    let fullImg = item.imageDetails.paths.find(p=>p.pathType==="source").path;
    let carouselImgStyle = {
      backgroundImage: `url(${fullImg})`,
      backgroundSize: 'cover',
    }
    let caption = [];
    if (item.caption!=="") {
      caption.push(<span key={0}>{item.caption}</span>);
    }
    if (item.url!=="") {
      caption.push(<a key={1} href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm carousel-caption-link">More...</a>);
    }
    let overlay = [];
    if (caption.length>0) {
      overlay = <div className="carousel-overlay"></div>;
    }
    slides.push(
      <CarouselItem
        onExiting={() => setAnimating(true)}
        onExited={() => setAnimating(false)}
        key={item._id}
      >
        <div className="carousel-img" style={carouselImgStyle}></div>
        {overlay}
        <img height={460} alt={item.label} src={defaultImg}/>
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
    >
      <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
      {slides}
      <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
      <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
    </Carousel>
  )
}


export default HomeSlider;
