import React, { lazy, Suspense, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Label, Spinner, Card, CardBody } from 'reactstrap';
import { Link, useParams } from 'react-router-dom';

import {
  getResourceThumbnailURL,
  getResourceFullsizeURL,
  renderLoader,
  updateDocumentTitle,
} from '../helpers';
import '../scss/classpiece.viewer.scss';

const { REACT_APP_APIPATH: APIPath } = process.env;
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const DescriptionBlock = lazy(() =>
  import('../components/item-blocks/Description')
);
const ClasspiecesBlock = lazy(() =>
  import('../components/item-blocks/Classpieces')
);
const EventsBlock = lazy(() => import('../components/item-blocks/Events'));
const MetadataBlock = lazy(() => import('../components/item-blocks/Metadata'));
const OrganisationsBlock = lazy(() =>
  import('../components/item-blocks/Organisations')
);
const PeopleBlock = lazy(() => import('../components/item-blocks/People'));
const ResourcesBlock = lazy(() =>
  import('../components/item-blocks/Resources')
);
const Viewer = lazy(() => import('../components/Image.viewer.resource'));

function Resource() {
  const { _id } = useParams();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  const prevId = useRef(null);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      prevId.current = _id;
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}ui-resource`,
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

  const toggleViewer = () => {
    setViewerVisible(!viewerVisible);
  };

  const renderDetails = () => {
    const {
      classpieces = [],
      description = '',
      events = [],
      metadata = [],
      organisations = [],
      originalLocation = '',
      people = [],
      resources = [],
    } = item;

    // description
    const descriptionRow =
      description !== '' ? (
        <Suspense fallback={renderLoader()} key="description">
          <DescriptionBlock description={description} />
        </Suspense>
      ) : null;

    // original location
    const originalLocationRow =
      originalLocation !== '' ? (
        <div className="original-location" key="original-location">
          Original location:{' '}
          <a href={originalLocation} rel="noopener noreferrer" target="_blank">
            URL
          </a>
        </div>
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
          <PeopleBlock items={people} />
        </Suspense>
      ) : null;

    // resources
    const resourcesRow =
      resources.length > 0 ? (
        <Suspense fallback={renderLoader()} key="resources">
          <ResourcesBlock items={resources} />
        </Suspense>
      ) : null;

    // technical metadata
    const technicalMetadataRow =
      Object.keys(metadata).length > 0 ? (
        <Suspense fallback={renderLoader()} key="technical-metadata">
          <MetadataBlock metadata={metadata} />
        </Suspense>
      ) : null;

    return (
      <>
        {descriptionRow}
        {originalLocationRow}
        {eventsRow}
        {peopleRow}
        {classpiecesRow}
        {resourcesRow}
        {organisationsRow}
        {technicalMetadataRow}
      </>
    );
  };

  const renderItem = () => {
    const { label = '' } = item;
    const resourceDetails = renderDetails();

    // 2. thumbnailImage
    let thumbnailImage = null;
    const thumbnailURL = getResourceThumbnailURL(item);
    if (thumbnailURL !== null) {
      thumbnailImage = (
        <div
          key="thumbnailImage"
          className="show-resource"
          onClick={() => toggleViewer()}
          onContextMenu={(e) => {
            e.preventDefault();
            return false;
          }}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle image viewer"
        >
          <img
            src={thumbnailURL}
            className="people-thumbnail img-fluid img-thumbnail"
            alt={label}
          />
        </div>
      );
    } else if (item.resourceType === 'document') {
      const fullsizePath = getResourceFullsizeURL(item);
      if (fullsizePath !== null) {
        thumbnailImage = [
          <a
            key="link"
            target="_blank"
            href={fullsizePath}
            className="pdf-thumbnail"
            rel="noopener noreferrer"
          >
            <i className="fa fa-file-pdf-o" />
          </a>,
          <a
            key="link-label"
            target="_blank"
            href={fullsizePath}
            className="pdf-thumbnail"
            rel="noopener noreferrer"
          >
            <Label>Preview file</Label>{' '}
          </a>,
        ];
      }
    }

    let leftColClass = 'col-sm-6 col-md-7';
    let rightColClass = 'col-sm-6 col-md-5';
    if (thumbnailURL === null) {
      leftColClass = 'extra-side-padding';
      rightColClass = '';
    }
    const output = (
      <div>
        <h3>{label}</h3>
        <div className="row">
          <div className={`col-xs-12 ${leftColClass}`}>{resourceDetails}</div>
          <div className={`col-xs-12 ${rightColClass}`}>{thumbnailImage}</div>
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
    {
      label: 'Resources',
      icon: 'pe-7s-photo',
      active: false,
      path: '/resources',
    },
  ];

  if (!loading && item !== null) {
    const { events = [], label = '', resourceType = '' } = item;
    const resourceCard = renderItem();
    let timelineLink = null;
    if (events.length > 0) {
      const timelinkURL = `/item-timeline/resource/${_id}`;
      timelineLink = (
        <div className="col-xs-12 col-sm-4">
          <Link
            href={timelinkURL}
            to={timelinkURL}
            className="person-component-link"
            title="Resource graph timeline"
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
    const networkGraphLinkURL = `/item-graph/resource/${_id}`;
    const networkGraphLink = (
      <div className="col-xs-12 col-sm-4">
        <Link
          href={networkGraphLinkURL}
          to={networkGraphLinkURL}
          className="person-component-link"
          title="Resource graph network"
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

    breadcrumbsItems.push({
      label,
      icon: 'pe-7s-photo',
      active: true,
      path: '',
    });
    const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
    updateDocumentTitle(documentTitle);
    const fullsizePath = getResourceFullsizeURL(item);
    let imgViewer = null;
    if (fullsizePath !== null && resourceType === 'image') {
      if (resourceType !== 'document') {
        imgViewer = (
          <Suspense fallback={renderLoader()}>
            <Viewer
              visible={viewerVisible}
              path={fullsizePath}
              label={label}
              toggle={toggleViewer}
              item={item}
            />
          </Suspense>
        );
      }
    }
    content = (
      <div>
        <Card>
          <CardBody>
            <div className="row">
              <div className="col-12">{resourceCard}</div>
            </div>
            <div className="row">
              {timelineLink}
              {networkGraphLink}
            </div>
          </CardBody>
        </Card>
        {imgViewer}
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
export default Resource;
