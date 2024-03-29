import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from 'reactstrap';
import heatmap from '../../assets/images/heatmap.jpg';
import networkGraph from '../../assets/images/network-graph.jpg';
import eventsTimeline from '../../assets/images/events-timeline.jpg';

function Visualisations() {
  return (
    <div>
      <h3 className="section-title">
        <span>
          <span>V</span>isualisations
        </span>
      </h3>
      <div className="row">
        <div className="col-12 col-sm-6 col-md-4">
          <Card className="home-visualisation-block">
            <CardBody>
              <h4>Spatial distribution</h4>
              <Link
                className="btn btn-default home-visualisation-thumb"
                href="/heatmap"
                to="/heatmap"
              >
                <img
                  className="visualisations-image"
                  src={heatmap}
                  alt="heatmap"
                />
              </Link>
            </CardBody>
          </Card>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <Card className="home-visualisation-block">
            <CardBody>
              <h4>Events Timeline</h4>
              <Link
                className="btn btn-default home-visualisation-thumb"
                href="/timeline"
                to="/timeline"
              >
                <img
                  className="visualisations-image"
                  src={eventsTimeline}
                  alt="Events timeline"
                />
              </Link>
            </CardBody>
          </Card>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <Card className="home-visualisation-block">
            <CardBody>
              <h4>Graph network</h4>
              <Link
                className="btn btn-default home-visualisation-thumb"
                href="/network-graph"
                to="/network-graph"
              >
                <img
                  className="visualisations-image"
                  src={networkGraph}
                  alt="Network graph"
                />
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Visualisations;
