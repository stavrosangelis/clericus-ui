import React, { useEffect, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import { Spinner } from 'reactstrap';
import PropTypes from 'prop-types';
import { updateDocumentTitle, renderLoader } from '../../helpers';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));
const PersonNetwork = lazy(() =>
  import('../../components/visualisations/person-network-pixi')
);
const APIPath = process.env.REACT_APP_APIPATH;

const TemporalGraph = (props) => {
  // state
  const [loading, setLoading] = useState(true);
  const [temporal, setTemporal] = useState(null);

  // props
  const { match } = props;

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const load = async () => {
      const { _id } = match.params;
      if (typeof _id === 'undefined' || _id === null || _id === '') {
        return false;
      }
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}temporal`,
        crossDomain: true,
        params: { _id },
        cancelToken: source.token,
      })
        .then((response) => response.data.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined') {
        setTemporal(responseData);
        setLoading(false);
      }
      return false;
    };
    if (loading) {
      load();
    }
    return () => {
      source.cancel('api request cancelled');
    };
  }, [loading, match]);

  const breadcrumbsItems = [
    {
      label: 'Temporals',
      icon: 'pe-7s-date',
      active: false,
      path: '/temporals',
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
  if (!loading && temporal !== null) {
    const { label } = temporal;
    heading = `${label} network`;
    breadcrumbsItems.push(
      {
        label,
        icon: 'pe-7s-date',
        active: false,
        path: `/temporal/${match.params._id}`,
      },
      { label: 'Network', icon: 'pe-7s-graph1', active: true, path: '' }
    );
    const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
    updateDocumentTitle(documentTitle);
    content = (
      <div className="graph-container" id="graph-container">
        <Suspense fallback={renderLoader()}>
          <PersonNetwork
            _id={match.params._id}
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

TemporalGraph.defaultProps = {
  match: null,
};
TemporalGraph.propTypes = {
  match: PropTypes.object,
};

export default TemporalGraph;
