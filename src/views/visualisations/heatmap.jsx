import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { Spinner, FormGroup, Input } from 'reactstrap';
import axios from 'axios';
import { Map, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import HeatmapLayer from 'react-leaflet-heatmap-layer';
import L from 'leaflet';
import '../../assets/leaflet/css/MarkerCluster.css';
import '../../assets/leaflet/leaflet.css';
import markerIconPath from '../../assets/leaflet/images/marker-icon.png';
import MarkerClusterGroup from '../../components/markercluster';
import { updateDocumentTitle, renderLoader } from '../../helpers';
import HelpArticle from '../../components/help-article';
import LazyList from '../../components/lazylist';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));
const PeopleBlock = lazy(() => import('../../components/item-blocks/people'));

const APIPath = process.env.REACT_APP_APIPATH;

const Heatmap = () => {
  // state
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [listData, setListData] = useState([]);
  const [center, setCenter] = useState([53.3497645, -6.2602732]);
  const zoom = 8;
  const mapRef = useRef(null);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [helpVisible, setHelpVisible] = useState(false);
  const [popupDetails, setPopupDetails] = useState(null);

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  };

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}heatmap`,
        crossDomain: true,
        cancelToken: source.token,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined') {
        setData(responseData.data);
        setListData(responseData.data);
        setLoading(false);
      }
    };
    if (loading) {
      load();
    }
    return () => {
      source.cancel('api request cancelled');
    };
  }, [loading]);

  const searchNode = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInput(value);
    const visibleNodes = data.filter((n) =>
      n.label.toLowerCase().includes(value.toLowerCase())
    );
    setListData(visibleNodes);
  };

  const clearSearchNode = () => {
    setSearchInput('');
    setListData(data);
  };

  const itemDetails = async (_id, position, label) => {
    const loader = (
      <div className="text-center">
        <Spinner color="info" size="sm" /> <i>loading...</i>
      </div>
    );
    const newPopupDetails = {
      position,
      label,
      type: [],
      content: loader,
    };
    setPopupDetails(newPopupDetails);
    const organisation = await axios({
      method: 'get',
      url: `${APIPath}ui-organisation`,
      crossDomain: true,
      params: { _id },
    })
      .then((response) => response.data)
      .catch((error) => console.log(error));
    if (organisation.status) {
      const item = organisation.data;
      const type = <small>[{item.organisationType}]</small>;
      let description = [];
      if (item.description !== '') {
        description = <p key="description">{item.description}</p>;
      }
      let people = [];
      if (typeof item.people !== 'undefined' && item.people.length > 0) {
        people = (
          <div className="popup-people">
            <Suspense fallback={renderLoader()}>
              <PeopleBlock
                key="people"
                name="people"
                peopleItem={item.people}
              />
            </Suspense>
          </div>
        );
      }
      const popupContent = (
        <div>
          {description}
          {people}
        </div>
      );
      const newPopupDetails2 = {
        position,
        label,
        type,
        content: popupContent,
      };
      setPopupDetails(newPopupDetails2);
    }
  };

  const centerNode = (_id) => {
    const node = data.find((n) => n._id === _id);
    if (typeof node !== 'undefined') {
      if (node.features.length > 0) {
        const addressPoint = node.features[0].ref;
        if (typeof addressPoint.latitude !== 'undefined') {
          const newAddressPoint = [
            addressPoint.latitude,
            addressPoint.longitude,
          ];
          setCenter(newAddressPoint);
          itemDetails(_id, newAddressPoint, node.label);
        }
      }
    }
  };

  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
  };

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
    if (item.latitude !== '' && item.longitude !== '') {
      position = [item.latitude, item.longitude];
    }
    if (position !== null) {
      const marker = (
        <Marker
          key={item._id}
          position={position}
          icon={markerIcon}
          draggable={false}
          onClick={() => itemDetails(item._id, position, item.label)}
        />
      );
      return marker;
    }
    return null;
  };

  const heading = 'Heatmap';
  const breadcrumbsItems = [
    { label: heading, icon: 'pe-7s-map', active: true, path: '' },
  ];
  updateDocumentTitle(heading);
  let content = (
    <div className="row">
      <div className="col-12">
        <div style={{ padding: '40pt', textAlign: 'center' }}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  );
  if (!loading) {
    const gradient = {
      '1.0': '#DE9A96',
      0.8: '#F5D98B',
      0.6: '#FAF3A5',
      0.4: '#82CEB6',
      0.2: '#96E3E6',
      0.1: '#89BDE0',
    };

    const addressPoints = [];
    const markerIcons = [];
    for (let i = 0; i < data.length; i += 1) {
      const point = data[i];
      if (point.features.length > 0) {
        const addressPoint = point.features[0].ref;
        if (typeof addressPoint.latitude !== 'undefined') {
          const lat = addressPoint.latitude;
          const lon = addressPoint.longitude;
          const { count } = point;
          const newAddressPoint = [lat, lon, count];
          addressPoints.push(newAddressPoint);
          const markerItem = {
            _id: point._id,
            label: point.label,
            description: point.description,
            count,
            latitude: lat,
            longitude: lon,
          };
          markerIcons.push(renderMarkerIcon(markerItem));
        }
      }
    }
    const heatmapLegendList = [];
    Object.keys(gradient).forEach((key) => {
      const value = gradient[key];
      heatmapLegendList.push(
        <li key={key}>
          <div
            className="heatmap-legend-color"
            style={{ backgroundColor: value }}
          />
          {key}
        </li>
      );
    });
    const heatmapLegend = (
      <div className="heatmap-legend">
        <ul>{heatmapLegendList}</ul>
      </div>
    );

    const searchIcon = (
      <div
        className="map-search-toggle"
        onClick={() => toggleSearchContainerVisible()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle search"
      >
        <i className="fa fa-search" />
      </div>
    );

    const helpIcon = (
      <div
        className="map-help-toggle"
        onClick={() => toggleHelp()}
        title="Help"
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle help"
      >
        <i className="fa fa-question-circle" />
      </div>
    );

    let searchContainerVisibleClass = '';
    if (searchContainerVisible) {
      searchContainerVisibleClass = ' visible';
    }
    let searchContainerNodes = [];
    if (
      !loading &&
      data !== null &&
      typeof data.length !== 'undefined' &&
      data.length > 0
    ) {
      searchContainerNodes = listData;
    }
    const renderSearchLItem = (item = null, i = 0) => {
      if (item === null || item.features === null) {
        return [];
      }
      if (typeof item.visible === 'undefined' || item.visible === true) {
        return (
          <div
            key={i}
            onClick={() => centerNode(item._id)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="center to node"
          >
            {item.label}{' '}
            <small>
              ({item.count}) [{item.organisationType}]
            </small>
          </div>
        );
      }
      return [];
    };

    const searchContainer = (
      <div className={`map-search-container${searchContainerVisibleClass}`}>
        <div
          className="close-map-search-container"
          onClick={() => toggleSearchContainerVisible()}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle search container"
        >
          <i className="fa fa-times" />
        </div>
        <FormGroup className="map-search-input">
          <Input
            type="text"
            name="text"
            placeholder="Search location..."
            value={searchInput}
            onChange={(e) => searchNode(e)}
          />
          <i
            className="fa fa-times-circle"
            onClick={() => clearSearchNode()}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="clear search node"
          />
        </FormGroup>
        <LazyList
          limit={30}
          range={15}
          items={searchContainerNodes}
          containerClass="map-search-container-nodes"
          renderItem={renderSearchLItem}
        />
      </div>
    );

    let markerPopup = [];
    if (popupDetails !== null) {
      markerPopup = (
        <Popup
          position={popupDetails.position}
          onClose={() => setPopupDetails(null)}
        >
          <h4>
            {popupDetails.label} {popupDetails.type}
          </h4>
          {popupDetails.content}
        </Popup>
      );
    }
    content = (
      <div className="map-container heatmap-container">
        {heatmapLegend}
        <Map
          center={center}
          zoom={zoom}
          maxZoom={18}
          zoomControl={false}
          ref={mapRef}
        >
          {markerPopup}
          <MarkerClusterGroup>{markerIcons}</MarkerClusterGroup>
          <HeatmapLayer
            fitBoundsOnLoad={false}
            fitBoundsOnUpdate={false}
            points={addressPoints}
            longitudeExtractor={(m) => m[1]}
            latitudeExtractor={(m) => m[0]}
            gradient={gradient}
            intensityExtractor={(m) => parseFloat(m[2])}
            radius={20}
            blur={6}
            max={1}
          />
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="topright" />
          {searchIcon}
          {helpIcon}
        </Map>
        {searchContainer}
        <HelpArticle
          permalink="heatmap-help"
          visible={helpVisible}
          toggle={toggleHelp}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      {content}
    </div>
  );
};

export default Heatmap;
