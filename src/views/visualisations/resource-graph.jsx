import React, { useEffect, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import { Spinner } from 'reactstrap';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { updateDocumentTitle, renderLoader } from '../../helpers';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));
const PersonNetwork = lazy(() =>
  import('../../components/visualisations/person-network-pixi')
);
const APIPath = process.env.REACT_APP_APIPATH;

const ResourceGraph = (props) => {
  // state
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);

  // props
  const { match } = props;

  const loadingResourcesType = useSelector(
    (state) => state.loadingResourcesType
  );
  const resourcesType = useSelector((state) => state.resourcesType);

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
        url: `${APIPath}ui-resource`,
        crossDomain: true,
        params: { _id },
        cancelToken: source.token,
      })
        .then((response) => response.data.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined') {
        setResource(responseData);
        setLoading(false);
      }
      return false;
    };
    if (loading && !loadingResourcesType) {
      load();
    }
    return () => {
      source.cancel('api request cancelled');
    };
  }, [loading, match, loadingResourcesType]);

  const getSystemType = () => {
    for (let i = 0; i < resourcesType.length; i += 1) {
      if (resource.systemType === resourcesType[i]._id) {
        return resourcesType[i].label;
      }
    }
    return false;
  };

  const breadcrumbsItems = [
    {
      label: 'Resources',
      icon: 'pe-7s-photo',
      active: false,
      path: '/resources',
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
  if (!loading && resource !== null) {
    const dataType = getSystemType();
    let _idGraph = match.params._id;
    if (dataType === 'Thumbnail') {
      if (resource.status === 'private') {
        _idGraph = resource.people[0].ref._id;
      }
    }
    const { label } = resource;
    heading = `${label} network`;
    breadcrumbsItems.push(
      {
        label,
        icon: 'pe-7s-photo',
        active: false,
        path: `/resource/${match.params._id}`,
      },
      { label: 'Network', icon: 'pe-7s-graph1', active: true, path: '' }
    );
    const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
    updateDocumentTitle(documentTitle);
    content = (
      <div className="graph-container" id="graph-container">
        <Suspense fallback={renderLoader()}>
          <PersonNetwork _id={_idGraph} relatedLinks={[]} relatedNodes={[]} />
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

ResourceGraph.defaultProps = {
  match: null,
};
ResourceGraph.propTypes = {
  match: PropTypes.object,
};
export default ResourceGraph;
