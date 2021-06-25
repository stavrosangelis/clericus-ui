import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { Label } from 'reactstrap';

const mapStateToProps = (state) => ({
  genericStatsLoading: state.genericStatsLoading,
  genericStats: state.genericStats,
});

class SectionNumbers extends Component {
  static animateValue(ref, start, end, duration) {
    const obj = ref.current;
    const range = end - start;
    const minTimer = 50;
    let stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, minTimer);
    const startTime = new Date().getTime();
    const endTime = startTime + duration;
    let timer;

    const run = () => {
      const now = new Date().getTime();
      const remaining = Math.max((endTime - now) / duration, 0);
      const remainingRange = remaining * range;
      const value = Math.round(end - remainingRange);
      obj.innerHTML = value;
      if (value === end) {
        clearInterval(timer);
      }
    };

    timer = setInterval(run, stepTime);
    run();
  }

  constructor(props) {
    super(props);
    this.state = {
      peopleCount: 0,
      resourcesCount: 0,
      diocesesCount: 0,
      uniqueLastNamesCount: 0,
    };

    this.count = this.count.bind(this);
    this.peopleCountRef = React.createRef();
    this.resourcesCountRef = React.createRef();
    this.diocesesCountRef = React.createRef();
    this.uniqueLastNamesCountRef = React.createRef();
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    const { genericStats } = this.props;
    if (genericStats !== null) {
      this.count();
    }
  }

  componentDidUpdate(prevProps) {
    const { genericStats } = this.props;
    if (prevProps.genericStats !== genericStats) {
      this.count();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  count() {
    const { genericStats: stats } = this.props;
    this.constructor.animateValue(this.peopleCountRef, 0, stats.people, 1500);
    this.constructor.animateValue(
      this.resourcesCountRef,
      0,
      stats.resources,
      1500
    );
    this.constructor.animateValue(
      this.diocesesCountRef,
      0,
      stats.dioceses,
      1500
    );
    this.constructor.animateValue(
      this.uniqueLastNamesCountRef,
      0,
      stats.lastNames,
      1500
    );
  }

  render() {
    const {
      peopleCount,
      resourcesCount,
      diocesesCount,
      uniqueLastNamesCount,
    } = this.state;
    return (
      <section className="section-numbers">
        <div className="section-numbers-bg" />
        <div className="section-numbers-bg-gradient" />
        <div className="container section-numbers-content">
          <div className="row numbers-row">
            <div className="col-xs-12 col-sm-6 col-md-3 home-count">
              <i className="pe-7s-users" />
              <Label ref={this.peopleCountRef}>{peopleCount}</Label>
              <span>Total people</span>
            </div>
            <div className="col-xs-12 col-sm-6 col-md-3 home-count">
              <i className="pe-7s-photo" />
              <Label ref={this.resourcesCountRef}>{resourcesCount}</Label>
              <span>Total resources</span>
            </div>
            <div className="col-xs-12 col-sm-6 col-md-3 home-count">
              <i className="pe-7s-map-2" />
              <Label ref={this.diocesesCountRef}>{diocesesCount}</Label>
              <span>Total dioceses</span>
            </div>
            <div className="col-xs-12 col-sm-6 col-md-3 home-count">
              <i className="pe-7s-id" />
              <Label ref={this.uniqueLastNamesCountRef}>
                {uniqueLastNamesCount}
              </Label>
              <span>Total unique last names</span>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
SectionNumbers.defaultProps = {
  genericStats: null,
};
SectionNumbers.propTypes = {
  genericStats: PropTypes.object,
};
export default compose(connect(mapStateToProps, {}))(SectionNumbers);
