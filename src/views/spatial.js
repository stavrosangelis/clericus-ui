import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import { Label, Spinner, Card, CardBody } from 'reactstrap';
import PropTypes from 'prop-types';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import Breadcrumbs from '../components/breadcrumbs';
import { updateDocumentTitle, renderLoader } from '../helpers';

const EventsBlock = lazy(() => import('../components/item-blocks/events'));
const OrganisationsBlock = lazy(() =>
  import('../components/item-blocks/organisations')
);

class Spatial extends Component {
  static renderMap(stateData = null) {
    const { item } = stateData;
    const position = [item.latitude, item.longitude];
    const zoom = 13;
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });

    const output = (
      <div className="spatial-map-container">
        <Map center={position} zoom={zoom} maxZoom={18}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>{item.label}</Popup>
          </Marker>
        </Map>
      </div>
    );
    return output;
  }

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
    this.renderSpatialDetails = this.renderSpatialDetails.bind(this);
    this.constructor.renderMap = this.constructor.renderMap.bind(this);

    const cancelToken = axios.CancelToken;
    this.cancelSource = cancelToken.source();
  }

  componentDidMount() {
    this.load();
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
    const url = `${process.env.REACT_APP_APIPATH}spatial`;
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

  renderSpatialDetails(stateData = null) {
    const { item } = stateData;
    const {
      descriptionVisible,
      eventsVisible,
      organisationsVisible,
    } = this.state;

    // 1. SpatialDetails
    const meta = [];
    // description
    let descriptionRow = [];
    let descriptionHidden = '';
    let descriptionVisibleClass = '';
    if (!descriptionVisible) {
      descriptionHidden = ' closed';
      descriptionVisibleClass = 'hidden';
    }
    const descriptionContent = [];
    if (
      typeof item.streetAddress !== 'undefined' &&
      item.streetAddress !== ''
    ) {
      descriptionContent.push(
        <div key="streetAddress">
          <Label>Street address: </Label> {item.streetAddress}
        </div>
      );
    }
    if (typeof item.locality !== 'undefined' && item.locality !== '') {
      descriptionContent.push(
        <div key="locality">
          <Label>Locality: </Label> {item.locality}
        </div>
      );
    }
    if (typeof item.region !== 'undefined' && item.region !== '') {
      descriptionContent.push(
        <div key="region">
          <Label>Region: </Label> {item.region}
        </div>
      );
    }
    if (typeof item.postalCode !== 'undefined' && item.postalCode !== '') {
      descriptionContent.push(
        <div key="postalCode">
          <Label>Postal Code: </Label> {item.postalCode}
        </div>
      );
    }
    if (typeof item.country !== 'undefined' && item.country !== '') {
      descriptionContent.push(
        <div key="country">
          <Label>Country: </Label> {item.country}
        </div>
      );
    }
    if (typeof item.locationType !== 'undefined' && item.locationType !== '') {
      descriptionContent.push(
        <div key="locationType">
          <Label>Type: </Label> {item.locationType}
        </div>
      );
    }
    if (typeof item.latitude !== 'undefined' && item.latitude !== '') {
      descriptionContent.push(
        <div key="coordinates">
          <Label>lat: </Label> {item.latitude}, <Label>lng: </Label>{' '}
          {item.longitude}
        </div>
      );
    }
    descriptionRow = (
      <div key="description">
        <h5>
          Details
          <div
            className="btn btn-default btn-xs pull-right toggle-info-btn"
            onClick={(e) => {
              this.toggleTable(e, 'description');
            }}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle description table"
          >
            <i className={`fa fa-angle-down${descriptionHidden}`} />
          </div>
        </h5>
        <div className={descriptionVisibleClass}>{descriptionContent}</div>
      </div>
    );

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

    meta.push(descriptionRow);
    meta.push(organisationsRow);
    meta.push(eventsRow);
    return meta;
  }

  renderItem(stateData = null) {
    const { item } = stateData;

    // 1.1 Spatial label
    const { label } = item;

    // 2.1 meta
    const metaTable = this.renderSpatialDetails(stateData);

    // 2.2 spatial map
    let map = null;
    if (item.latitude !== '' && item.longitude !== '') {
      map = this.constructor.renderMap(stateData);
    }

    const output = (
      <div className="item-container">
        <h3>{label}</h3>
        <div className="row item-info-container">
          <div className="col-xs-12 col-sm-6 col-md-6">
            <div className="item-details-container">{metaTable}</div>
          </div>
          <div className="col-xs-12 col-sm-6 col-md-6">{map}</div>
        </div>
      </div>
    );
    return output;
  }

  render() {
    const { loading, item, error } = this.state;
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
        label: 'Locations',
        icon: 'pe-7s-map',
        active: false,
        path: '/spatials',
      },
    ];
    if (!loading) {
      if (item !== null) {
        const spatialCard = this.renderItem(this.state);

        content = (
          <div>
            <Card>
              <CardBody>
                <div className="row">
                  <div className="col-12">{spatialCard}</div>
                </div>
              </CardBody>
            </Card>
          </div>
        );
        label = item.label;
        breadcrumbsItems.push({
          label,
          icon: 'pe-7s-map',
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

Spatial.defaultProps = {
  match: null,
};
Spatial.propTypes = {
  match: PropTypes.object,
};

export default Spatial;
