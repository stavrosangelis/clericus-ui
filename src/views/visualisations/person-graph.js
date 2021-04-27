import React, { useEffect, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import { Spinner } from 'reactstrap';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../components/breadcrumbs';
import { updateDocumentTitle, renderLoader } from '../../helpers';

const PersonNetwork = lazy(() =>
  import('../../components/visualisations/person-network-pixi')
);
const APIPath = process.env.REACT_APP_APIPATH;

const PersonGraph = (props) => {
  // state
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState(null);

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
        url: `${APIPath}ui-person`,
        crossDomain: true,
        params: { _id },
        cancelToken: source.token,
      })
        .then((response) => response.data.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined') {
        setPerson(responseData);
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
    { label: 'People', icon: 'pe-7s-users', active: false, path: '/people' },
  ];
  let content = (
    <div className="graph-container" id="graph-container">
      <div className="graph-loading">
        <i>Loading data...</i> <Spinner color="info" />
      </div>
    </div>
  );

  let heading = '';
  if (!loading && person !== null) {
    let label = person.firstName;
    if (
      typeof person.middleName !== 'undefined' &&
      person.middleName !== null &&
      person.middleName !== ''
    ) {
      label += ` ${person.middleName}`;
    }
    label += ` ${person.lastName}`;
    heading = `${label} network`;
    breadcrumbsItems.push(
      {
        label,
        icon: 'pe-7s-user',
        active: false,
        path: `/person/${props.match.params._id}`,
      },
      { label: 'Network', icon: 'pe-7s-graph1', active: true, path: '' }
    );
    const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
    updateDocumentTitle(documentTitle);
    content = (
      <div className="graph-container" id="graph-container">
        <Suspense fallback={renderLoader()}>
          <PersonNetwork
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
      <Breadcrumbs items={breadcrumbsItems} />
      <h3>{heading}</h3>
      {content}
    </div>
  );
};

PersonGraph.defaultProps = {
  match: null,
};
PersonGraph.propTypes = {
  match: PropTypes.object,
};

export default PersonGraph;
