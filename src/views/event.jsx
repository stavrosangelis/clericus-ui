import React, { lazy, Suspense, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Label, Spinner, Card, CardBody } from 'reactstrap';
import { Link, useParams } from 'react-router-dom';

import { updateDocumentTitle, renderLoader } from '../helpers';

const { REACT_APP_APIPATH: APIPath } = process.env;
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const ClasspiecesBlock = lazy(() =>
  import('../components/item-blocks/Classpieces')
);
const DescriptionBlock = lazy(() =>
  import('../components/item-blocks/Description')
);
const EventsBlock = lazy(() => import('../components/item-blocks/Events'));
const OrganisationsBlock = lazy(() =>
  import('../components/item-blocks/Organisations')
);
const PeopleBlock = lazy(() => import('../components/item-blocks/People'));
const ResourcesBlock = lazy(() =>
  import('../components/item-blocks/Resources')
);
const SpatialBlock = lazy(() => import('../components/item-blocks/Spatial'));
const TemporalBlock = lazy(() => import('../components/item-blocks/Temporal'));

function Event() {
  const { _id } = useParams();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);

  const prevId = useRef(null);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      prevId.current = _id;
      const responseData = await await axios({
        method: 'get',
        url: `${APIPath}ui-event`,
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
  }, [loading, _id]);

  useEffect(() => {
    if (!loading && prevId.current !== _id) {
      prevId.current = _id;
      setLoading(true);
      setItem(null);
    }
  }, [_id, loading]);

  const renderDetails = () => {
    const {
      description = '',
      classpieces = [],
      resources = [],
      events = [],
      organisations = [],
      people = [],
      temporal = [],
      spatial = [],
    } = item;

    // description
    const descriptionRow =
      description !== '' ? (
        <Suspense fallback={renderLoader()} key="description">
          <DescriptionBlock description={description} />
        </Suspense>
      ) : null;

    // classpieces
    const classpiecesRow =
      classpieces.length > 0 ? (
        <Suspense fallback={renderLoader()} key="classpieces">
          <ClasspiecesBlock items={classpieces} />
        </Suspense>
      ) : null;

    // resources
    const resourcesRow =
      resources.length > 0 ? (
        <Suspense fallback={renderLoader()} key="resources">
          <ResourcesBlock items={resources} />
        </Suspense>
      ) : null;

    // events
    const eventsRow =
      events.length > 0 ? (
        <Suspense fallback={renderLoader()} key="events">
          <EventsBlock items={events} _id={_id} />
        </Suspense>
      ) : null;

    // organisations
    const organisationsRow =
      organisations.length > 0 ? (
        <Suspense fallback={renderLoader()} key="organisations">
          <OrganisationsBlock items={organisations} />
        </Suspense>
      ) : null;

    // people
    const peopleRow =
      people.length > 0 ? (
        <Suspense fallback={renderLoader()} key="people">
          <PeopleBlock items={people} />
        </Suspense>
      ) : null;

    // temporal
    const temporalRow =
      temporal.length > 0 ? (
        <Suspense fallback={renderLoader()} key="temporal">
          <TemporalBlock items={temporal} />
        </Suspense>
      ) : null;

    const spatialRow =
      spatial.length > 0 ? (
        <Suspense fallback={renderLoader()} key="spatial">
          <SpatialBlock items={spatial} />
        </Suspense>
      ) : null;

    return (
      <>
        {descriptionRow}
        {peopleRow}
        {organisationsRow}
        {classpiecesRow}
        {resourcesRow}
        {eventsRow}
        {temporalRow}
        {spatialRow}
      </>
    );
  };

  const renderItem = () => {
    const { label = '', eventType: iEventType = null } = item;
    const eventType =
      iEventType !== null && iEventType.inverseLabel !== '' ? (
        <small>[{iEventType.inverseLabel}]</small>
      ) : (
        []
      );

    // 2.1 meta
    const metaTable = renderDetails();
    const output = (
      <div className="item-container">
        <h3>
          {label} {eventType}
        </h3>
        <div className="row item-info-container">
          <div className="col-12">
            <div className="item-details-container">{metaTable}</div>
          </div>
        </div>
      </div>
    );
    return output;
  };

  let content = (
    <div>
      <div className="row">
        <div className="col-12">
          <div style={{ padding: '40pt', textAlign: 'center' }}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>
  );

  const breadcrumbsItems = [
    { label: 'Events', icon: 'pe-7s-date', active: false, path: '/events' },
  ];

  if (!loading && item !== null) {
    const { label = '' } = item;
    const eventCard = renderItem();
    const networkGraphLinkURL = `/item-graph/event/${_id}`;
    const networkGraphLink = (
      <div className="col-xs-12 col-sm-4">
        <Link
          href={networkGraphLinkURL}
          to={networkGraphLinkURL}
          className="person-component-link"
          title="Event graph network"
        >
          <i className="pe-7s-graph1" />
        </Link>
        <Link
          href={networkGraphLinkURL}
          to={networkGraphLinkURL}
          className="person-component-link-label"
          title="Event graph network"
        >
          <Label>Network graph</Label>
        </Link>
      </div>
    );
    content = (
      <div>
        <Card>
          <CardBody>
            <div className="row">
              <div className="col-12">{eventCard}</div>
            </div>
            <div className="row">{networkGraphLink}</div>
          </CardBody>
        </Card>
      </div>
    );
    breadcrumbsItems.push({
      label,
      icon: 'pe-7s-date',
      active: true,
      path: '',
    });
    const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
    updateDocumentTitle(documentTitle);
  }

  return (
    <div className="container">
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      {content}
    </div>
  );
}

export default Event;
