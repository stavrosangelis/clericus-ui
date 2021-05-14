import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import { Label, Spinner, Card, CardBody } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Breadcrumbs from '../components/breadcrumbs';
import {
  getPersonThumbnailURL,
  updateDocumentTitle,
  jsonStringToObject,
  renderLoader,
} from '../helpers';
import defaultThumbnail from '../assets/images/spcc.jpg';
import icpThumbnail from '../assets/images/icp-logo.jpg';

const Viewer = lazy(() => import('../components/image-viewer-resource.js'));
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

class Person extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: null,
      thumbnailVisible: 0,
      viewerVisible: false,
      appellationsVisible: true,
      descriptionVisible: true,
      eventsVisible: true,
      peopleVisible: true,
      classpiecesVisible: true,
      resourcesVisible: true,
      organisationsVisible: true,
      metadataDataVisible: true,
      images: [],
      error: {
        visible: false,
        text: [],
      },
    };

    this.load = this.load.bind(this);
    this.toggleTable = this.toggleTable.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderThumbnails = this.renderThumbnails.bind(this);
    this.showThumbnail = this.showThumbnail.bind(this);
    this.renderPersonDetails = this.renderPersonDetails.bind(this);
    this.toggleViewer = this.toggleViewer.bind(this);

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
    const url = `${process.env.REACT_APP_APIPATH}ui-person`;
    const person = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
      cancelToken: this.cancelSource.token,
    })
      .then((response) => response.data)
      .catch((error) => console.log(error));
    if (typeof person !== 'undefined') {
      if (person.status) {
        this.setState({
          loading: false,
          item: person.data,
          images: getPersonThumbnailURL(person.data),
        });
      } else {
        this.setState({
          loading: false,
          error: {
            visible: true,
            text: person.msg,
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

  showThumbnail(index) {
    this.setState({
      thumbnailVisible: index,
    });
  }

  renderPersonDetails(stateData = null) {
    const { item } = stateData;
    const {
      appellationsVisible,
      descriptionVisible,
      classpiecesVisible,
      resourcesVisible,
      eventsVisible,
      organisationsVisible,
    } = this.state;
    // 1. PersonDetails
    const meta = [];
    let appellationsRow = [];
    let appellationsHidden = '';
    let appellationsVisibleClass = '';
    if (!appellationsVisible) {
      appellationsHidden = ' closed';
      appellationsVisibleClass = 'hidden';
    }
    if (
      typeof item.alternateAppelations !== 'undefined' &&
      item.alternateAppelations !== null &&
      item.alternateAppelations !== '' &&
      item.alternateAppelations.length > 0
    ) {
      const appellations = item.alternateAppelations.map((a, i) => {
        const obj = jsonStringToObject(a);
        let label = '';
        let lang = '';
        let note = '';
        if (obj.appelation !== '') {
          label = obj.appelation;
        } else {
          label = obj.firstName;
          if (obj.middleName !== '') {
            if (label !== '') {
              label += ' ';
            }
            label += obj.middleName;
          }
          if (obj.lastName !== '') {
            if (label !== '') {
              label += ' ';
            }
            label += obj.lastName;
          }
        }
        if (
          typeof obj.language !== 'undefined' &&
          typeof obj.language.label !== 'undefined' &&
          obj.language.label !== ''
        ) {
          lang = ` [${obj.language.label}]`;
        }
        if (typeof obj.note !== 'undefined' && obj.note !== '') {
          note = <i>{` ${obj.note}`}</i>;
        }
        const key = `a${i}`;
        const output = (
          <div key={key}>
            {label}
            {lang}
            {note}
          </div>
        );
        return output;
      });
      appellationsRow = (
        <div key="appellationsRow">
          <h5>
            Alternate appellations
            <div
              className="btn btn-default btn-xs pull-right toggle-info-btn"
              onClick={(e) => {
                this.toggleTable(e, 'appellations');
              }}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="toggle appellations table"
            >
              <i className={`fa fa-angle-down${appellationsHidden}`} />
            </div>
          </h5>
          <div className={appellationsVisibleClass}>{appellations}</div>
        </div>
      );
    }

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
    const peopleRow =
      typeof item.people !== 'undefined' && item.people.length > 0 ? (
        <Suspense fallback={renderLoader()} key="people">
          <PeopleBlock name="person" peopleItem={item.people} />
        </Suspense>
      ) : (
        []
      );

    meta.push(appellationsRow);
    meta.push(descriptionRow);
    meta.push(eventsRow);
    meta.push(peopleRow);
    meta.push(organisationsRow);
    meta.push(classpiecesRow);
    meta.push(resourcesRow);

    return meta;
  }

  renderThumbnails(thumbnailURLs, label) {
    const { thumbnailVisible } = this.state;
    const images = thumbnailURLs.thumbnails.map((t, i) => {
      let visible = ' hidden';
      if (i === thumbnailVisible) {
        visible = '';
      }
      const key = `a${i}`;
      return (
        <div
          key={key}
          onClick={() => this.toggleViewer()}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle image viewer"
        >
          <img
            src={t}
            className={`people-thumbnail img-fluid img-thumbnail person-thumbnailImage${visible}`}
            alt={label}
          />
        </div>
      );
    });
    let navigation = [];
    let prevIndex = thumbnailVisible - 1;
    let nextIndex = thumbnailVisible + 1;
    if (prevIndex < 0) {
      prevIndex = thumbnailURLs.thumbnails.length - 1;
    }
    if (nextIndex >= thumbnailURLs.thumbnails.length) {
      nextIndex = 0;
    }
    if (thumbnailURLs.thumbnails.length > 1) {
      navigation = (
        <div className="item-thumbnails-nav">
          <div
            className="left"
            onClick={() => this.showThumbnail(prevIndex)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="show next"
          >
            <i className="fa fa-chevron-left" />
          </div>
          <div
            className="right"
            onClick={() => this.showThumbnail(nextIndex)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="show previous"
          >
            <i className="fa fa-chevron-right" />
          </div>
        </div>
      );
    }
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

  renderItem(stateData = null) {
    const { item } = stateData;
    const { images, thumbnailVisible, viewerVisible } = this.state;
    // 1.1 thumbnailImage
    let label = item.firstName;
    let imgViewer = [];
    let thumbnailImage = [];
    const thumbnailURLs = images;
    if (
      typeof thumbnailURLs.thumbnails !== 'undefined' &&
      thumbnailURLs.thumbnails.length > 0
    ) {
      thumbnailImage = this.renderThumbnails(thumbnailURLs, label);
      let length = 0;
      let path = '';
      if (typeof images.fullsize !== 'undefined') {
        path = images.fullsize[thumbnailVisible];
        length = images.fullsize.length;
      }
      imgViewer = (
        <Suspense fallback={renderLoader()}>
          <Viewer
            visible={viewerVisible}
            label={label}
            toggle={this.toggleViewer}
            path={path}
            length={length}
            index={thumbnailVisible}
            setIndex={this.showThumbnail}
          />
        </Suspense>
      );
    } else {
      const isinICP =
        item.resources.find((i) =>
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
    // 1.2 label
    if (
      typeof item.middleName !== 'undefined' &&
      item.middleName !== null &&
      item.middleName !== ''
    ) {
      label += ` ${item.middleName}`;
    }
    label += ` ${item.lastName}`;
    if (item.honorificPrefix.length > 0) {
      let labelHP = item.honorificPrefix.filter((i) => i !== '').join(', ');
      if (labelHP !== '') {
        labelHP = `(${labelHP})`;
      }
      label = `${labelHP} ${label}`;
    }

    // 2.1 meta
    const metaTable = this.renderPersonDetails(stateData);
    const output = (
      <div className="person-container">
        <h3>{label}</h3>
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
  }

  render() {
    const { loading, item, error } = this.state;
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
    const breadcrumbsItems = [
      { label: 'People', icon: 'pe-7s-users', active: false, path: '/people' },
    ];
    if (!loading) {
      if (item !== null) {
        const personCard = this.renderItem(this.state);
        let timelineLink = [];
        if (item.events.length > 0) {
          const timelinkURL = `/item-timeline/person/${match.params._id}`;
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
        const networkGraphLinkURL = `/person-graph/${match.params._id}`;
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

        label = item.firstName;
        if (
          typeof item.middleName !== 'undefined' &&
          item.middleName !== null &&
          item.middleName !== ''
        ) {
          label += ` ${item.middleName}`;
        }
        label += ` ${item.lastName}`;
        breadcrumbsItems.push({
          label,
          icon: 'pe-7s-user',
          active: true,
          path: '',
        });
        const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
        updateDocumentTitle(documentTitle);
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
      </div>
    );
  }
}

Person.defaultProps = {
  match: null,
};
Person.propTypes = {
  match: PropTypes.object,
};

export default Person;
