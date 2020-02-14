import React, { Component } from 'react';

import HomeSlider from '../components/home/carousel';
import SectionNumbers from '../components/home/section-numbers';
import About from '../components/home/about';
import HighLight from '../components/home/highlight';

class Home extends Component {
  render() {
    let style_Section = {
      height: "500px",
      overflow: "hidden",
      backgroundColor: "#005580",
      opacity: "0.9",
      margin: "1%",
    }
    
    return (
      <div className="container-fluid">
        <HomeSlider />
        
        <About />
        
        <HighLight />

        <div className="row">
          <div className="col-xs-12 col-sm-6">
            <div style={style_Section}></div>
          </div>
          <div className="col-xs-12 col-sm-6">
            <div style={style_Section}></div>
          </div>
        </div>
        
        <SectionNumbers />
      </div>
    )

  }
}

export default Home;
