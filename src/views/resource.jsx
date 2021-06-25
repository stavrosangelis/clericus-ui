import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import { Label, Spinner, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import Breadcrumbs from '../components/breadcrumbs';
import {
  getResourceThumbnailURL,
  getResourceFullsizeURL,
  renderLoader,
  updateDocumentTitle,
} from '../helpers';
import parseMetadata from '../helpers/parse-metadata';

const Viewer = lazy(() => import('../components/image-viewer-resource'));
const DescriptionBlock = lazy(() =>
  import('../components/item-blocks/description')
);
const ResourcesBlock = lazy(() =>
  import('../components/item-blocks/resources')
);
const ClasspiecesBlock = lazy(() =>
  import('../components/item-blocks/classpieces')
);
const EventsBlock = lazy(() => import('../components/item-blocks/events'));
const OrganisationsBlock = lazy(() =>
  import('../components/item-blocks/organisations')
);
const PeopleBlock = lazy(() => import('../components/item-blocks/people'));

export default class Resource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: null,
      viewerVisible: false,
      descriptionVisible: true,
      eventsVisible: true,
      peopleVisible: true,
      classpiecesVisible: true,
      resourcesVisible: true,
      organisationsVisible: true,
      metadataDataVisible: false,
      error: {
        visible: false,
        text: [],
      },
    };

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderResourceDetails = this.renderResourceDetails.bind(this);
    this.renderThumbnailMetadata = this.renderThumbnailMetadata.bind(this);

    this.toggleViewer = this.toggleViewer.bind(this);
    this.toggleTable = this.toggleTable.bind(this);

    const cancelToken = axios.CancelToken;
    this.cancelSource = cancelToken.source();
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    const { match: prevMatch } = prevProps;
    const { _id: prevId } = prevMatch.params;
    const { match } = this.props;
    const { _id } = match.params;
    if (prevId !== _id) {
      this.load();
    }
  }

  componentWillUnmount() {
    this.cancelSource.cancel('api request cancelled');
  }

  async load() {
    const { match } = this.props;
    const { _id } = match.params;
    if (typeof _id === 'undefined' || _id === null || _id === '') {
      return false;
    }
    this.setState({
      loading: true,
    });
    const params = {
      _id,
    };
    const url = `${process.env.REACT_APP_APIPATH}ui-resource`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
      cancelToken: this.cancelSource.token,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (typeof responseData !== 'undefined') {
      if (responseData.status) {
        this.setState({
          loading: false,
          item: responseData.data,
        });
      } else {
        this.setState({
          loading: false,
          error: {
            visible: true,
            text: responseData.msg,
          },
        });
      }
    }
    return false;
  }

  toggleTable(e, dataType = null) {
    const { [`${dataType}Visible`]: value } = this.state;
    const payload = {
      [`${dataType}Visible`]: !value,
    };
    this.setState(payload);
  }

  toggleViewer() {
    const { viewerVisible } = this.state;
    this.setState({
      viewerVisible: !viewerVisible,
    });
  }

  renderResourceDetails(stateData = null) {
    const { item } = stateData;
    const {
      descriptionVisible,
      classpiecesVisible,
      resourcesVisible,
      eventsVisible,
      organisationsVisible,
    } = this.state;

    // 1. resourceDetails
    const detailsOutput = [];

    // description
    let descriptionRow = [];
    let descriptionHidden = '';
    let descriptionVisibleClass = '';
    if (!descriptionVisible) {
      descriptionHidden = ' closed';
      descriptionVisibleClass = 'hidden';
    }
    if (
      typeof item.description !== 'undefined' &&
      item.description !== null &&
      item.description !== ''
    ) {
      descriptionRow = (
        <Suspense fallback={renderLoader()} key="description">
          <DescriptionBlock
            toggleTable={this.toggleTable}
            hidden={descriptionHidden}
            visible={descriptionVisibleClass}
            description={item.description}
          />
        </Suspense>
      );
    }

    let originalLocation = [];
    if (
      typeof item.originalLocation !== 'undefined' &&
      item.originalLocation !== null &&
      item.originalLocation !== ''
    ) {
      originalLocation = (
        <div className="original-location" key="original-location">
          Original location:{' '}
          <a
            href={item.originalLocation}
            rel="noopener noreferrer"
            target="_blank"
          >
            URL
          </a>
        </div>
      );
    }

    // classpieces
    let classpiecesRow = [];
    let classpiecesHidden = '';
    let classpiecesVisibleClass = '';
    if (!classpiecesVisible) {
      classpiecesHidden = ' closed';
      classpiecesVisibleClass = 'hidden';
    }
    if (
      typeof item.classpieces !== 'undefined' &&
      item.classpieces !== null &&
      item.classpieces !== ''
    ) {
      classpiecesRow = (
        <Suspense fallback={renderLoader()} key="classpieces">
          <ClasspiecesBlock
            toggleTable={this.toggleTable}
            hidden={classpiecesHidden}
            visible={classpiecesVisibleClass}
            items={item.classpieces}
          />
        </Suspense>
      );
    }

    // resources
    let resourcesRow = [];
    let resourcesHidden = '';
    let resourcesVisibleClass = '';
    if (!resourcesVisible) {
      resourcesHidden = ' closed';
      resourcesVisibleClass = 'hidden';
    }
    if (
      typeof item.resources !== 'undefined' &&
      item.resources !== null &&
      item.resources !== ''
    ) {
      resourcesRow = (
        <Suspense fallback={renderLoader()} key="resources">
          <ResourcesBlock
            toggleTable={this.toggleTable}
            hidden={resourcesHidden}
            visible={resourcesVisibleClass}
            resources={item.resources}
          />
        </Suspense>
      );
    }

    // events
    let eventsRow = [];
    let eventsHidden = '';
    let eventsVisibleClass = '';
    if (!eventsVisible) {
      eventsHidden = ' closed';
      eventsVisibleClass = 'hidden';
    }
    if (
      typeof item.events !== 'undefined' &&
      item.events !== null &&
      item.events !== ''
    ) {
      eventsRow = (
        <Suspense fallback={renderLoader()} key="events">
          <EventsBlock
            toggleTable={this.toggleTable}
            hidden={eventsHidden}
            visible={eventsVisibleClass}
            events={item.events}
          />
        </Suspense>
      );
    }

    // organisations
    let organisationsRow = [];
    let organisationsHidden = '';
    let organisationsVisibleClass = '';
    if (!organisationsVisible) {
      organisationsHidden = ' closed';
      organisationsVisibleClass = 'hidden';
    }
    if (
      typeof item.organisations !== 'undefined' &&
      item.organisations !== null &&
      item.organisations !== ''
    ) {
      organisationsRow = (
        <Suspense fallback={renderLoader()} key="organisations">
          <OrganisationsBlock
            toggleTable={this.toggleTable}
            hidden={organisationsHidden}
            visible={organisationsVisibleClass}
            organisations={item.organisations}
          />
        </Suspense>
      );
    }

    // people
    const peopleRow = (
      <Suspense fallback={renderLoader()} key="people">
        <PeopleBlock name="resource" peopleItem={item.people} />
      </Suspense>
    );

    detailsOutput.push(descriptionRow);
    detailsOutput.push(originalLocation);
    detailsOutput.push(eventsRow);
    detailsOutput.push(peopleRow);
    detailsOutput.push(classpiecesRow);
    detailsOutput.push(resourcesRow);
    detailsOutput.push(organisationsRow);

    // 1.5 technical metadata
    let technicalMetadata = [];
    if (Object.keys(stateData.item.metadata).length > 0) {
      technicalMetadata = this.renderThumbnailMetadata(
        stateData.item.metadata,
        stateData.metadataDataVisible
      );
      detailsOutput.push(technicalMetadata);
    }
    return <div className="classpiece-details-container">{detailsOutput}</div>;
  }

  renderThumbnailMetadata(metadata = null, visible) {
    let metadataDataHidden = '';
    let metadataVisibleClass = '';
    if (!visible) {
      metadataDataHidden = ' closed';
      metadataVisibleClass = 'hidden';
    }
    const metadataOutput = (
      <div key="metadata">
        <h5>
          Technical metadata
          <div
            className="btn btn-default btn-xs pull-right toggle-info-btn"
            onClick={(e) => {
              this.toggleTable(e, 'metadataData');
            }}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle metadata table"
          >
            <i className={`fa fa-angle-down${metadataDataHidden}`} />
          </div>
        </h5>
        <div className={metadataVisibleClass}>
          {parseMetadata(metadata.image)}
        </div>
      </div>
    );
    return metadataOutput;
  }

  renderItem(stateData = null) {
    const { item } = stateData;
    const { label } = item;

    // 1 resourceDetails - resourceDetails include description, events, organisations, and people
    const resourceDetails = this.renderResourceDetails(stateData);

    // 2. thumbnailImage
    let thumbnailImage = [];
    const thumbnailURL = getResourceThumbnailURL(item);
    if (thumbnailURL !== null) {
      thumbnailImage = (
        <div
          key="thumbnailImage"
          className="show-resource"
          onClick={() => this.toggleViewer()}
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
  }

  render() {
    const { loading, item, viewerVisible, error } = this.state;
    const { match } = this.props;
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

    let label = '';
    let breadcrumbsItems = [
      {
        label: 'Resources',
        icon: 'pe-7s-photo',
        active: false,
        path: '/resources',
      },
    ];

    let imgViewer = [];
    if (!loading) {
      if (item !== null) {
        const itemCard = this.renderItem(this.state);

        const labelGraph = 'resource-graph';
        const { _id } = match.params;

        let timelineLink = [];
        if (item.events.length > 0) {
          const timelinkURL = `/item-timeline/resource/${match.params._id}`;
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
        const networkGraphLinkURL = `/${labelGraph}/${_id}`;
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
        content = (
          <div>
            <Card>
              <CardBody>
                <div className="row">
                  <div className="col-12">{itemCard}</div>
                </div>
                <div className="row timelink-row">
                  {timelineLink}
                  {networkGraphLink}
                </div>
              </CardBody>
            </Card>
          </div>
        );
        const resource = item;
        label = resource.label;
        let icon = 'pe-7s-photo';
        if (resource.resourceType === 'document') {
          icon = 'fa fa-file-pdf-o';
        }
        breadcrumbsItems = [
          { label: 'Resources', icon, active: false, path: '/resources' },
          { label, icon, active: true, path: '' },
        ];
        const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
        updateDocumentTitle(documentTitle);
        const fullsizePath = getResourceFullsizeURL(resource);
        if (fullsizePath !== null && resource.resourceType === 'image') {
          if (resource.resourceType !== 'document') {
            imgViewer = (
              <Suspense fallback={renderLoader()}>
                <Viewer
                  visible={viewerVisible}
                  path={fullsizePath}
                  label={label}
                  toggle={this.toggleViewer}
                  item={resource}
                />
              </Suspense>
            );
          }
        }
      } else if (error.visible) {
        breadcrumbsItems.push({
          label: error.text,
          icon: 'fa fa-times',
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
                  <div className="col-12">
                    <h3>Error</h3>
                    <p>{error.text}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        );
      }
    }
    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
        {imgViewer}
      </div>
    );
  }
}

Resource.defaultProps = {
  match: null,
};
Resource.propTypes = {
  match: PropTypes.object,
};
