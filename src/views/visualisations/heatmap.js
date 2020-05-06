import React, { useEffect, useState, useRef, useReducer} from 'react';
import {
  Spinner,
} from 'reactstrap';
import axios from 'axios';
import {Breadcrumbs} from '../../components/breadcrumbs';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import HeatmapLayer from 'react-leaflet-heatmap-layer';
import '../../assets/leaflet/css/MarkerCluster.css';
import '../../assets/leaflet/leaflet.css';
import markerIconPath from '../../assets/leaflet/images/marker-icon.png';
import MarkerClusterGroup from '../../components/markercluster';
import L from 'leaflet';

const APIPath = process.env.REACT_APP_APIPATH;

const Heatmap = props => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const defaultMapState = {
    lat: 53.3497645,
    lng: -6.2602732,
    zoom: 8,
  }
  const [mapState, setMapState] = useReducer(
    (state, newState) => (
    {...state, ...newState}
  ),defaultMapState);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'heatmap',
        crossDomain: true,
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      setData(responseData.data);
    }
    if (loading) {
      load();
    }
  },[loading]);

  let heading = "Heatmap";
  let breadcrumbsItems = [
    {label: heading, icon: "pe-7s-map", active: true, path: ""}
  ];
  let content = <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  if (!loading) {
    const position = [mapState.lat, mapState.lng];
    const gradient = {'1.0':'#DE9A96',0.8:'#F5D98B',0.6:'#FAF3A5',0.4:'#82CEB6',0.2:'#96E3E6',0.1:'#89BDE0'};

    const markerIcon = new L.Icon({
      iconUrl: markerIconPath,
      iconRetinaUrl: markerIconPath,
      iconAnchor: null,
      popupAnchor: [0, -20],
      shadowUrl: null,
      shadowSize: null,
      shadowAnchor: null,
      iconSize: new L.Point(27, 43),
      className: 'leaflet-default-icon-path custom-marker',
    });

    const renderMarkerIcon = (item) => {
      let position = null;
      if (item.latitude!=="" && item.longitude!=="") {
        position = [item.latitude, item.longitude];
      }
      if (position!==null) {
        let description = [];
        if (item.description!=="") {
          description = <p>{item.description}</p>
        }
        return <Marker
          key={item._id}
          position={position}
          icon={markerIcon}
          draggable={false}
          ref={markerRef}
          //onClick={()=>showMarkerDetails(item)}
          >
          <Popup>
            <h4>{item.label}</h4>
            <b>Count</b>: {item.count}
            {description}
          </Popup>
        </Marker>;
      }
      else return null;
    }


    let addressPoints = [];
    let markerIcons = [];
    for (let i=0;i<data.length; i++) {
      let addressPoint = data[i];
      if (addressPoint.features!==null) {
        if (typeof addressPoint.features.features.geometry!=="undefined") {
          let coords = addressPoint.features.features.geometry.coordinates;
          let newAddressPoint = [coords[1], coords[0], addressPoint.count];
          addressPoints.push(newAddressPoint);
          let markerItem = {
            _id: addressPoint._id,
            label: addressPoint.label,
            description: addressPoint.description,
            count: addressPoint.count,
            latitude: coords[1],
            longitude: coords[0]
          }
          markerIcons.push(renderMarkerIcon(markerItem));
        }
      }
    }
    let heatmapLegendList = [];
    for (let key in gradient) {
      heatmapLegendList.push(<li key={key}><div className="heatmap-legend-color" style={{backgroundColor: gradient[key]}}></div>{key}</li>);
    };
    let heatmapLegend = <div className="heatmap-legend">
      <ul>{heatmapLegendList}</ul>
    </div>
    content = <div className="map-container">
      {heatmapLegend}
      <Map
          center={position}
          zoom={mapState.zoom}
          maxZoom={18}
          ref={mapRef}>
          <MarkerClusterGroup>
            {markerIcons}
          </MarkerClusterGroup>
          <HeatmapLayer
              fitBoundsOnLoad={false}
              fitBoundsOnUpdate={false}
              points={addressPoints}
              longitudeExtractor={m => m[1]}
              latitudeExtractor={m => m[0]}
              gradient={gradient}
              intensityExtractor={m => parseFloat(m[2])}
              radius={20}
              blur={6}
              max={1}
            />
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </Map>
    </div>
  }

  return (
    <div className="container">
      <Breadcrumbs items={breadcrumbsItems} />
      {content}
    </div>
  )
}

export default Heatmap;
