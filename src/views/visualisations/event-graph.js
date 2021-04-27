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

const EventGraph = (props) => {
  // state
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

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
        url: `${APIPath}ui-event`,
        crossDomain: true,
        params: { _id },
      })
        .then((response) => response.data.data)
        .catch((error) => console.log(error));
      setEvent(responseData);
      return false;
    };
    if (loading) {
      load();
    }
  }, [loading, match]);

  const breadcrumbsItems = [
    { label: 'Events', icon: 'pe-7s-date', active: false, path: '/events' },
  ];
  let content = (
    <div className="graph-container" id="graph-container">
      <div className="graph-loading">
        <i>Loading data...</i> <Spinner color="info" />
      </div>
    </div>
  );

  let heading = '';
  if (!loading && event !== null) {
    const { label } = event;
    heading = `${label} network`;
    breadcrumbsItems.push(
      {
        label,
        icon: 'pe-7s-date',
        active: false,
        path: `/event/${props.match.params._id}`,
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
EventGraph.defaultProps = {
  match: null,
};
EventGraph.propTypes = {
  match: PropTypes.object,
};

export default EventGraph;
