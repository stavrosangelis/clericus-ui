import React, { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const animateValue = (ref, start, end, duration) => {
  const obj = ref.current;
  if (obj !== null) {
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
};

function SectionNumbers() {
  // state
  /* const [peopleCount, setPeopleCount] = useState(0);
  const [resourcesCount, setResourcesCount] = useState(0);
  const [diocesesCount, setDiocesesCount] = useState(0);
  const [uniqueLastNamesCount, setUniqueLastNamesCount] = useState(0);
  */
  // props
  const genericStats = useSelector((state) => state.genericStats);

  // refs
  const peopleCountRef = useRef(null);
  const resourcesCountRef = useRef(null);
  const diocesesCountRef = useRef(null);
  const uniqueLastNamesCountRef = useRef(null);

  const count = useCallback(() => {
    // const { people, resources, dioceses, lastNames } = genericStats;
    animateValue(peopleCountRef, 0, genericStats.people, 1500);
    animateValue(resourcesCountRef, 0, genericStats.resources, 1500);
    animateValue(diocesesCountRef, 0, genericStats.dioceses, 1500);
    animateValue(uniqueLastNamesCountRef, 0, genericStats.lastNames, 1500);
  }, [genericStats]);

  useEffect(() => {
    if (genericStats !== null) {
      count();
    }
  }, [genericStats, count]);

  return (
    <section className="section-numbers">
      <div className="section-numbers-bg" />
      <div className="section-numbers-bg-gradient" />
      <div className="container section-numbers-content">
        <div className="row numbers-row">
          <div className="col-xs-12 col-sm-6 col-md-3 home-count">
            <i className="pe-7s-users" />
            <div className="home-count-label" ref={peopleCountRef}>
              0
            </div>
            <span>Total people</span>
          </div>
          <div className="col-xs-12 col-sm-6 col-md-3 home-count">
            <i className="pe-7s-photo" />
            <div className="home-count-label" ref={resourcesCountRef}>
              0
            </div>
            <span>Total resources</span>
          </div>
          <div className="col-xs-12 col-sm-6 col-md-3 home-count">
            <i className="pe-7s-map-2" />
            <div className="home-count-label" ref={diocesesCountRef}>
              0
            </div>
            <span>Total dioceses</span>
          </div>
          <div className="col-xs-12 col-sm-6 col-md-3 home-count">
            <i className="pe-7s-id" />
            <div className="home-count-label" ref={uniqueLastNamesCountRef}>
              0
            </div>
            <span>Total unique last names</span>
          </div>
        </div>
      </div>
    </section>
  );
}

SectionNumbers.defaultProps = {
  genericStats: {
    people: 0,
    resources: 0,
    dioceses: 0,
    lastNames: 0,
  },
};
SectionNumbers.propTypes = {
  genericStats: PropTypes.shape({
    people: PropTypes.number,
    resources: PropTypes.number,
    dioceses: PropTypes.number,
    lastNames: PropTypes.number,
  }),
};

export default SectionNumbers;
