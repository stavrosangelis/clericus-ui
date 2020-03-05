import React, { Component } from 'react';

import HomeSlider from '../components/home/carousel';
import SectionNumbers from '../components/home/section-numbers';
import About from '../components/home/about';
import HighLights from '../components/home/highlights';
import News from '../components/home/news';

class Home extends Component {
  constructor(props) {
    super(props);
    
    this.handleScrollCallback = this.handleScrollCallback.bind(this);
    
    this.refBlockSection = React.createRef();
  }
  
  componentDidMount() {
    window.addEventListener('scroll', this.handleScrollCallback);
  }
  
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScrollCallback);
  }
  
  handleScrollCallback() {
    if((window.pageYOffset+document.documentElement.clientHeight/2)>this.refBlockSection.current.offsetTop) {
      if(!document.getElementById("BlockSection").classList.contains("fade-in")){
        document.getElementById("BlockSection").style.opacity="";
        document.getElementById("BlockSection").classList.add("fade-in");
      }
    }
    if((document.documentElement.scrollHeight-window.pageYOffset)<=document.documentElement.clientHeight) {
      if(!document.getElementById("BlockSection").classList.contains("fade-in")){
        document.getElementById("BlockSection").style.opacity="";
        document.getElementById("BlockSection").classList.add("fade-in");
      }
    }
  }
  
  render() {
    let waveShape_top = 
            <svg width="100%" viewBox="0 175 1440 130" preserveAspectRatio="none">
            <path fill="#00334d" fillOpacity="0.9" d="M0,224L0,245.7C120,245,240,267,360,272C480,277,600,267,720,256C840,245,960,235,1080,234.7C1200,235,1320,245,1380,250.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z">
            </path></svg>
    let waveShape_bottom = 
            <svg width="100%" viewBox="0 200 1440 165" preserveAspectRatio="none">
            <path fill="#00334d" fillOpacity="0.9" d="M0,224L60,234.7C120,245,240,267,360,272C480,277,600,267,720,256C840,245,960,235,1080,234.7C1200,235,1320,245,1380,250.7L1440,256L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z">
            </path></svg>
    let videoUrl = "https://d4804za1f1gw.cloudfront.net/wp-content/uploads/sites/40/2019/11/19200050/116588455-mississippi-river-st-paul-mn_H264HD1080.mp4"; 

    return (
      <div className="container-fluid">
        <HomeSlider />

        <SectionNumbers />
        <section className="white-section">
          <div className="container">
            <About />
          </div>
        </section>
        <section className="non-white-section" id="BlockSection" ref={this.refBlockSection} style={{opacity:"0%", padding: "0 0 0 0"}}>
          <div className="about-video-container">
            {waveShape_top}
            <div className="waveShapeMiddle about-video-container">
              <video id="aboutVideo" loop autoPlay muted={true} height="100%" width="100%">
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
              
              <div className="waveShape_overlay">
                <div className="container">
                  <div className="row">
                    <div className="col-12">
                      <HighLights />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {waveShape_bottom}
          </div>
        </section>
        <section className="white-section">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <News />
              </div>
            </div>
          </div>
        </section>
      </div>
    )

  }
}

export default Home;
