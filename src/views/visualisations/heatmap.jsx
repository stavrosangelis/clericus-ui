import React, { useCallback, useEffect, useState, lazy, Suspense } from 'react';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import HeatmapLayer from '../../components/visualisations/Heatmap/HeatmapLayer';
import HeatmapSearch from '../../components/visualisations/Heatmap/HeatmapSearch';
import HeatmapCenter from '../../components/visualisations/Heatmap/HeatmapCenter';
import HeatmapPopup from '../../components/visualisations/Heatmap/HeatmapPopup';
import MarkerCluster from '../../components/visualisations/Heatmap/Markercluster';
import '../../assets/leaflet/leaflet.css';
import { updateDocumentTitle } from '../../helpers';
import '../../scss/heatmap.scss';

const Breadcrumbs = lazy(() => import('../../components/Breadcrumbs'));
const HelpArticle = lazy(() => import('../../components/Help.article'));
const PeopleBlock = lazy(() => import('../../components/item-blocks/People'));

const APIPath = process.env.REACT_APP_APIPATH;

const zoom = 8;
const heading = 'Heatmap';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-map', active: true, path: '' },
];
function Heatmap() {
  // state
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [center, setCenter] = useState([53.3497645, -6.2602732]);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState(null);
  const [popupContent, setPopupContent] = useState(null);

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  };

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();

    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}heatmap`,
        crossDomain: true,
        signal: controller.signal,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (!unmounted) {
        setLoading(false);
        const { data: rData = null } = responseData;
        if (rData !== null) {
          setData(rData);
        }
      }
    };
    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading]);

  const loadOrganisation = useCallback(async (_id) => {
    const organisationData = await axios({
      method: 'get',
      url: `${APIPath}ui-organisation`,
      crossDomain: true,
      params: { _id },
    })
      .then((response) => response.data)
      .catch((error) => console.log(error));
    return organisationData;
  }, []);

  const openPopup = async ({ _id = '', label = '', position }) => {
    if (_id !== '') {
      setPopupContent(
        <>
          <h4>{label}</h4>
          <div className="text-center">
            <Spinner color="info" size="sm" /> <i>loading...</i>
          </div>
        </>
      );
      setPopupPosition(position);
      const organisationData = await loadOrganisation(_id);
      if (organisationData.status) {
        const { data: item = null } = organisationData;
        if (item !== null) {
          const { description = '', organisationType = '', people = [] } = item;
          const itemType = <small>[{organisationType}]</small>;
          const itemDescription =
            description !== '' ? <p key="description">{description}</p> : null;
          const itemPeople =
            people.length > 0 ? (
              <div className="popup-people">
                <Suspense fallback={null}>
                  <PeopleBlock items={people} />
                </Suspense>
              </div>
            ) : null;
          setPopupContent(
            <>
              <h4>
                {label} {itemType}
              </h4>
              <div>
                {itemDescription}
                {itemPeople}
              </div>
            </>
          );
        }
      }
    }
  };

  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
  };

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
      0.4: '#1f296b',
      0.2: '#4b58a8',
      0.1: '#6f7dd6',
    };

    const addressPoints = [];
    const { length } = data;
    for (let i = 0; i < length; i += 1) {
      const { features = [], count = 0 } = data[i];
      if (features.length > 0) {
        const { ref: addressPoint } = features[0];
        const { latitude: lat = '', longitude: lon = '' } = addressPoint;
        if (lat !== '' && lon !== '') {
          const newAddressPoint = [lat, lon, count];
          addressPoints.push(newAddressPoint);
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
    content = (
      <div className="map-container heatmap-container">
        {heatmapLegend}
        <MapContainer
          center={center}
          zoom={zoom}
          maxZoom={18}
          zoomControl={false}
        >
          <HeatmapPopup content={popupContent} position={popupPosition} />
          <MarkerCluster data={data} openPopup={openPopup} />
          <HeatmapLayer points={addressPoints} gradient={gradient} />
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="topright" />
          {searchIcon}
          {helpIcon}
          <HeatmapCenter center={center} />
        </MapContainer>
        <HeatmapSearch
          data={data}
          setCenter={setCenter}
          toggle={toggleSearchContainerVisible}
          visible={searchContainerVisible}
          openPopup={openPopup}
        />

        <Suspense fallback={null}>
          <HelpArticle
            permalink="heatmap-help"
            visible={helpVisible}
            toggle={toggleHelp}
          />
        </Suspense>
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
}

export default Heatmap;
