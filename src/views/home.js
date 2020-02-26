import React, { Component } from 'react';

import HomeSlider from '../components/home/carousel';
import SectionNumbers from '../components/home/section-numbers';
import About from '../components/home/about';
import HighLight from '../components/home/highlight';
import ScrollEvent from 'react-onscroll';

class Home extends Component {
  constructor(props) {
    super(props);
    
    //temp
    this.imgURL = "https://haveheart.qodeinteractive.com/wp-content/uploads/2019/11/landing-img-24.png";
    
    this.timer = null;
    this.startTimer = this.startTimer.bind(this);
    this.handleScrollCallback = this.handleScrollCallback.bind(this);
    
    this.refBlockSection = React.createRef();
    this.refSectionNumbers = React.createRef();
  }
  
  startTimer() {
    let count = 0;
    let shift = 0;
    this.timer = setInterval(function(){
      if(count === 400) {
        count = 0;
      }
      count++;
      
      if(count>=200) {
        shift = count/10;
      }else {
        shift = 20-(count/10-20);
      }
      
      let transform = "matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,0,"+shift+",0,1)";
      document.getElementById("imgHere").style.transform = transform;
    }, 15);
  }
  
  componentDidMount() {
    this.startTimer();
  }
  
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  
  handleScrollCallback() {
    if((window.pageYOffset+document.documentElement.clientHeight/2)>this.refBlockSection.current.offsetTop) {
      if(!document.getElementById("BlockSection").classList.contains("fade-in")){
        document.getElementById("BlockSection").style.opacity="";
        document.getElementById("BlockSection").classList.add("fade-in");
      }
    }
    if((window.pageYOffset+document.documentElement.clientHeight/2)>this.refSectionNumbers.current.offsetTop) {
      if(!document.getElementById("SectionNumbers").classList.contains("fade-in")){
        document.getElementById("SectionNumbers").style.opacity="";
        document.getElementById("SectionNumbers").classList.add("fade-in");
      }
    }
    console.log(document.documentElement.scrollHeight)
    console.log(window.pageYOffset)
    console.log(document.documentElement.clientHeight)
    if((document.documentElement.scrollHeight-window.pageYOffset)<=document.documentElement.clientHeight) {
      if(!document.getElementById("BlockSection").classList.contains("fade-in")){
        document.getElementById("BlockSection").style.opacity="";
        document.getElementById("BlockSection").classList.add("fade-in");
      }
      if(!document.getElementById("SectionNumbers").classList.contains("fade-in")){
        document.getElementById("SectionNumbers").style.opacity="";
        document.getElementById("SectionNumbers").classList.add("fade-in");
      }
    }
  }
  
  render() {
    let style_Section = {
      height: "700px",
      overflow: "hidden",
      backgroundColor: "#bfbfbf",
      opacity: "0.9",
      margin: "1%",
    }
    
    return (
      <div className="container-fluid">
        <ScrollEvent handleScrollCallback={this.handleScrollCallback} />
        <HomeSlider />
        
        <About />
        
        <HighLight />
        
        <div id="BlockSection" ref={this.refBlockSection} style={{opacity:"0%"}}>
          <div className="row">
            <div className="col-xs-12 col-sm-6">
              <div style={style_Section}></div>
            </div>
            <div className="col-xs-12 col-sm-6">
              <div style={style_Section}>
                <img id="imgHere" src={this.imgURL} alt="" width="178" height="155" style={{marginTop:"10%", marginLeft:"20%"}}></img>
              </div>
            </div>
          </div>
        </div>
        
        <div id="SectionNumbers" ref={this.refSectionNumbers} style={{opacity:"0%"}}>
          <SectionNumbers />
        </div>
      </div>
    )

  }
}

export default Home;
