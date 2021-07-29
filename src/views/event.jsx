import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import { Label, Spinner, Card, CardBody } from 'reactstrap';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { updateDocumentTitle, outputDate, renderLoader } from '../helpers';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
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
const SpatialBlock = lazy(() => import('../components/item-blocks/spatial'));

class Event extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: null,
      descriptionVisible: true,
      eventsVisible: true,
      peopleVisible: true,
      classpiecesVisible: true,
      resourcesVisible: true,
      organisationsVisible: true,
      datesVisible: true,
      locationsVisible: true,
      error: {
        visible: false,
        text: '',
      },
    };

    this.load = this.load.bind(this);
    this.toggleTable = this.toggleTable.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderEventDetails = this.renderEventDetails.bind(this);

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
    const url = `${process.env.REACT_APP_APIPATH}ui-event`;
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

  renderEventDetails(stateData = null) {
    const { item } = stateData;
    const {
      descriptionVisible,
      classpiecesVisible,
      resourcesVisible,
      eventsVisible,
      organisationsVisible,
      datesVisible,
      locationsVisible,
    } = this.state;

    // 1. OrganisationDetails
    const meta = [];

    // description
    let descriptionRow = [];
    let descriptionHidden = '';
    if (!descriptionVisible) {
      descriptionHidden = ' closed';
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
            visible={descriptionVisible}
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
    const peopleRow = (
      <Suspense fallback={renderLoader()} key="people">
        <PeopleBlock name="event" peopleItem={item.people} />
      </Suspense>
    );

    let datesRow = [];
    let datesHidden = '';
    let datesVisibleClass = '';
    if (!datesVisible) {
      datesHidden = ' closed';
      datesVisibleClass = 'hidden';
    }
    if (
      typeof item.temporal !== 'undefined' &&
      item.temporal !== null &&
      item.temporal.length > 0
    ) {
      const temporalData = item.temporal.map((eachItem) => {
        const temp = eachItem.ref;
        const tempLabel = [<span key="label">{temp.label}</span>];
        let tLabel = '';
        if (typeof temp.startDate !== 'undefined' && temp.startDate !== '') {
          tLabel = outputDate(temp.startDate);
        }
        if (
          typeof temp.endDate !== 'undefined' &&
          temp.endDate !== '' &&
          temp.endDate !== temp.startDate
        ) {
          tLabel += ` - ${outputDate(temp.endDate)}`;
        }
        tempLabel.push(<span key="dates">[{tLabel}]</span>);
        const url = `/temporal/${temp._id}`;
        return (
          <li key={temp._id}>
            <Link className="tag-bg tag-item" href={url} to={url}>
              {tempLabel}
            </Link>
          </li>
        );
      });
      datesRow = (
        <div key="dates">
          <h5>
            Dates <small>[{item.temporal.length}]</small>
            <div
              className="btn btn-default btn-xs pull-right toggle-info-btn"
              onClick={(e) => {
                this.toggleTable(e, 'dates');
              }}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="toggle dates table"
            >
              <i className={`fa fa-angle-down${datesHidden}`} />
            </div>
          </h5>
          <div className={datesVisibleClass}>
            <ul className="tag-list">{temporalData}</ul>
          </div>
        </div>
      );
    }

    let locationsRow = [];
    let locationsHidden = '';
    let locationsVisibleClass = '';
    if (!locationsVisible) {
      locationsHidden = ' closed';
      locationsVisibleClass = 'hidden';
    }
    if (
      typeof item.spatial !== 'undefined' &&
      item.spatial !== null &&
      item.spatial.length > 0
    ) {
      locationsRow = (
        <Suspense fallback={renderLoader()} key="spatial">
          <SpatialBlock
            toggleTable={this.toggleTable}
            hidden={locationsHidden}
            visible={locationsVisibleClass}
            spatial={item.spatial}
          />
        </Suspense>
      );
    }

    meta.push(descriptionRow);
    meta.push(peopleRow);
    meta.push(organisationsRow);
    meta.push(classpiecesRow);
    meta.push(resourcesRow);
    meta.push(eventsRow);
    meta.push(datesRow);
    meta.push(locationsRow);

    return meta;
  }

  renderItem(stateData = null) {
    const { item } = stateData;

    // 1.1 Event label
    const { label } = item;
    const eventType =
      item.eventType.inverseLabel !== '' ? (
        <small>[{item.eventType.inverseLabel}]</small>
      ) : (
        []
      );
    // 2.1 meta
    const metaTable = this.renderEventDetails(stateData);

    // 2.2 thumbnailImage
    let thumbnailImage = [];
    let thumbnailColClass = 'col-0';
    let contentColClass = 'col-12';
    const thumbnailURL = null;
    if (thumbnailURL !== null) {
      thumbnailImage = (
        <div
          key="thumbnailImage"
          className="show-classpiece"
          onClick={() => this.toggleViewer()}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle classpiece viewer"
        >
          <img
            src={thumbnailURL}
            className="people-thumbnail img-fluid img-thumbnail"
            alt={label}
          />
        </div>
      );
      thumbnailColClass = 'col-xs-12 col-sm-6 col-md-5';
      contentColClass = 'col-xs-12 col-sm-6 col-md-7';
    }

    const output = (
      <div className="item-container">
        <h3>
          {label} {eventType}
        </h3>

        <div className="row item-info-container">
          <div className={thumbnailColClass}>{thumbnailImage}</div>
          <div className={contentColClass}>
            <div className="item-details-container">{metaTable}</div>
          </div>
        </div>
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
      { label: 'Events', icon: 'pe-7s-date', active: false, path: '/events' },
    ];
    if (!loading) {
      if (item !== null) {
        const eventCard = this.renderItem(this.state);

        const networkGraphLinkURL = `/event-graph/${match.params._id}`;
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

        label = item.label;
        breadcrumbsItems.push({
          label,
          icon: 'pe-7s-date',
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
        <Suspense fallback={[]}>
          <Breadcrumbs items={breadcrumbsItems} />
        </Suspense>
        {content}
      </div>
    );
  }
}

Event.defaultProps = {
  match: null,
};
Event.propTypes = {
  match: PropTypes.object,
};

export default Event;
