import React from 'react';
import GraphNetwork from '../../components/visualisations/graph-network-pixi';
import {Breadcrumbs} from '../../components/breadcrumbs';

const NetworkGraph = props => {
  let heading = "Network graph";
  let breadcrumbsItems = [{label: heading, icon: "pe-7s-graph1", active: true, path: ""}];
  let content = <div className="graph-container" id="graph-container">
      <GraphNetwork relatedLinks={[]} relatedNodes={[]} />
    </div>;
  return (
    <div className="container">
      <Breadcrumbs items={breadcrumbsItems} />
      <h3>{heading}</h3>
      {content}
    </div>
  )
}

export default NetworkGraph;
