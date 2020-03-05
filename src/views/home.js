import React, { Component } from 'react';

import HomeSlider from '../components/home/carousel';
import SectionNumbers from '../components/home/section-numbers';
import About from '../components/home/about';
import HighLights from '../components/home/highlights';
import News from '../components/home/news';

class Home extends Component {

  render() {

    return (
      <div className="container-fluid">
        <HomeSlider />

        <SectionNumbers />
        <section className="white-section">
          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-md-7">
                <About />
              </div>
              <div className="col-xs-12 col-md-5">
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="container">
            <div className="row">
              <div className="col-12">
                <HighLights />
              </div>
            </div>
          </div>
        </section>
        <section className="white-section">
          <div className="container">
            <div className="row">
              <div className="col-12 col-md-8">
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
