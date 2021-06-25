import React, { lazy, Suspense } from 'react';
import { updateDocumentTitle, renderLoader } from '../../helpers';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));
const GraphNetwork = lazy(() =>
  import('../../components/visualisations/graph-network-pixi')
);

const NetworkGraph = () => {
  const heading = 'Network graph';
  const breadcrumbsItems = [
    { label: heading, icon: 'pe-7s-graph1', active: true, path: '' },
  ];
  updateDocumentTitle(heading);
  const content = (
    <div className="graph-container" id="graph-container">
      <Suspense fallback={renderLoader()}>
        <GraphNetwork relatedLinks={[]} relatedNodes={[]} />
      </Suspense>
    </div>
  );
  return (
    <div className="container">
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <h3>{heading}</h3>
      {content}
    </div>
  );
};

export default NetworkGraph;
