import React, { useState, useEffect, useRef, useCallback } from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
import { Card, CardBody } from 'reactstrap';

const APIPath = process.env.REACT_APP_APIPATH;

const HighLights = props => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [width, setWidth] = useState("100%");
  const [containerInnerWidth, setContainerInnerWidth] = useState("100%");
  const [containerInnerLeft, setContainerInnerLeft] = useState(0);
  const [hiddenWidth, setHiddenWidth] = useState(0);
  const container = useRef(null);

  const resize = useCallback(() => {
    let bbox = container.current.getBoundingClientRect();
    let containerWidth = bbox.width;
    let perc = 100;
    if (containerWidth<=480) {
      perc = 100;
    }
    if (containerWidth>480 && containerWidth<576) {
      perc = 50;
    }
    if (containerWidth>576 && containerWidth<768) {
      perc = 33.333;
    }
    if (containerWidth>767) {
      perc = 25;
    }
    let itemWidth = (containerWidth*perc)/100;
    itemWidth -= 15;
    itemWidth = Math.ceil(itemWidth)
    setWidth(itemWidth);
    let newInnerWidth = items.length*(itemWidth+15);
    setContainerInnerWidth(newInnerWidth);
    let newHiddenWidth = 0;
    if (newInnerWidth>containerWidth) {
      newHiddenWidth = newInnerWidth-containerWidth;
    }
    setHiddenWidth(newHiddenWidth);
  },[items.length]);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let params = {
        page: 1,
        limit: 8,
      };
      let responseData = await axios({
        method: 'get',
        url: APIPath+'ui-highlights',
        crossDomain: true,
        params: params
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setItems(responseData);
    }
    if (loading) {
      load();
    }
  },[loading]);

  useEffect(()=>{
    if (!loading && items.length>0) {
      resize()
    }
  },[loading,items,resize])

  useEffect(()=>{
    window.addEventListener("resize", resize);
    return(()=>{
      window.removeEventListener("resize", resize);
    })
  })

  const flipItems = (direction) => {
      let bbox = container.current.getBoundingClientRect();
      let containerWidth = bbox.width;
      let newLeft = 0;
      let itemWidth = width+15;
      let number = 1;
      if (direction==="right") {
        newLeft = containerInnerLeft-itemWidth;
      }
      else if (direction==="left") {
        newLeft = containerInnerLeft+itemWidth;
      }
      if (containerWidth<=480) {
        number = 1;
      }
      if (containerWidth>480 && containerWidth<576) {
        number = 2;
      }
      if (containerWidth>576 && containerWidth<768) {
        number = 3;
      }
      if (containerWidth>767) {
        number = 4;
      }

      let absLeft = Math.abs(newLeft);
      absLeft = Math.ceil(absLeft) + (itemWidth*number);
      if (absLeft>containerInnerWidth) {
        newLeft = 0;
      }
      if(newLeft>0) {
        newLeft = 0
      }
      setContainerInnerLeft(newLeft)

  }

  const itemHTML = (item, key) => {
    let parseUrl = `/article/${item.permalink}`;
    let thumbnailPath = [];
    let featuredImage = item.featuredImageDetails;
    if (featuredImage!==null) {
      thumbnailPath = featuredImage.paths.find(p=>p.pathType==="thumbnail").path;
    }
    let newDate = new Date(item.updatedAt);
    let y = newDate.getFullYear();
    let m = newDate.getMonth();
    if (m<10) {
      m = `0${m}`;
    }
    let d = newDate.getDay();
    if (d<10) {
      d = `0${d}`;
    }
    let date = `${y}-${m}-${d}`;
    return <div className="home-highlight-container" key={item._id+"-"+key} style={{width: width}}>
      <Card className="home-highlight">
        <CardBody>
          <div className="home-highlight-img" style={{backgroundImage: `url("${thumbnailPath}")`}}></div>
          <div className="home-highlight-text">
            <h4><Link to={parseUrl} href={parseUrl}>{item.label}</Link></h4>
            <div className="home-highlight-caption">
              <i className="pe-7s-user" /> {item.author}
              {" "}<i className="pe-7s-clock" /> {date}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  }

  let highlights = [];
  if (!loading && items.length>0) {

    highlights = items.map(item=>itemHTML(item, 1));
  }
  let containerInnerStyle = {
    width: containerInnerWidth,
    left: containerInnerLeft
  }
  return (
    <div>
      <h3 className="section-title"><span><span>H</span>ighlights</span></h3>
      <div className="highlights-controls">
        <div className="left" onClick={()=>{flipItems("left")}}><i className="fa fa-chevron-left" /></div>
        <div className="right" onClick={()=>{flipItems("right")}}><i className="fa fa-chevron-right" /></div>
      </div>
      <div className="highlights-container" ref={container}>
        <div className="highlights-container-inner" ref={container} style={containerInnerStyle}>{highlights}</div>
      </div>
    </div>
  );
}

export default HighLights;
