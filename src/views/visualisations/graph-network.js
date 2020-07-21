import React, {lazy, Suspense} from 'react';
import {Breadcrumbs} from '../../components/breadcrumbs';
import {updateDocumentTitle,renderLoader} from '../../helpers';
const GraphNetwork = lazy(() => import('../../components/visualisations/graph-network-pixi'));

const NetworkGraph = props => {
  let heading = "Network graph";
  let breadcrumbsItems = [{label: heading, icon: "pe-7s-graph1", active: true, path: ""}];
  updateDocumentTitle(heading);
  let content = <div className="graph-container" id="graph-container">
      <Suspense fallback={renderLoader()}>
        <GraphNetwork relatedLinks={[]} relatedNodes={[]} />
      </Suspense>
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
