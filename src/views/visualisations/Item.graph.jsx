import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import { Spinner } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { personLabel, renderLoader, updateDocumentTitle } from '../../helpers';

const Breadcrumbs = lazy(() => import('../../components/Breadcrumbs'));
const PersonNetwork = lazy(() =>
  import('../../components/visualisations/Item.network.pixi')
);
const { REACT_APP_APIPATH: APIPath } = process.env;

function ItemGraph() {
  // state
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);

  const { _id, type } = useParams();

  const prevId = useRef(null);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      prevId.current = _id;
      let path = 'ui-person';
      switch (type) {
        case 'classpiece':
          path = 'classpiece';
          break;
        case 'event':
          path = 'ui-event';
          break;
        case 'organisation':
          path = 'ui-organisation';
          break;
        case 'person':
          path = 'ui-person';
          break;
        case 'resource':
          path = 'ui-resource';
          break;
        case 'spatial':
          path = 'ui-spatial';
          break;
        case 'temporal':
          path = 'ui-temporal';
          break;
        default:
          break;
      }
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}${path}`,
        crossDomain: true,
        params: { _id },
        signal: controller.signal,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (!unmounted) {
        setLoading(false);
        const { data = null } = responseData;
        if (data !== null) {
          setItem(data);
        }
      }
    };
    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading, _id, type]);

  useEffect(() => {
    if (!loading && prevId.current !== _id) {
      prevId.current = _id;
      setLoading(true);
      setItem(null);
    }
  }, [_id, loading]);

  let categoryLabel;
  let categoryIcon;
  let categoryPath;
  let categoryPath2;
  switch (type) {
    case 'classpiece':
      categoryLabel = 'Classpieces';
      categoryIcon = 'pe-7s-photo';
      categoryPath = '/classpieces';
      categoryPath2 = '/classpiece';
      break;
    case 'event':
      categoryLabel = 'Events';
      categoryIcon = 'pe-7s-date';
      categoryPath = '/events';
      categoryPath2 = '/event';
      break;
    case 'organisation':
      categoryLabel = 'Organisations';
      categoryIcon = 'pe-7s-culture';
      categoryPath = '/organisations';
      categoryPath2 = '/organisation';
      break;
    case 'person':
      categoryLabel = 'People';
      categoryIcon = 'pe-7s-users';
      categoryPath = '/people';
      categoryPath2 = '/person';
      break;
    case 'resource':
      categoryLabel = 'Resources';
      categoryIcon = 'pe-7s-photo';
      categoryPath = '/resources';
      categoryPath2 = '/resource';
      break;
    case 'spatial':
      categoryLabel = 'Spatials';
      categoryIcon = 'pe-7s-map';
      categoryPath = '/spatials';
      categoryPath2 = '/spatial';
      break;
    case 'temporal':
      categoryLabel = 'Temporals';
      categoryIcon = 'pe-7s-date';
      categoryPath = '/temporals';
      categoryPath2 = '/temporal';
      break;
    default:
      break;
  }
  const breadcrumbsItems = [
    {
      label: categoryLabel,
      icon: categoryIcon,
      active: false,
      path: categoryPath,
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
    const label = type === 'Person' ? personLabel(item) : item.label;
    heading = `${label} network`;
    breadcrumbsItems.push(
      {
        label,
        icon: categoryIcon,
        active: false,
        path: `${categoryPath2}/${_id}`,
      },
      { label: 'Network', icon: 'pe-7s-graph1', active: true, path: '' }
    );
    const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
    updateDocumentTitle(documentTitle);
    content = (
      <div className="graph-container" id="graph-container">
        <Suspense fallback={renderLoader()}>
          <PersonNetwork _id={_id} relatedLinks={[]} relatedNodes={[]} />
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
}

export default ItemGraph;
