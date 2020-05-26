import React from 'react';
import {Link} from 'react-router-dom';
import {Card,CardBody} from 'reactstrap';
const heatmap = require("../../assets/images/heatmap.png");
const networkGraph = require("../../assets/images/network-graph.png");
const Visualisations = props => {
  return(
    <div>
      <h3 className="section-title"><span><span>V</span>isualisations</span></h3>
      <div className="row">
        <div className="col-12 col-sm-4">
          <Card>
            <CardBody>
              <h4>Geographic distribution</h4>
              <Link className="btn btn-default  home-visualisation-thumb" href="/heatmap" to="/heatmap">
                <img className="visualisations-image" src={heatmap} alt="heatmap" />
              </Link>
              <div className="text-center">
                <Link className="btn btn-default" href="/heatmap" to="/heatmap">More</Link>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-12 col-sm-4">
          <Card>
            <CardBody>
              <h4>Temporal distribution</h4>
            </CardBody>
          </Card>
        </div>
        <div className="col-12 col-sm-4">
          <Card>
            <CardBody>
              <h4>Graph network</h4>
              <Link className="btn btn-default home-visualisation-thumb" href="/network-graph" to="/network-graph">
                <img className="visualisations-image" src={networkGraph} alt="Network graph" />
              </Link>
              <div className="text-center">
                <Link className="btn btn-default" href="/network-graph" to="/network-graph">More</Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Visualisations;
