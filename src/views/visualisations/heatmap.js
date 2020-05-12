import React, { useEffect, useState, useRef} from 'react';
import {
  Spinner,
  FormGroup, Input
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
  const [center, setCenter] = useState([53.3497645,-6.2602732]);
  const zoom = 8;
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  }

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

  const searchNode = (e) =>{
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInput(value);
    let visibleNodes = data.filter(n=>n.label.toLowerCase().includes(value.toLowerCase()));
    let dataNodes = data;
    for (let i=0;i<dataNodes.length; i++) {
      let n = dataNodes[i];
      if (visibleNodes.indexOf(n)>-1) {
        n.visible = true;
      }
      else n.visible = false;
    }
    setData(dataNodes);
  }

  const clearSearchNode = () => {
    setSearchInput("");
    let dataNodes = data;
    for (let i=0;i<dataNodes.length; i++) {
      let n = dataNodes[i];
      n.visible = true;
    }
    setData(dataNodes);
  }

  const centerNode = (_id) => {
    let node = data.find(n=>n._id===_id);
    if (typeof node!=="undefined") {
      if (node.features!==null) {
        if (typeof node.features.features.geometry!=="undefined") {
          let coords = node.features.features.geometry.coordinates;
          let newAddressPoint = [coords[1], coords[0]];
          setCenter(newAddressPoint)
        }
      }
    }
  }

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

    const searchIcon = <div className="map-search-toggle" onClick={()=>toggleSearchContainerVisible()}>
      <i className="fa fa-search" />
    </div>

    let searchContainerVisibleClass = "";
    if (searchContainerVisible) {
      searchContainerVisibleClass = " visible";
    }
    let searchContainerNodes = [];
    if (!loading && data!==null) {
      for (let i=0;i<data.length; i++) {
        let n = data[i];
        if (n.features!==null) {
          if (typeof n.visible==="undefined" || n.visible===true) {
            searchContainerNodes.push(<div key={i} onClick={()=>centerNode(n._id)}>{n.label} [{n.count}]</div>);
          }
        }
      }
    }
    let searchContainer = <div className={"map-search-container"+searchContainerVisibleClass}>
      <div className="close-map-search-container" onClick={()=>toggleSearchContainerVisible()}>
        <i className="fa fa-times" />
      </div>
      <FormGroup className="map-search-input">
        <Input type="text" name="text" placeholder="Search location..." value={searchInput} onChange={(e)=>searchNode(e)}/>
        <i className="fa fa-times-circle" onClick={()=>clearSearchNode()}/>
      </FormGroup>
      <div className="map-search-container-nodes">
        {searchContainerNodes}
      </div>
    </div>

    content = <div className="map-container">
      {heatmapLegend}
      <Map
        center={center}
        zoom={zoom}
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
        {searchIcon}
      </Map>
      {searchContainer}
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
