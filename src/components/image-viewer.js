import React, { useState, useEffect, useRef } from 'react';
import { Link} from 'react-router-dom';
import {
  Spinner,
  FormGroup, Input
} from 'reactstrap';
import LazyList from '../components/lazylist';

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

  const [peopleData, setPeopleData] = useState([]);
  const [searchData, setSearchData] = useState([]);

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipTop, setTooltipTop] = useState(0);
  const [tooltipLeft, setTooltipLeft] = useState(0);
  const [tooltipRight, setTooltipRight] = useState("");
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipTriangle, setTooltipTriangle] = useState("");

  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  }

  const imgLoaded = () => {
    let peopleProps = props.item.resources.filter(r=>{
      if (r.ref.resourceType==="image" && r.term.label==="hasPart") {
        return true;
      }
      return false
    });
    setPeopleData(peopleProps);
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

  const peopleToSearchData = (data) => {
    let newData = [];
    for (let i=0;i<data.length; i++) {
      let n = data[i];
      let _id = null;
      let name = "";
      let altName = "";
      if (typeof n.ref!=="undefined") {
        _id = n.ref._id;
        name = n.ref.label.replace(/\s\s/g,' ')
      }
      if (typeof n.ref.person!=="undefined" && n.ref.person.label!=="") {
        let personLabel = n.ref.person.label.replace(/\s\s/g,' ');
        if (personLabel!==name) {
          altName = personLabel;
        }
      }
      let newitem = {
        i: i,
        _id: _id,
        name: name,
        altName: altName
      }
      newData.push(newitem)
    }
    return newData;
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

  useEffect(()=>{
    if (!loading && peopleData.length>0) {
      let newData = peopleToSearchData(peopleData);
      setSearchData(newData);
    }
  },[peopleData, loading])

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

  const renderSearchItemHTML = (n) => {
    if (n._id===null) {
      return false;
    }
    let label = [];
    if (n.name!=="") {
      label.push(<span key="name">{n.name}</span>)
    }
    if (n.altName!=="") {
      label.push(<br key="break"/>)
      label.push(<small key="alname">[{n.altName}]</small>)
    }
    return <div key={n._id} data-id={n._id} onClick={()=>centerNode(n._id)}>{label}</div>
  }

  if (imgPath!==null) {
    const showTooltip = (e, resource) => {
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
      let affiliationText = "";
      if (typeof resource.person.affiliations!=="undefined" && resource.person.affiliations.length>0) {
        let affiliations = resource.person.affiliations.filter(i=>{
          if (i.ref.organisationType==="Diocese" || i.ref.organisationType==="ReligiousOrder") {
            return true;
          }
          return false;
        });
        if (typeof affiliations!=="undefined") {
          affiliationText = affiliations.map(a=>a.ref.label).join(" | ");
        }
      }
      let affiliationOutput = [];
      if (affiliationText!=="") {
        affiliationOutput = <div>{affiliationText}</div>;
      }
      let altName = [];
      let resourceLabel = resource.label.replace(/\s\s/g,' ');
      if (typeof resource.person!=="undefined" && resource.person.label!=="") {
        let personLabel = resource.person.label.replace(/\s\s/g,' ');
        if (personLabel!==resourceLabel) {
          altName = <div><i>[{resource.person.label}]</i></div>;
        }
      }
      let label = <div className="text-center">
        <div>{resource.label}</div>
        {altName}
        {affiliationOutput}
      </div>
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
    let people = [];
    for (let i=0;i<peopleData.length; i++) {
      let r = peopleData[i];
      let resource = r.ref;
      if (typeof resource.person==="undefined") {
        continue;
      }
      let selected = "";
      if(typeof r.selected!=="undefined" && r.selected) {
        selected = " selected";
      }
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
        className={"classpiece-person"+selected}
        style={personStyle}
        alt={resource.label}
        onMouseOver={(e)=>showTooltip(e, resource)}
        onMouseLeave={()=>hideTooltip()}
        >
          <span>{resource.label}</span>
        </Link>;
      people.push(person);
    }

    let peopleLayer = <div
      className="classpiece-people"
      onMouseDown={(e)=>imgDragStart(e)}
      onMouseUp={(e)=>imgDragEnd(e)}
      onDragEnd={(e)=>imgDragEnd(e)}
      onTouchStart={(e)=>imgDragStart(e)}
      onTouchEnd={(e)=>imgDragEnd(e)}
      draggable={false}
      >{people}</div>;

    let imgStyle = {
      width: width,
      height: height,
      transform: "translateX("+left+") translateY("+top+") scaleX("+scale+") scaleY("+scale+")"
    }
    img = <div
      style={imgStyle}
      className="classpiece-full-size"
      ref={imgRef}
      onDoubleClick={(e)=>updateZoom("plus")}
      onContextMenu={(e)=>{e.preventDefault();return false;}}
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

  const searchNode = (e) =>{
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInput(value);
    let visibleNodes = peopleData.filter(n=>{
      if (n.ref.label.toLowerCase().includes(value.toLowerCase()) || n.ref.person.label.toLowerCase().includes(value.toLowerCase())) {
        return true;
      }
      return false;
    });
    let newData = peopleToSearchData(visibleNodes);
    setSearchData(newData);
  }

  const clearSearchNode = () => {
    setSearchInput("");
    let newData = peopleToSearchData(peopleData);
    setSearchData(newData);
  }

  const centerNode = (_id) => {
    let nodes = peopleData;
    let node = nodes.find(n=>n.ref._id===_id);
    if (typeof node!=="undefined") {
      let meta = node.ref.metadata.image.default;
      let x=meta.x;
      let index = nodes.indexOf(node);
      for (let i=0;i<nodes.length;i++) {
        let n = nodes[i];
        if (i===index) n.selected=true;
        else n.selected=false;
      }
      setPeopleData(nodes);
      setX(x);
    }
    setLoading(true)
    setLoading(false)
  }

  const searchIcon = <div className="img-viewer-search-toggle" onClick={()=>toggleSearchContainerVisible()}>
    <i className="fa fa-search" />
  </div>
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
  let searchContainerVisibleClass = "";
  if (searchContainerVisible) {
    searchContainerVisibleClass = " visible";
  }

  let searchList = [];
  if (!loading && searchData.length>0) {
    searchList = <LazyList
      limit={30}
      range={15}
      items={searchData}
      containerClass="graph-search-container-nodes"
      renderItem={renderSearchItemHTML}
      />
  }
  let searchContainer = <div className={"img-viewer-search-container graph-search-container"+searchContainerVisibleClass}>
    <div className="close-graph-search-container" onClick={()=>toggleSearchContainerVisible()}>
      <i className="fa fa-times" />
    </div>
    <FormGroup className="graph-search-input">
      <Input type="text" name="text" placeholder="Search node..." value={searchInput} onChange={(e)=>searchNode(e)}/>
      <i className="fa fa-times-circle" onClick={()=>clearSearchNode()}/>
    </FormGroup>
    {searchList}
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
      {searchIcon}
      {tooltipHTML}
      {searchContainer}
    </div>
  );

}

export default Viewer;
