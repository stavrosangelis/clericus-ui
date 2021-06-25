import React, { useEffect, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import { Spinner } from 'reactstrap';
import PropTypes from 'prop-types';
import { updateDocumentTitle, renderLoader } from '../../helpers';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));

const ClasspieceNetwork = lazy(() =>
  import('../../components/visualisations/person-network-pixi')
);
const APIPath = process.env.REACT_APP_APIPATH;

const ClasspieceGraph = (props) => {
  // state
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);

  // props
  const { match } = props;

  useEffect(() => {
    const load = async () => {
      const { _id } = match.params;
      if (typeof _id === 'undefined' || _id === null || _id === '') {
        return false;
      }
      setLoading(false);
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}classpiece`,
        crossDomain: true,
        params: { _id },
      })
        .then((response) => response.data.data)
        .catch((error) => console.log(error));
      setItem(responseData);
      return false;
    };
    if (loading) {
      load();
    }
  }, [loading, match]);

  const breadcrumbsItems = [
    {
      label: 'Classpieces',
      icon: 'pe-7s-photo',
      active: false,
      path: '/classpieces',
    },
  ];
  let content = (
    <div className="graph-container" id="graph-container">
      <div className="graph-loading">
        <i>Loading data...</i> <Spinner color="info" />
      </div>
    </div>
  );

  let heading = '';
  if (!loading && item !== null) {
    const { label } = item;
    heading = `${label} network`;
    breadcrumbsItems.push(
      {
        label,
        icon: 'pe-7s-photo',
        active: false,
        path: `/classpiece/${props.match.params._id}`,
      },
      { label: 'Network', icon: 'pe-7s-graph1', active: true, path: '' }
    );

    const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
    updateDocumentTitle(documentTitle);
    content = (
      <div className="graph-container" id="graph-container">
        <Suspense fallback={renderLoader()}>
          <ClasspieceNetwork
            _id={props.match.params._id}
            relatedLinks={[]}
            relatedNodes={[]}
          />
        </Suspense>
      </div>
    );
  }
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
ClasspieceGraph.defaultProps = {
  match: null,
};
ClasspieceGraph.propTypes = {
  match: PropTypes.object,
};

export default ClasspieceGraph;
