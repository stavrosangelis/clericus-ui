import React, { Component } from 'react';

import {connect} from "react-redux";
import {
  loadGenericStats,
} from "../../redux/actions";

const mapStateToProps = state => {
  return {
    genericStatsLoading: state.genericStatsLoading,
    genericStats: state.genericStats,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    loadGenericStats: () => dispatch(loadGenericStats()),
  }
}


class SectionNumbers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      peopleCount: 0,
      resourcesCount: 0,
      diocesesCount: 0,
      intervals: []
    }

    this.count = this.count.bind(this);
    this.increment = this.increment.bind(this);
    this.incrementItem = this.incrementItem.bind(this);
  }

  count() {
    let stats = this.props.genericStats;
    this.increment('peopleCount', stats.people);
    this.increment('resourcesCount', stats.resources);
    this.increment('diocesesCount', stats.dioceses);
  }

  increment(stateName, statsValue) {
    let i = this.state[stateName];
    let incrementTime = 750/statsValue;
  	let interval = setInterval(()=>this.incrementItem(stateName, statsValue), incrementTime);
    let intervals = this.state.intervals;
    intervals.push(interval)
    let index = intervals.indexOf(interval);
    let intervalStateName = stateName+"IntervalIndex";
    this.setState({
      intervals: intervals,
      [intervalStateName]: index
    })
    if (i===statsValue) {
      clearInterval(interval);
    }
  }

  incrementItem(stateName, statsValue) {
    let number = this.state[stateName];
    if (number<statsValue) {
      number++;
    }
    this.setState({
      [stateName]: number
    })
  }

  componentDidMount() {
    this.props.loadGenericStats();
    if (this.props.genericStats!==null) {
      this.count();
    }    
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.genericStats===null && this.props.genericStats!==null) {
      this.count();
    }
    if (this.props.genericStats!==null) {
      if (this.state.peopleCount===this.props.genericStats.people) {
        let index = this.state["peopleCountIntervalIndex"];
        let interval = this.state.intervals[index];
        clearInterval(interval);
      }
      if (this.state.resourcesCount===this.props.genericStats.resources) {
        let index = this.state["resourcesCountIntervalIndex"];
        let interval = this.state.intervals[index];
        clearInterval(interval);
      }
      if (this.state.diocesesCount===this.props.genericStats.dioceses) {
        let index = this.state["diocesesCountIntervalIndex"];
        let interval = this.state.intervals[index];
        clearInterval(interval);
      }
    }
  }

  render() {
    return(
      <section className="section-numbers">
        <div className="section-numbers-bg"></div>
        <div className="section-numbers-bg-gradient"></div>
        <div className="container section-numbers-content">
          <div className="row numbers-row">
            <div className="col-4">
              <label>{this.state.peopleCount}</label>
              <span>Total people</span>
            </div>
            <div className="col-4">
              <label>{this.state.resourcesCount}</label>
              <span>Total resources</span>
            </div>
            <div className="col-4">
              <label>{this.state.diocesesCount}</label>
              <span>Total dioceses</span>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default SectionNumbers = connect(mapStateToProps, mapDispatchToProps)(SectionNumbers);
