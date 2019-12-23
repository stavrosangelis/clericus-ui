import React, { useState, useEffect, useRef } from 'react';
import { Link} from 'react-router-dom';
import {
  Spinner
} from 'reactstrap';

const Viewer = (props) => {
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

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipTop, setTooltipTop] = useState(0);
  const [tooltipLeft, setTooltipLeft] = useState(0);
  const [tooltipRight, setTooltipRight] = useState("");
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipTriangle, setTooltipTriangle] = useState("");

  const imgLoaded = () => {
    setLoading(false);
  }

  const imgDimensions = () => {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let img = imgRef.current.querySelector("img");
    let newScale = 1;
    if (img!==null) {
      let currentWidth = img.naturalWidth;
      let currentHeight = img.naturalHeight;
      let newWidth = currentWidth;
      let newHeight = currentHeight;
      let ratio = 0;
      if (currentHeight>windowHeight) {
        newHeight = windowHeight;
        ratio = currentHeight/windowHeight;
        newWidth = currentWidth/ratio;
        newScale = windowHeight/currentHeight;
      }

      if (newWidth>windowWidth) {
        newWidth = windowWidth;
        ratio = currentWidth/windowWidth;
        newHeight = currentHeight/ratio;
        newScale = windowWidth/currentWidth;
      }
      // center image
      let newLeft = "-"+(currentWidth - windowWidth)/2+"px";
      let newTop = "-"+(currentHeight-windowHeight)/2+"px";
      // center left
      if (currentWidth<windowWidth) {
        newLeft = (windowWidth - newWidth)/2+"px";
      }
      if (currentHeight<windowHeight) {
        newTop = (windowHeight - newHeight)/2+"px";
      }

      setLeft(newLeft)
      setTop(newTop)
      setScale(newScale)
      setWidth(currentWidth)
      setHeight(currentHeight)
      setDimensionsLoaded(true)
    }
  }

  const imgDragStart = (e) => {
    if (e.type==="mousedown" || e.type==="click") {
      setDragging(true);
      setX(e.pageX);
      setY(e.pageY);
    }
  }

  const imgDragEnd = (e) => {
    e.stopPropagation();
    setDragging(false);
    setX(0);
    setY(0);
  }

  const updateZoom = (value) => {
    let newScale = parseFloat(scale,10).toFixed(1);
    if (value==="plus") {
      if (newScale<2){
        newScale = parseFloat(newScale,10)+0.1;
      }
    }
    if (value==="minus") {
      if (newScale>0.1){
        newScale = parseFloat(newScale,10) - 0.1;
      }
    }

    setScale(newScale);
  }

  const updatePan = (direction) => {
    let add = 50;
    let newTop = top;
    let newLeft= left;
    if (direction==="up") {
      newTop = top.replace("px", "");
      newTop = parseFloat(top,10)-add;
      newTop = newTop+"px";
    }

    if (direction==="right") {
      newLeft = left.replace("px", "");
      newLeft = parseFloat(left,10)+add;
      newLeft = newLeft+"px";
    }

    if (direction==="down") {
      newTop = top.replace("px", "");
      newTop = parseFloat(top,10)+add;
      newTop = newTop+"px";
    }

    if (direction==="left") {
      newLeft = left.replace("px", "");
      newLeft = parseFloat(left,10)-add;
      newLeft = newLeft+"px";
    }
    setTop(newTop);
    setLeft(newLeft);
  }

  useEffect(()=> {
    if (!loading && props.visible && !dimensionsLoaded) {
      imgDimensions();
    }
  });

  useEffect(()=> {
    const imgDrag = (e) => {
      e.stopPropagation();
      if (!dragging || !props.visible) {
        return false;
      }
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      let img = imgRef.current;
      let newX = e.pageX-x;
      let newY = e.pageY-y;
      let newStyle = img.style;
      let transform = newStyle.transform.split(" ");
      let translateX = transform[0];
      let translateY = transform[1];
      translateX = translateX.replace("translateX(", "");
      translateX = translateX.replace(")px", "");
      translateX = parseFloat(translateX, 10);
      translateY = translateY.replace("translateY(", "");
      translateY = translateY.replace(")px", "");
      translateY = parseFloat(translateY, 10);

      let newTranslateX = translateX+newX;
      let newTranslateY = translateY+newY;

      if (e.pageX>windowWidth || e.pageY>windowHeight || e.pageX<0 || e.pageY<=60 ||
        (e.pageY<=220 && e.pageX>=windowWidth-65)
      ) {
        setDragging(false);
        setX(0);
        setY(0);
      }
      else {
        setX(e.pageX);
        setY(e.pageY);
        setLeft(newTranslateX+"px");
        setTop(newTranslateY+"px");
      }
    }
    window.addEventListener("mousemove", imgDrag);
    return () => {
      window.removeEventListener("mousemove", imgDrag);
    }
  }, [dragging, x, y, props.visible]);

  useEffect(()=> {
    if (!props.visible && top!==0 && left!==0) {
      setDimensionsLoaded(false)
    }
  },[props.visible, top, left])

  // render
  let visibilityStyle = {visibility: "hidden"};
  if (props.visible) {
    visibilityStyle = {visibility: "visible"};
  }

  let img = <div className="row">
    <div className="col-12">
      <div style={{padding: '100px 40px',textAlign: 'center'}}>
        <Spinner color="light" />
      </div>
    </div>
  </div>;
  let imgPath = props.path;

  const hideTooltip =()=> {
    setTooltipVisible(false);
  }
  if (imgPath!==null) {

    const showTooltip = (e, label) => {
      let elem = e.target;
      let box = elem.getBoundingClientRect();
      let stateLeft = left;
      if (typeof stateLeft==="string") {
        stateLeft = left.replace("px","");
      }
      let stateTop = top;
      if (typeof stateTop==="string") {
        stateTop = top.replace("px","");
      }
      let tooltipLeft = box.x+box.width+12;
      let tooltipTop = box.y + (box.height/2);
      let triangle = "left";

      setDragging(false);
      setTooltipVisible(true);
      setTooltipTop(tooltipTop);
      setTooltipLeft(tooltipLeft);
      setTooltipRight("auto");
      setTooltipContent(label);
      setTooltipTriangle(triangle);

      let tooltipHTML = tooltipRef.current;
      let tooltipWidth = tooltipHTML.offsetWidth;
      let tooltipRight = 0;
      let windowWidth = window.innerWidth;

      if(tooltipLeft+tooltipWidth>windowWidth) {
        tooltipLeft = "auto";
        tooltipRight = windowWidth - box.x +12 ;
        triangle = "right";
      }

      setTooltipLeft(tooltipLeft);
      setTooltipRight(tooltipRight);
      setTooltipTriangle(triangle);
    }

    const loadPeople = () => {
      let item = props.item;
      let people = item.resources.filter(r=>{
        if (r.ref.resourceType==="image" && r.term.label==="hasPart") {
          return true;
        }
        return false
      }).map((r,i)=>{
        let resource = r.ref;

        let meta = resource.metadata.image.default;
        let personStyle = {
          width: parseFloat(meta.width,10),
          height: parseFloat(meta.height,10),
          top: meta.y,
          left: meta.x,
        }
        if (parseFloat(meta.rotate,10)!==0) {
          personStyle.transform = "rotate("+meta.rotate+"deg)";
        }
        let link = "/person/"+resource.person._id;
        let person = <Link
          id={"tooltip-toggle-"+resource._id}
          key={i}
          to={link}
          href={link}
          className="classpiece-person"
          style={personStyle}
          alt={resource.label}
          onMouseOver={(e)=>showTooltip(e, resource.label)}
          onMouseLeave={()=>hideTooltip()}
          >
            <span>{resource.label}</span>
          </Link>;
        return person;

      });
      let peopleLayer = <div
        className="classpiece-people"
        onMouseDown={(e)=>imgDragStart(e)}
        onMouseUp={(e)=>imgDragEnd(e)}
        onDragEnd={(e)=>imgDragEnd(e)}
        draggable={false}
        >{people}</div>;
      return peopleLayer;
    }
    let peopleLayer = loadPeople();
    let imgStyle = {
      width: width,
      height: height,
      transform: "translateX("+left+") translateY("+top+") scaleX("+scale+") scaleY("+scale+")"
    }
    img = <div
      style={imgStyle}
      className="classpiece-full-size"
      ref={imgRef}
      >
      {peopleLayer}
      <img
        src={imgPath}
        onLoad={()=>imgLoaded()}
        alt={props.label}
        onMouseDown={(e)=>imgDragStart(e)}
        onMouseUp={(e)=>imgDragEnd(e)}
        onDragEnd={(e)=>imgDragEnd(e)}
        onDoubleClick={(e)=>updateZoom("plus")}
        draggable={false}
        />
    </div>
  }

  let zoomPanel = <div className="zoom-container">
    <div
      className="zoom-action"
      onClick={()=>updateZoom("plus")}>
      <i className="fa fa-plus" />
    </div>
    <div
      className="zoom-action"
      onClick={()=>updateZoom("minus")}>
      <i className="fa fa-minus" />
    </div>
  </div>

  let panPanel = <div className="pan-container">
    <div className="pan-action up" onClick={()=>updatePan("up")}>
      <i className="fa fa-chevron-up" />
    </div>

    <div className="pan-action right" onClick={()=>updatePan("right")}>
      <i className="fa fa-chevron-right" />
    </div>

    <div className="pan-action down" onClick={()=>updatePan("down")}>
      <i className="fa fa-chevron-down" />
    </div>

    <div className="pan-action left" onClick={()=>updatePan("left")}>
      <i className="fa fa-chevron-left" />
    </div>
  </div>

  // tooltip
  let tooltipStyle = {
    top: tooltipTop,
    left: tooltipLeft,
    right: tooltipRight,
  }
  let tooltipVisibleClass = "";
  if (tooltipVisible) {
    tooltipVisibleClass = " active";
  }
  let tooltipHTML = <div className={"classpiece-tooltip"+tooltipVisibleClass} style={tooltipStyle} onMouseOver={()=>hideTooltip()} ref={tooltipRef}>
      {tooltipContent}
      <div className={"classpiece-triangle-"+tooltipTriangle}></div>
  </div>
  return(
    <div style={visibilityStyle} className="classpiece-viewer">
      <div className="classpiece-viewer-bg" onClick={()=>props.toggle()}></div>
      <div className="classpiece-viewer-header">
        <h4>{props.label}</h4>
        <div className="classpiece-viewer-close">
          <i className="pe-7s-close" onClick={()=>props.toggle()} />
        </div>
      </div>
      {img}
      {zoomPanel}
      {panPanel}
      {tooltipHTML}
    </div>
  );

}

export default Viewer;
