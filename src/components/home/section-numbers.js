import React, { Component } from 'react';

import {connect} from "react-redux";

const mapStateToProps = state => {
  return {
    genericStatsLoading: state.genericStatsLoading,
    genericStats: state.genericStats,
   };
};

class SectionNumbers extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      peopleCount: 0,
      resourcesCount: 0,
      diocesesCount: 0,
      uniqueLastNamesCount: 0,
      intervals: []
    }

    this.count = this.count.bind(this);
    this.animateValue = this.animateValue.bind(this);
    this.peopleCountRef = React.createRef();
    this.resourcesCountRef = React.createRef();
    this.diocesesCountRef = React.createRef();
    this.uniqueLastNamesCountRef = React.createRef();
  }

  count() {
    let stats = this.props.genericStats;
    this.animateValue(this.peopleCountRef, 0, stats.people, 2000);
    this.animateValue(this.resourcesCountRef, 0, stats.resources, 2000);
    this.animateValue(this.diocesesCountRef, 0, stats.dioceses, 2000);
    this.animateValue(this.uniqueLastNamesCountRef, 0, stats.lastNames, 2000);
  }

  animateValue(ref, start, end, duration) {
    var obj = ref.current;
    var range = end - start;
    var minTimer = 50;
    var stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, minTimer);
    var startTime = new Date().getTime();
    var endTime = startTime + duration;
    var timer;

    const run = () => {
      var now = new Date().getTime();
      var remaining = Math.max((endTime - now) / duration, 0);
      var value = Math.round(end - (remaining * range));
      obj.innerHTML = value;
      if (value === end) {
          clearInterval(timer);
      }
    }

    timer = setInterval(run, stepTime);
    run();
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.props.genericStats!==null) {
      this.count();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.genericStats!==this.props.genericStats) {
      this.count();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return(
      <section className="section-numbers">
        <div className="section-numbers-bg"></div>
        <div className="section-numbers-bg-gradient"></div>
        <div className="container section-numbers-content">
          <div className="row numbers-row">
            <div className="col-xs-12 col-sm-6 col-md-3 home-count">
              <i className="pe-7s-users" />
              <label ref={this.peopleCountRef}>{this.state.peopleCount}</label>
              <span>Total people</span>
            </div>
            <div className="col-xs-12 col-sm-6 col-md-3 home-count">
              <i className="pe-7s-photo" />
              <label ref={this.resourcesCountRef}>{this.state.resourcesCount}</label>
              <span>Total resources</span>
            </div>
            <div className="col-xs-12 col-sm-6 col-md-3 home-count">
              <i className="pe-7s-map-2" />
              <label ref={this.diocesesCountRef}>{this.state.diocesesCount}</label>
              <span>Total dioceses</span>
            </div>
            <div className="col-xs-12 col-sm-6 col-md-3 home-count">
              <i className="pe-7s-id" />
              <label ref={this.uniqueLastNamesCountRef}>{this.state.uniqueLastNamesCount}</label>
              <span>Total unique last names</span>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default SectionNumbers = connect(mapStateToProps, {})(SectionNumbers);
