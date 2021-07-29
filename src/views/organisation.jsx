import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import { Label, Spinner, Card, CardBody } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  updateDocumentTitle,
  renderLoader,
  jsonStringToObject,
} from '../helpers';

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

class Organisation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: null,
      appellationsVisible: true,
      descriptionVisible: true,
      eventsVisible: true,
      peopleVisible: true,
      classpiecesVisible: true,
      resourcesVisible: true,
      organisationsVisible: true,
      locationsVisible: true,
      error: {
        visible: false,
        text: '',
      },
    };

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderOrganisationDetails = this.renderOrganisationDetails.bind(this);
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
    const url = `${process.env.REACT_APP_APIPATH}ui-organisation`;
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

  renderOrganisationDetails(stateData = null) {
    const { item } = stateData;
    const {
      appellationsVisible,
      descriptionVisible,
      classpiecesVisible,
      resourcesVisible,
      eventsVisible,
      organisationsVisible,
      locationsVisible,
    } = this.state;

    // 1. OrganisationDetails
    const meta = [];

    // alternate appelation
    let appellationsRow = [];
    const appellationsHidden = !appellationsVisible ? ' closed' : '';
    const appellationsVisibleClass = !appellationsVisible ? 'hidden' : '';
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
        if (obj.label !== '') {
          label = obj.label;
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

    // 1.3 OrganisationDetails - people
    const peopleRow = (
      <Suspense fallback={renderLoader()} key="people">
        <PeopleBlock name="organisation" peopleItem={item.people} />
      </Suspense>
    );

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

    meta.push(appellationsRow);
    meta.push(descriptionRow);
    meta.push(locationsRow);
    meta.push(eventsRow);
    meta.push(peopleRow);
    meta.push(organisationsRow);
    meta.push(classpiecesRow);
    meta.push(resourcesRow);

    return meta;
  }

  renderItem(stateData = null) {
    const { item } = stateData;

    // 1.1 Organisation label
    const label = `${item.label} [${item.organisationType}]`;

    // 2.1 meta
    // let metaTable = <Table><tbody>{meta}</tbody></Table>
    const metaTable = this.renderOrganisationDetails(stateData);

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
          aria-label="toggle image viewer"
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
      <div>
        <h3>{label}</h3>
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
      {
        label: 'Organisations',
        icon: 'pe-7s-culture',
        active: false,
        path: '/organisations',
      },
    ];
    if (!loading) {
      if (item !== null) {
        const organisationCard = this.renderItem(this.state);

        let timelineLink = [];
        if (item.events.length > 0) {
          const timelinkURL = `/item-timeline/organisation/${match.params._id}`;
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
        const networkGraphLinkURL = `/organisation-graph/${match.params._id}`;
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
                  <div className="col-12">{organisationCard}</div>
                </div>
                <div className="row">
                  {timelineLink}
                  {networkGraphLink}
                </div>
              </CardBody>
            </Card>
          </div>
        );

        label = item.label;
        breadcrumbsItems.push({
          label,
          icon: 'pe-7s-culture',
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

Organisation.defaultProps = {
  match: null,
};
Organisation.propTypes = {
  match: PropTypes.object,
};

export default Organisation;
