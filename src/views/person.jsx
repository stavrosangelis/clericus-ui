import React, { lazy, Suspense, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Label, Spinner, Card, CardBody } from 'reactstrap';
import { Link, useParams } from 'react-router-dom';
import {
  getItemThumbnailsURL,
  personLabel,
  renderLoader,
  updateDocumentTitle,
} from '../helpers';
import defaultThumbnail from '../assets/images/spcc.jpg';
import icpThumbnail from '../assets/images/icp-logo.jpg';

import '../scss/classpiece.viewer.scss';

const { REACT_APP_APIPATH: APIPath } = process.env;
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const AlternateAppellationsBlock = lazy(() =>
  import('../components/item-blocks/AlternateAppellations')
);
const DescriptionBlock = lazy(() =>
  import('../components/item-blocks/Description')
);
const ResourcesBlock = lazy(() =>
  import('../components/item-blocks/Resources')
);
const ClasspiecesBlock = lazy(() =>
  import('../components/item-blocks/Classpieces')
);
const EventsBlock = lazy(() => import('../components/item-blocks/Events'));
const OrganisationsBlock = lazy(() =>
  import('../components/item-blocks/Organisations')
);
const PeopleBlock = lazy(() => import('../components/item-blocks/People'));
const Viewer = lazy(() => import('../components/Image.viewer.resource'));

function Person() {
  const { _id } = useParams();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [thumbnailImages, setThumbnailImages] = useState([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [thumbnailVisible, setThumbnailVisible] = useState(0);

  const prevId = useRef(null);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      prevId.current = _id;
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}ui-person`,
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
          setThumbnailImages(getItemThumbnailsURL(data));
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

  const toggleViewer = () => {
    setViewerVisible(!viewerVisible);
  };

  const showThumbnail = (index) => {
    setThumbnailVisible(index);
  };

  const renderDetails = () => {
    const {
      alternateAppelations = [],
      classpieces = [],
      description = '',
      events = [],
      organisations = [],
      people = [],
      resources = [],
    } = item;

    // PersonDetails
    const appellationsRow =
      alternateAppelations.length > 0 ? (
        <Suspense fallback={renderLoader()} key="description">
          <AlternateAppellationsBlock items={alternateAppelations} />
        </Suspense>
      ) : null;

    // description
    const descriptionRow =
      description !== '' ? (
        <Suspense fallback={renderLoader()} key="description">
          <DescriptionBlock description={description} />
        </Suspense>
      ) : null;

    // events
    const eventsRow =
      events.length > 0 ? (
        <Suspense fallback={renderLoader()} key="events">
          <EventsBlock items={events} _id={_id} />
        </Suspense>
      ) : null;

    // classpieces
    const classpiecesRow =
      classpieces.length > 0 ? (
        <Suspense fallback={renderLoader()} key="classpieces">
          <ClasspiecesBlock items={classpieces} />
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
          <PeopleBlock items={people} heatmap />
        </Suspense>
      ) : null;

    // resources
    const resourcesRow =
      resources.length > 0 ? (
        <Suspense fallback={renderLoader()} key="resources">
          <ResourcesBlock items={resources} />
        </Suspense>
      ) : null;

    return (
      <>
        {appellationsRow}
        {descriptionRow}
        {eventsRow}
        {peopleRow}
        {organisationsRow}
        {classpiecesRow}
        {resourcesRow}
      </>
    );
  };

  const renderThumbnails = (label = '') => {
    const { thumbnails = [] } = thumbnailImages;
    const { length } = thumbnails;
    if (length > 0) {
      const images = thumbnails.map((t, i) => {
        const visible = i === thumbnailVisible ? '' : ' hidden';
        const key = `a${i}`;
        return (
          <div
            key={key}
            onClick={() => toggleViewer()}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle image viewer"
            className={`person-thumbnail-container${visible}`}
          >
            <img
              src={t}
              className="people-thumbnail img-fluid img-thumbnail person-thumbnailImage"
              alt={label}
            />
          </div>
        );
      });
      let prevIndex = thumbnailVisible - 1;
      let nextIndex = thumbnailVisible + 1;
      if (prevIndex < 0) {
        prevIndex = length - 1;
      }
      if (nextIndex >= length) {
        nextIndex = 0;
      }
      const navigation =
        length > 1 ? (
          <div className="item-thumbnails-nav">
            <div
              className="left"
              onClick={() => showThumbnail(prevIndex)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="show next"
            >
              <i className="fa fa-chevron-left" />
            </div>
            <div
              className="right"
              onClick={() => showThumbnail(nextIndex)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="show previous"
            >
              <i className="fa fa-chevron-right" />
            </div>
          </div>
        ) : null;

      const block = (
        <div
          className="item-thumbnails"
          onContextMenu={(e) => {
            e.preventDefault();
            return false;
          }}
        >
          {images}
          {navigation}
        </div>
      );
      return block;
    }
    return null;
  };

  const renderItem = () => {
    const { resources = [], honorificPrefix = [], personType = '' } = item;
    // 1.1 thumbnailImage
    let label = personLabel(item);
    let imgViewer = null;
    let thumbnailImage = null;
    const { thumbnails = [], fullsize = [] } = thumbnailImages;
    const { length: tLength } = thumbnails;
    const { length: fLength } = fullsize;
    if (tLength > 0) {
      thumbnailImage = renderThumbnails(label);
      const path =
        typeof fullsize[thumbnailVisible] !== 'undefined'
          ? fullsize[thumbnailVisible]
          : '';
      imgViewer = (
        <Suspense fallback={renderLoader()}>
          <Viewer
            visible={viewerVisible}
            label={label}
            toggle={toggleViewer}
            path={path}
            length={fLength}
            index={thumbnailVisible}
            setIndex={showThumbnail}
          />
        </Suspense>
      );
    } else {
      const isinICP =
        resources.find((i) =>
          i.ref.label.includes('Liam Chambers and Sarah Frank')
        ) || null;
      if (isinICP) {
        thumbnailImage = (
          <img
            src={icpThumbnail}
            className="people-thumbnail img-fluid img-thumbnail person-thumbnailImage"
            alt={label}
            onContextMenu={(e) => {
              e.preventDefault();
              return false;
            }}
          />
        );
      } else {
        thumbnailImage = (
          <img
            src={defaultThumbnail}
            className="people-thumbnail img-fluid img-thumbnail person-thumbnailImage"
            alt={label}
            onContextMenu={(e) => {
              e.preventDefault();
              return false;
            }}
          />
        );
      }
    }
    if (honorificPrefix.length > 0) {
      let labelHP = honorificPrefix.filter((i) => i !== '').join(', ');
      if (labelHP !== '') {
        labelHP = `(${labelHP})`;
      }
      label = `${labelHP} ${label}`;
    }

    // 2.1 meta
    const metaTable = renderDetails();
    const laity = personType === 'Laity' ? <small>[{personType}]</small> : [];
    const output = (
      <div className="person-container">
        <h3>
          {label} {laity}
        </h3>
        <div className="row person-info-container">
          <div className="col-xs-12 col-sm-6 col-md-5">{thumbnailImage}</div>
          <div className="col-xs-12 col-sm-6 col-md-7">
            <div className="person-details-container">{metaTable}</div>
          </div>
        </div>
        {imgViewer}
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
    { label: 'People', icon: 'pe-7s-users', active: false, path: '/people' },
  ];

  if (!loading && item !== null) {
    const { events = [] } = item;
    const personCard = renderItem();
    let timelineLink = null;
    if (events.length > 0) {
      const timelinkURL = `/item-timeline/person/${_id}`;
      timelineLink = (
        <div className="col-xs-12 col-sm-4">
          <Link
            href={timelinkURL}
            to={timelinkURL}
            className="person-component-link"
            title="Person graph timeline"
          >
            <i className="pe-7s-hourglass" />
          </Link>
          <Link
            href={timelinkURL}
            to={timelinkURL}
            className="person-component-link-label"
            title="Resource graph timeline"
          >
            <Label>Timeline</Label>
          </Link>
        </div>
      );
    }
    const networkGraphLinkURL = `/item-graph/person/${_id}`;
    const networkGraphLink = (
      <div className="col-xs-12 col-sm-4">
        <Link
          href={networkGraphLinkURL}
          to={networkGraphLinkURL}
          className="person-component-link"
          title="Person graph network"
        >
          <i className="pe-7s-graph1" />
        </Link>
        <Link
          href={networkGraphLinkURL}
          to={networkGraphLinkURL}
          className="person-component-link-label"
          title="Resource graph network"
        >
          <Label>Network graph</Label>
        </Link>
      </div>
    );

    const label = personLabel(item);
    breadcrumbsItems.push({
      label,
      icon: 'pe-7s-user',
      active: true,
      path: '',
    });
    const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
    updateDocumentTitle(documentTitle);
    content = (
      <div>
        <Card>
          <CardBody>
            <div className="row">
              <div className="col-12">{personCard}</div>
            </div>
            <div className="row">
              {timelineLink}
              {networkGraphLink}
            </div>
          </CardBody>
        </Card>
      </div>
    );
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

export default Person;
