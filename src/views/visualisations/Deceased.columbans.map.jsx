import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Input, Spinner } from 'reactstrap';
import axios from 'axios';
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  ZoomControl,
} from 'react-leaflet';
import Search from '../../components/visualisations/Deceased.columbans.map/Search';
import MapClick from '../../components/visualisations/Deceased.columbans.map/Map.click';
import HeatmapCenter from '../../components/visualisations/Heatmap/HeatmapCenter';
import MarkerCluster from '../../components/visualisations/Deceased.columbans.map/Markercluster';
import '../../assets/leaflet/leaflet.css';
import { updateDocumentTitle } from '../../helpers';
import '../../scss/deceased.columbans.map.scss';

const Breadcrumbs = lazy(() => import('../../components/Breadcrumbs'));
const HelpArticle = lazy(() => import('../../components/Help.article'));

const { REACT_APP_APIPATH: APIPath } = process.env;

const zoom = 7;
const heading = 'Deceased Columbans 1918-2020 ';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-map', active: true, path: '' },
];

export default function DeceasedColumbansMap() {
  // state
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [center, setCenter] = useState([
    54.710837138501034, -6.008129242386593,
  ]);
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [srVisible, setSrVisible] = useState(false);
  const [srLocation, setSrLocation] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedMap, setSelectedMap] = useState('Death');

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
    if (searchContainerVisible) {
      setSrVisible(false);
      setSrLocation([]);
    }
  };

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();

    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}deceased-columbans-map`,
        crossDomain: true,
        signal: controller.signal,
        params: { labelId: selectedMap },
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
  }, [loading, selectedMap]);

  const updateSearchResult = (visible = false, location = []) => {
    setSrVisible(visible);
    setSrLocation(location);
  };

  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setSelectedMap(value);
    setLoading(true);
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

  useEffect(() => {
    const exitFS = () => {
      setFullscreen(!fullscreen);
    };
    document.addEventListener('fullscreenchange', exitFS);
    document.addEventListener('webkitfullscreenchange', exitFS);
    document.addEventListener('mozfullscreenchange', exitFS);
    document.addEventListener('MSFullscreenChange', exitFS);
    return () => {
      document.removeEventListener('fullscreenchange', exitFS);
      document.removeEventListener('webkitfullscreenchange', exitFS);
      document.removeEventListener('mozfullscreenchange', exitFS);
      document.removeEventListener('MSFullscreenChange', exitFS);
    };
  }, [fullscreen]);

  if (!loading) {
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

    const selectMapInput = (
      <div className="map-select-source">
        <Input
          type="select"
          name="select-map"
          onChange={(e) => handleChange(e)}
          value={selectedMap}
        >
          <option value="Death">Death events</option>
          <option value="Birth">Birth events</option>
        </Input>
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

    const fullscreenSymbol = !fullscreen ? 'pe-7s-expand1' : 'fa-compress';

    const fullscreenIcon = (
      <div
        className="map-fullscreen-toggle"
        onClick={() => toggleFullScreen()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle search"
      >
        <i className={`fa ${fullscreenSymbol}`} />
      </div>
    );

    const fullscreenClass = fullscreen ? ' fullscreen' : '';

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

    const searchResult =
      srVisible && setSrLocation.length > 0 ? (
        <CircleMarker
          center={srLocation}
          radius={50}
          pathOptions={{ color: 'red' }}
        />
      ) : null;

    content = (
      <div className={`map-container mim-container${fullscreenClass}`}>
        <MapContainer
          center={center}
          zoom={zoom}
          maxZoom={18}
          zoomControl={false}
        >
          {searchResult}
          {searchIcon}
          {fullscreenIcon}
          {helpIcon}
          {selectMapInput}
          <MarkerCluster data={data} />
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="topright" />
          <HeatmapCenter center={center} />
          <MapClick
            toggle={toggleSearchContainerVisible}
            visible={searchContainerVisible}
          />
        </MapContainer>
        <Search
          data={data}
          setCenter={setCenter}
          toggle={toggleSearchContainerVisible}
          visible={searchContainerVisible}
          updateSearchResult={updateSearchResult}
        />

        <Suspense fallback={null}>
          <HelpArticle
            permalink="deceased-columbans-map-help"
            visible={helpVisible}
            toggle={toggleHelp}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="container">
      <Suspense fallback={null}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      {content}
    </div>
  );
}
