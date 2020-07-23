import React, { useEffect, useState, useRef, lazy, Suspense} from 'react';
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
import {updateDocumentTitle,renderLoader} from '../../helpers';
import HelpArticle from '../../components/help-article';
const PeopleBlock = lazy(() => import('../../components/item-blocks/people'));

const APIPath = process.env.REACT_APP_APIPATH;

const Heatmap = props => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [center, setCenter] = useState([53.3497645,-6.2602732]);
  const zoom = 8;
  const mapRef = useRef(null);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [helpVisible, setHelpVisible] = useState(false);
  const [popupDetails, setPopupDetails] = useState(null);

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
      if (node.features.length>0) {
        let addressPoint = node.features[0].ref;
        if (typeof addressPoint.latitude!=="undefined") {
          let newAddressPoint = [addressPoint.latitude, addressPoint.longitude];
          setCenter(newAddressPoint);
          itemDetails(_id, newAddressPoint, node.label);
        }
      }
    }
  }

  const itemDetails = async(_id, position, label) => {
    let loader = <div className="text-center">
        <Spinner color="info" size="sm"/> <i>loading...</i>
      </div>
    let newPopupDetails = {
      position: position,
      label: label,
      type: [],
      content: loader
    };
    setPopupDetails(newPopupDetails);
    let organisation = await axios({
      method: 'get',
      url: APIPath+'ui-organisation',
      crossDomain: true,
      params: {_id: _id}
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error)
    });
    if (organisation.status) {
      let item = organisation.data;
      let type = <small>[{item.organisationType}]</small>;
      let description = [];
      if (item.description!=="") {
        description = <p key="description">{item.description}</p>
      }
      let people = [];
      if(typeof item.people!=="undefined" && item.people.length>0) {
        people = <div className="popup-people">
          <Suspense fallback={renderLoader()}>
            <PeopleBlock key="people" name="people" peopleItem={item.people} />
          </Suspense>
        </div>
      }
      let popupContent = <div>
        {description}
        {people}
      </div>
      let newPopupDetails = {
        position: position,
        label: label,
        type: type,
        content: popupContent
      }
      setPopupDetails(newPopupDetails);
    }
  }

  const toggleHelp = () => {
    setHelpVisible(!helpVisible)
  }


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
      let marker = <Marker
        key={item._id}
        position={position}
        icon={markerIcon}
        draggable={false}
        onClick={()=>itemDetails(item._id, position, item.label)}
        >
        </Marker>;
      return marker;
    }
    else return null;
  }

  let heading = "Heatmap";
  let breadcrumbsItems = [
    {label: heading, icon: "pe-7s-map", active: true, path: ""}
  ];
  updateDocumentTitle(heading);
  let content = <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  if (!loading) {
    const gradient = {'1.0':'#DE9A96',0.8:'#F5D98B',0.6:'#FAF3A5',0.4:'#82CEB6',0.2:'#96E3E6',0.1:'#89BDE0'};

    let addressPoints = [];
    let markerIcons = [];
    for (let i=0;i<data.length; i++) {
      let point = data[i];
      if (point.features.length>0) {
        let addressPoint = point.features[0].ref;
        if (typeof addressPoint.latitude!=="undefined") {
          let lat=addressPoint.latitude,lon=addressPoint.longitude,count=point.count;
          let newAddressPoint = [lat, lon, count];
          addressPoints.push(newAddressPoint);
          let markerItem = {
            _id: point._id,
            label: point.label,
            description: point.description,
            count: count,
            latitude: lat,
            longitude: lon
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

    const helpIcon = <div className="map-help-toggle" onClick={()=>toggleHelp()} title="Help">
      <i className="fa fa-question-circle" />
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
            searchContainerNodes.push(<div key={i} onClick={()=>centerNode(n._id)}>{n.label} <small>({n.count}) [{n.organisationType}]</small></div>);
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

    let markerPopup = [];
    if (popupDetails!==null) {
      markerPopup = <Popup position={popupDetails.position} onClose={()=>setPopupDetails(null)}>
        <h4>{popupDetails.label} {popupDetails.type}</h4>
        {popupDetails.content}
      </Popup>
    }
    content = <div className="map-container heatmap-container">
      {heatmapLegend}
      <Map
        center={center}
        zoom={zoom}
        maxZoom={18}
        ref={mapRef}>
        {markerPopup}
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
        {helpIcon}
      </Map>
      {searchContainer}
      <HelpArticle permalink={"heatmap-help"} visible={helpVisible} toggle={toggleHelp}/>
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
