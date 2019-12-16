import React, { Component } from 'react';

import HomeSlider from '../components/home/carousel';
import SectionNumbers from '../components/home/section-numbers';

class Home extends Component {
  render() {

    return (
      <div className="container-fluid">
        <HomeSlider />
        <SectionNumbers />
      </div>
    )

  }
}

export default Home;
