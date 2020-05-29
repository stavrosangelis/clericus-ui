import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
//import markerIconPath from '../assets/leaflet/images/marker-icon-2x.png';
import L from 'leaflet';
import {Breadcrumbs} from '../components/breadcrumbs';
//import TagPeopleSearch from '../components/tag-people-search.js';

class Spatial extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: {},
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderSpatialDetails = this.renderSpatialDetails.bind(this);
    this.renderMap = this.renderMap.bind(this);
  }

  load() {
    let _id = this.props.match.params._id;
    if (typeof _id==="undefined" || _id===null || _id==="") {
      return false;
    }
    this.setState({
      loading: true
    })
    let context = this;
    let params = {
      _id: _id,
    };
    let url = process.env.REACT_APP_APIPATH+'spatial';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data;
      let spatialdata = responseData.data;
      context.setState({
        loading: false,
        item: spatialdata
      });
	  })
	  .catch(function (error) {
	  });
  }

  renderSpatialDetails(stateData=null) {
    let item = stateData.item;

    //1. SpatialDetails
    let meta = [];
    let dateOrder = {
      name:  ["streetAddress","locality","region","country","postalCode",
              "latitude","longitude","locationType"],
      label: ["Street Address","Locality","Region","Country","Postal Code",
              "Latitude","Longitude","LocationType"]
    }

    //1.0 SpatialDetails - dateOrder
    for(let i=0;i<dateOrder.name.length;i++) {
      let dataRow = [];
      let dataItem = item[`${dateOrder.name[i]}`];
      if (typeof dataItem!=="undefined" && dataItem!==null && dataItem!=="") {
        dataRow = <tr key={dateOrder.name[i]}><th>{dateOrder.label[i]}</th><td>{dataItem}</td></tr>;
      }
      meta.push(dataRow);
    }

    //1.5 SpatialDetails - SpatialDetails include all elements of the dateOrder
    return <table key={"SpatialDetails"} className="table table-borderless spatial-content-table">
          <tbody>{meta}</tbody>
        </table>
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
              A pretty CSS3 popup. <br/> Easily customizable.
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
    //let metaTable = <Table><tbody>{meta}</tbody></Table>
    let metaTable = this.renderSpatialDetails(stateData);

    //2.3 description
    let noteRow = []
    if(typeof item.note!=="undefined" && item.note!==null && item.note!=="") {
      let noteData = <div className="spatial-note-content" key={"noteData"}>{item.note}</div>;
      noteRow.push(noteData);
    }
    
    //2.4 spatial map
    let map = null;
    if ((item.latitude !== "") && (item.longitude!== "")) {
      map = this.renderMap(stateData);
    }

    let output = <Card>
      <CardBody>
        <div className="item-container">
          <div className="item-title-container">
            <h4 className="item-label">{label}</h4>
          </div>
          <div className="row item-content-container">
            <div className="col-xs-12 col-sm-6 col-md-6">
              <div className="item-content-des">
                {noteRow}
              </div>
              {metaTable}
            </div>
            <div className="col-xs-12 col-sm-6 col-md-6">
              {map}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
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

    if (!this.state.loading) {
      let spatialCard = this.renderItem(this.state);
      content = <div>
        <div className="row">
          <div className="col-12">
            {spatialCard}
          </div>
        </div>
      </div>
    }

    let label = this.state.item.label;
    let breadcrumbsItems = [
      {label: "Spatials", icon: "pe-7s-date", active: false, path: "/spatials"},
      {label: label, active: true, path: ""},
    ];
    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
      </div>
    )

  }
}

export default Spatial;
