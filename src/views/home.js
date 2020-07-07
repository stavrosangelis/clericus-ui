import React, { Component } from 'react';

import HomeSlider from '../components/home/carousel';
import SectionNumbers from '../components/home/section-numbers';
import About from '../components/home/about';
import HighLights from '../components/home/highlights';
import News from '../components/home/news';
import Welcome from '../components/home/welcome';
import Visualisations from '../components/home/visualisations';
import {updateDocumentTitle} from '../helpers';

class Home extends Component {

  render() {
    updateDocumentTitle();
    return (
      <div className="container-fluid">
        <HomeSlider />

        <SectionNumbers />
        <section className="white-section">
          <div className="container">
            <div className="row">
              <div className="col-xs-12">
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
              <div className="col-12 col-md-7">
                <News />
              </div>
              <div className="col-12 col-md-5">
                <Welcome />
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="container">
            <div className="row">
              <div className="col-12">
                <Visualisations />
              </div>
            </div>
          </div>
        </section>
      </div>
    )

  }
}

export default Home;
