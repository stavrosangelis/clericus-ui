import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Spinner
} from 'reactstrap';
import {getResourceFullsizelURL} from '../helpers';

export default class Viewer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      windowWidth: 0,
      windowHeight: 0,
      imgWidth: 0,
      imgHeight: 0,
      imgLoading: true,
      scale: 1,
      top: 0,
      left: 0,
      dragging: false,
      x: 0,
      y: 0,
      tooltipVisible: false,
      tooltipTop: 0,
      tooltipLeft: 0,
      tooltipRight: 0,
      tooltipContent: [],
      tooltipTriangle: 'left',
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.imgLoaded = this.imgLoaded.bind(this);
    this.imgDimensions = this.imgDimensions.bind(this);
    this.imgDragStart = this.imgDragStart.bind(this);
    this.imgDrag = this.imgDrag.bind(this);
    this.imgDragEnd = this.imgDragEnd.bind(this);
    this.updateZoom = this.updateZoom.bind(this);
    this.updatePan = this.updatePan.bind(this);
    this.loadPeople = this.loadPeople.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);

    this.imgRef = React.createRef();
    this.tooltipRef = React.createRef();
  }

  updateWindowDimensions() {
    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });
  }

  imgLoaded() {
    this.setState({
      imgLoading: false,
    });
  }

  imgDimensions() {
    const img = this.imgRef.current;
    if (img !== null) {
      const windowWidth = this.state.windowWidth;
      const windowHeight = this.state.windowHeight;
      const width = this.imgRef.current.width;
      const height = this.imgRef.current.height;
      let scale = 1;
      let newHeight = height;
      if (width > windowWidth) {
        scale = windowWidth / width;
        newHeight = height * scale;
      }
      if (newHeight > windowHeight) {
        scale = windowHeight / height;
      }
      // center image
      let left; let top = `${0}px`;
      // center left
      const newWidth = width*scale;
      if (newWidth < windowWidth) {
        left = `${(windowWidth-newWidth)/2}px`;
      }

      this.setState({
        scale,
        left,
        top,
        imgWidth: width,
        imgHeight: height,
      });
    }
  }

  imgDragStart(e) {
    this.setState({
      dragging: true,
      x: e.pageX,
      y: e.pageY,
    });
  }

  imgDrag(e) {
    e.stopPropagation();
    if (!this.state.dragging) {
      return false;
    }
    const img = this.imgRef.current;
    const newX = e.pageX-this.state.x;
    const newY = e.pageY-this.state.y;

    const newStyle = img.style;
    const transformOrigin = newStyle.transformOrigin.split(" ");
    let transformOriginX = transformOrigin[0];
    let transformOriginY = transformOrigin[1];
    transformOriginX = transformOriginX.replace('px', '');
    transformOriginX = parseFloat(transformOriginX, 10);
    transformOriginY = transformOriginY.replace('px', '');
    transformOriginY = parseFloat(transformOriginY, 10);

    const newTransformOriginX = transformOriginX+newX;
    const newTransformOriginY = transformOriginY+newY;

    if (
      e.pageX > this.state.windowWidth ||
      e.pageY > this.state.windowHeight ||
      e.pageX < 0 ||
      e.pageY < 0
    ) {
      this.setState({
        dragging: false,
        x: 0,
        y: 0,
      });
    } else {
      this.setState({
        x: e.pageX,
        y: e.pageY,
        left: `${newTransformOriginX}px`,
        top: `${newTransformOriginY}px`,
      });
    }
  }

  imgDragEnd(e) {
    e.stopPropagation();
    this.setState({
      dragging: false,
      x: 0,
      y: 0,
    });
  }

  updateZoom(value) {
    let {scale} = this.state;
    scale = parseFloat(scale, 10).toFixed(1);
    if (value === 'plus') {
      if (scale < 2) {
        scale = parseFloat(scale, 10) + 0.1;
      }
    }
    if (value === 'minus') {
      if (scale > 0.1) {
        scale = parseFloat(scale, 10) - 0.1;
      }
    }

    this.setState({
      scale
    });
  }

  updatePan(direction) {
    const add = 50;
    const update = {};
    if (direction === 'up') {
      let {top} = this.state;
      top = top.replace('px', '');
      const newTop = parseFloat(top,10)-add;
      update.top = `${newTop}px`;
    }

    if (direction === 'right') {
      let {left} = this.state;
      left = left.replace('px', '');
      const newLeft = parseFloat(left,10)+add;
      update.left = `${newLeft}px`;
    }

    if (direction === 'down') {
      let {top} = this.state;
      top = top.replace('px', '');
      const newTop = parseFloat(top,10)+add;
      update.top = `${newTop}px`;
    }

    if (direction === 'left') {
      let {left} = this.state;
      left = left.replace('px', '');
      const newLeft = parseFloat(left,10)-add;
      update.left = `${newLeft}px`;
    }

    this.setState(update);
  }

  loadPeople() {
    const people = [];
    const item = this.props.item;
    for (let i = 0; i < item.resources.length; i += 1) {
      const resource = item.resources[i].ref;
      if (
        resource.resourceType === 'image' &&
        item.resources[i].refLabel === 'isPartOf'
      ) {
        const meta = resource.metadata[0].image.default;
        const personStyle = {
          width: parseFloat(meta.width,10),
          height: parseFloat(meta.height,10),
          top: meta.y,
          left: meta.x,
        }
        if (parseFloat(meta.rotate, 10) !== 0) {
          personStyle.transform = 'rotate(' + meta.rotate + 'deg)';
        }
        const link = "/person/"+resource.people[0].ref;
        const person = <Link
          id={"tooltip-toggle-"+resource._id}
          key={i}
          to={link}
          href={link}
          className="classpiece-person"
          style={personStyle}
          alt={resource.label}
          onMouseOver={(e)=>this.showTooltip(e, resource.label, personStyle)}
          onMouseLeave={()=>this.hideTooltip()}
          >
            <span>{resource.label}</span>
          </Link>;
        people.push(person);
      }
    }
    const peopleLayerStyle = {
      width: parseFloat(this.state.imgWidth,10),
      height: parseFloat(this.state.imgHeight,10),
      transform: "scale("+this.state.scale+") translate("+this.state.left+", "+this.state.top+")",
      transformOrigin: this.state.left+" "+this.state.top+" "};
    const peopleLayer = <div
      className="classpiece-people"
      style={peopleLayerStyle}
      onMouseDown={(e)=>this.imgDragStart(e)}
      onMouseUp={(e)=>this.imgDragEnd(e)}
      onDragEnd={(e)=>this.imgDragEnd(e)}
      draggable={false}
      >{people}</div>;
    return peopleLayer;
  }

  showTooltip(e, label, person) {
    const stateLeft = this.state.left.replace("px","");
    const stateTop = this.state.top.replace("px","");
    const scale = this.state.scale;
    let left =
      (person.left + person.width) * scale + parseFloat(stateLeft, 10) + 15;
    const top = (((person.height/3)+person.top)*scale)+parseFloat(stateTop,10);
    let triangle = 'left';
    this.setState(
      {
        dragging: false,
        tooltipVisible: true,
        tooltipTop: top,
        tooltipLeft: left,
        tooltipRight: 'auto',
        tooltipContent: label,
        tooltipTriangle: triangle,
      },
      () => {
        const tooltip = this.tooltipRef.current;
        let tooltipWidth = tooltip.offsetWidth;
        let right = 0;
        if (left + tooltipWidth > this.state.windowWidth) {
          left = 'auto';
          right =
            parseFloat(this.state.windowWidth, 10) -
            parseFloat(person.left, 10) * scale -
            parseFloat(stateLeft, 10) +
            15;
          triangle = 'right';
        }

        this.setState({
          tooltipLeft: left,
          tooltipRight: right,
          tooltipTriangle: triangle,
        });
      }
    );
  }

  hideTooltip() {
    this.setState({
      tooltipVisible: false,
    });
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('mousemove', this.imgDrag);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.visible === false && this.props.visible) {
      this.updateWindowDimensions();
      if (!this.state.imgLoading) {
        this.imgDimensions();
      }
    }
    if (prevState.imgLoading && !this.state.imgLoading) {
      this.imgDimensions();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    window.removeEventListener('mousemove', this.imgDrag);
  }

  render() {
    let visibilityStyle = { visibility: 'hidden' };
    if (this.props.visible) {
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
    const item = this.props.item;
    const imgURL = getResourceFullsizelURL(item);
    if (imgURL !== null) {
      const imgStyle = {
        transform: "scale("+this.state.scale+") translate("+this.state.left+", "+this.state.top+")",
        transformOrigin: this.state.left+" "+this.state.top+" "
      }
      img = (
        <img
          style={imgStyle}
          className="classpiece-full-size"
          src={imgURL}
          ref={this.imgRef}
          onLoad={() => this.imgLoaded()}
          alt={item.label}
          onMouseDown={(e) => this.imgDragStart(e)}
          onMouseUp={(e) => this.imgDragEnd(e)}
          onDragEnd={(e) => this.imgDragEnd(e)}
          draggable={false}
        />
      );
    }

    const zoomPanel = <div className="zoom-container">
          <div
            className="zoom-action"
            onClick={()=>this.updateZoom("plus")}>
            <i className="fa fa-plus" />
          </div>
          <div
            className="zoom-action"
            onClick={()=>this.updateZoom("minus")}>
            <i className="fa fa-minus" />
          </div>
      </div>

    const panPanel = <div className="pan-container">
      <div className="pan-action up" onClick={()=>this.updatePan("up")}>
        <i className="fa fa-chevron-up" />
      </div>

      <div className="pan-action right" onClick={()=>this.updatePan("right")}>
        <i className="fa fa-chevron-right" />
      </div>

      <div className="pan-action down" onClick={()=>this.updatePan("down")}>
        <i className="fa fa-chevron-down" />
      </div>

      <div className="pan-action left" onClick={()=>this.updatePan("left")}>
        <i className="fa fa-chevron-left" />
      </div>
    </div>
    );

    let people = [];
    if (typeof item.resources !== 'undefined') {
      people = this.loadPeople();
    }

    // tooltip
    const tooltipStyle = {
      top: this.state.tooltipTop,
      left: this.state.tooltipLeft,
      right: this.state.tooltipRight,
    }
    let tooltipVisibleClass = '';
    if (this.state.tooltipVisible) {
      tooltipVisibleClass = ' active';
    }
    const tooltip = <div className={"classpiece-tooltip"+tooltipVisibleClass} style={tooltipStyle} onMouseOver={()=>this.hideTooltip()} ref={this.tooltipRef}>
        {this.state.tooltipContent}
        <div className={"classpiece-triangle-"+this.state.tooltipTriangle}></div>
    </div>
    );
    return (
      <div style={visibilityStyle} className="classpiece-viewer">
        <div
          className="classpiece-viewer-bg"
          onClick={() => this.props.toggle()}
        ></div>
        <div className="classpiece-viewer-header">
          <h4>{item.label}</h4>
          <div className="classpiece-viewer-close">
            <i className="pe-7s-close" onClick={() => this.props.toggle()} />
          </div>
        </div>
        {img}
        {people}
        {zoomPanel}
        {panPanel}
        {tooltip}
      </div>
    );
  }
}
