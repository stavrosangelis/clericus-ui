import React, { lazy, Suspense, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Label, Spinner, Card, CardBody } from 'reactstrap';
import { Link, useParams } from 'react-router-dom';
import {
  getItemThumbnailsURL,
  updateDocumentTitle,
  renderLoader,
} from '../helpers';

import '../scss/classpiece.viewer.scss';

const { REACT_APP_APIPATH: APIPath } = process.env;
const AlternateAppellationsBlock = lazy(() =>
  import('../components/item-blocks/AlternateAppellations')
);
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
const Viewer = lazy(() => import('../components/Image.viewer.resource'));

function Organisation() {
  const { _id } = useParams();

  //  state
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
        url: `${APIPath}ui-organisation`,
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
      description = '',
      classpieces = [],
      resources = [],
      events = [],
      organisations = [],
      people = [],
      spatial = [],
    } = item;

    // alternate appellations
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

    const spatialRow =
      spatial.length > 0 ? (
        <Suspense fallback={renderLoader()} key="spatial">
          <SpatialBlock items={spatial} />
        </Suspense>
      ) : null;

    return (
      <>
        {appellationsRow}
        {descriptionRow}
        {spatialRow}
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
    const { label, organisationType = '' } = item;
    const organisationTypeLabel =
      organisationType !== '' ? <small>[{organisationType}]</small> : '';

    // 2.1 meta
    const metaTable = renderDetails();

    // 2.2 thumbnails
    let imgViewer = null;
    let thumbnailImage = null;
    const { thumbnails = [], fullsize = [] } = thumbnailImages;
    const { length: tLength } = thumbnails;
    const { length: fLength } = fullsize;
    if (tLength > 0) {
      thumbnailImage = renderThumbnails(thumbnailImages, label);
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
    }
    const colClass =
      thumbnailImage !== null ? `col-xs-12 col-sm-6 col-md-7` : `col-12`;
    const thumbnailCol =
      thumbnailImage !== null ? (
        <div className="col-xs-12 col-sm-6 col-md-5">{thumbnailImage}</div>
      ) : null;
    const output = (
      <div className="item-container">
        <h3>
          {label} {organisationTypeLabel}
        </h3>
        <div className="row item-info-container">
          {thumbnailCol}
          <div className={colClass}>
            <div className="item-details-container">{metaTable}</div>
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
    {
      label: 'Organisations',
      icon: 'pe-7s-culture',
      active: false,
      path: '/organisations',
    },
  ];

  if (!loading && item !== null) {
    const { label = '', events = [] } = item;
    const itemCard = renderItem();

    let timelineLink = null;
    if (events.length > 0) {
      const timelinkURL = `/item-timeline/organisation/${_id}`;
      timelineLink = (
        <div className="col-xs-12 col-sm-4">
          <Link
            href={timelinkURL}
            to={timelinkURL}
            className="person-component-link"
            title="Organisation graph timeline"
          >
            <i className="pe-7s-hourglass" />
          </Link>
          <Link
            href={timelinkURL}
            to={timelinkURL}
            className="person-component-link-label"
            title="Organisation graph timeline"
          >
            <Label>Timeline</Label>
          </Link>
        </div>
      );
    }
    const networkGraphLinkURL = `/item-graph/organisation/${_id}`;
    const networkGraphLink = (
      <div className="col-xs-12 col-sm-4">
        <Link
          href={networkGraphLinkURL}
          to={networkGraphLinkURL}
          className="person-component-link"
          title="Organisation graph network"
        >
          <i className="pe-7s-graph1" />
        </Link>
        <Link
          href={networkGraphLinkURL}
          to={networkGraphLinkURL}
          className="person-component-link-label"
          title="Organisation graph network"
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
              <div className="col-12">{itemCard}</div>
            </div>
            <div className="row">
              {timelineLink}
              {networkGraphLink}
            </div>
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

export default Organisation;
