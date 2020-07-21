import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';

import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import {Breadcrumbs} from '../components/breadcrumbs';
import {updateDocumentTitle,renderLoader} from '../helpers';
const EventsBlock = lazy(() => import('../components/item-blocks/events'));
const OrganisationsBlock = lazy(() => import('../components/item-blocks/organisations'));

class Spatial extends Component {
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
        text: ""
      }
    }

    this.load = this.load.bind(this);
    this.toggleTable = this.toggleTable.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderSpatialDetails = this.renderSpatialDetails.bind(this);
    this.renderMap = this.renderMap.bind(this);
  }

  async load() {
    let _id = this.props.match.params._id;
    if (typeof _id==="undefined" || _id===null || _id==="") {
      return false;
    }
    this.setState({
      loading: true
    });
    let params = {
      _id: _id,
    };
    let url = process.env.REACT_APP_APIPATH+'spatial';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
      console.log(error)
	  });
    if (responseData.status) {
      this.setState({
        loading: false,
        item: responseData.data
      });
    }
    else {
      this.setState({
        loading: false,
        error: {
          visible: true,
          text: responseData.msg
        }
      });
    }
  }

  toggleTable(e, dataType=null) {
    let payload = {
      [dataType+"Visible"]:!this.state[dataType+"Visible"]
    }
    this.setState(payload);
  }

  renderSpatialDetails(stateData=null) {
    let item = stateData.item;

    //1. SpatialDetails
    let meta = [];
    // description
    let descriptionRow = [];
    let descriptionHidden = "";
    let descriptionVisibleClass = "";
    if(!this.state.descriptionVisible){
      descriptionHidden = " closed";
      descriptionVisibleClass = "hidden";
    }
    let descriptionContent = [];
    if (typeof item.streetAddress!=="undefined" && item.streetAddress!=="") {
      descriptionContent.push(<div key="streetAddress"><label>Street address: </label> {item.streetAddress}</div>);
    }
    if (typeof item.locality!=="undefined" && item.locality!=="") {
      descriptionContent.push(<div key="locality"><label>Locality: </label> {item.locality}</div>);
    }
    if (typeof item.region!=="undefined" && item.region!=="") {
      descriptionContent.push(<div key="region"><label>Region: </label> {item.region}</div>);
    }
    if (typeof item.postalCode!=="undefined" && item.postalCode!=="") {
      descriptionContent.push(<div key="postalCode"><label>Postal Code: </label> {item.postalCode}</div>);
    }
    if (typeof item.country!=="undefined" && item.country!=="") {
      descriptionContent.push(<div key="country"><label>Country: </label> {item.country}</div>);
    }
    if (typeof item.locationType!=="undefined" && item.locationType!=="") {
      descriptionContent.push(<div key="locationType"><label>Type: </label> {item.locationType}</div>);
    }
    if (typeof item.latitude!=="undefined" && item.latitude!=="") {
      descriptionContent.push(<div key="coordinates">
      <label>lat: </label> {item.latitude}, <label>lng: </label> {item.longitude}</div>);
    }
    descriptionRow = <div key="description">
      <h5>Details
        <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"description")}}>
          <i className={"fa fa-angle-down"+descriptionHidden}/>
        </div>
      </h5>
      <div className={descriptionVisibleClass}>{descriptionContent}</div>
    </div>

    // events
    let eventsRow = [];
    let eventsHidden = "";
    let eventsVisibleClass = "";
    if(!this.state.eventsVisible){
      eventsHidden = " closed";
      eventsVisibleClass = "hidden";
    }
    if (typeof item.events!=="undefined" && item.events!==null && item.events!=="") {
      eventsRow = <Suspense fallback={renderLoader()} key="events">
        <EventsBlock toggleTable={this.toggleTable} hidden={eventsHidden} visible={eventsVisibleClass} events={item.events} />
      </Suspense>
    }

    // organisations
    let organisationsRow = [];
    let organisationsHidden = "";
    let organisationsVisibleClass = "";
    if(!this.state.organisationsVisible){
      organisationsHidden = " closed";
      organisationsVisibleClass = "hidden";
    }
    if (typeof item.organisations!=="undefined" && item.organisations!==null && item.organisations!=="") {
      organisationsRow = <Suspense fallback={renderLoader()} key="organisations">
        <OrganisationsBlock toggleTable={this.toggleTable} hidden={organisationsHidden} visible={organisationsVisibleClass} organisations={item.organisations} />
      </Suspense>
    }

    meta.push(descriptionRow);
    meta.push(organisationsRow);
    meta.push(eventsRow);
    return meta;
  }

  renderMap(stateData=null) {
    let item = stateData.item;
    let position = [item.latitude, item.longitude];
    let zoom = 13;
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png')
    });

    let output = <div className="spatial-map-container">
        <Map center={position} zoom={zoom} maxZoom={18}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              {item.label}
            </Popup>
          </Marker>
        </Map>
      </div>
    return output;
  }

  renderItem(stateData=null) {
    let item = stateData.item;

    //1.1 Spatial label
    let label = item.label;

    //2.1 meta
    let metaTable = this.renderSpatialDetails(stateData);

    //2.2 spatial map
    let map = null;
    if ((item.latitude !== "") && (item.longitude!== "")) {
      map = this.renderMap(stateData);
    }

    let output = <div className="item-container">
      <h3>{label}</h3>
      <div className="row item-info-container">
        <div className="col-xs-12 col-sm-6 col-md-6">
          <div className="item-details-container">
            {metaTable}
          </div>
        </div>
        <div className="col-xs-12 col-sm-6 col-md-6">
          {map}
        </div>
      </div>
    </div>
    return output;
  }

  componentDidMount() {
    this.load();
  }

  render() {
    let content = <div>
      <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>

    let label = "";
    let breadcrumbsItems = [{label: "Locations", icon: "pe-7s-map", active: false, path: "/spatials"}];
    if (!this.state.loading) {
      if (this.state.item!==null) {
        let spatialCard = this.renderItem(this.state);

        content = <div>
          <Card>
            <CardBody>
              <div className="row">
                <div className="col-12">
                  {spatialCard}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        label = this.state.item.label;
        breadcrumbsItems.push({label: label, icon: "pe-7s-map",active: true, path: ""});
        let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
        updateDocumentTitle(documentTitle);
      }
      else if (this.state.error.visible){
        breadcrumbsItems.push({label: this.state.error.text, icon: "fa fa-times", active: true, path: ""});
        let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
        updateDocumentTitle(documentTitle);
        content = <div>
          <Card>
            <CardBody>
              <div className="row">
                <div className="col-12">
                  <h3>Error</h3>
                  <p>{this.state.error.text}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      }
    }

    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
      </div>
    )

  }
}

export default Spatial;
