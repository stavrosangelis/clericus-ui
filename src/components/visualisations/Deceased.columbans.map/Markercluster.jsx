import React from 'react';
import L from 'leaflet';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import PropTypes from 'prop-types';
import PopupContent from './Popup.content';
import markerIconPath from '../../../assets/leaflet/images/marker-icon.png';
import markerIconPath2 from '../../../assets/leaflet/images/marker-icon-2x.png';
import markerIconShadowPath from '../../../assets/leaflet/images/marker-shadow.png';
import '../../../assets/leaflet/css/MarkerCluster.css';

const markerIcon = new L.Icon({
  iconUrl: markerIconPath,
  iconRetinaUrl: markerIconPath2,
  iconSize: new L.Point(25, 41),
  iconAnchor: [15, 16],
  popupAnchor: [5, -14],
  shadowUrl: markerIconShadowPath,
  shadowSize: new L.Point(41, 41),
  shadowAnchor: [11, 16],
  className: 'leaflet-default-icon-path custom-marker',
});

const isUpperCase = (str) => /^[A-Z]*$/.test(str);

const addSpacesToStr = (string = '') => {
  if (typeof string !== 'string') {
    return '';
  }
  let output = '';
  const stringArr = string.split('');
  const { length } = stringArr;
  for (let i = 0; i < length; i += 1) {
    const chunk = stringArr[i];
    if (i > 0 && isUpperCase(chunk)) {
      output += ` ${chunk}`;
    } else {
      output += chunk;
    }
  }
  return output;
};

const locationTooltip = (location = null, organisations = []) => {
  let output = [];
  if (location !== null) {
    const { label = '', region = '', country = '' } = location;
    let outputLabel = label;
    if (region !== '') {
      if (outputLabel !== '') {
        outputLabel += ', ';
      }
      outputLabel += region;
    }
    if (country !== '') {
      if (outputLabel !== '') {
        outputLabel += ', ';
      }
      outputLabel += country;
    }
    if (outputLabel !== '') {
      output.push(
        <div key="label">
          <b>{outputLabel}</b>
        </div>
      );
    }
  }

  if (organisations.length > 0) {
    const organisationsOutput = organisations.map((o) => {
      const { ref = null } = o;
      if (ref !== null) {
        const { _id = '', label = '', organisationType = '' } = ref;
        let oLabel = '';
        if (label !== '') {
          oLabel = label;
          if (organisationType !== '') {
            oLabel += ` [${addSpacesToStr(organisationType)}]`;
          }
        }
        if (oLabel !== '') {
          return <div key={_id}>{oLabel}</div>;
        }
      }
      return null;
    });
    if (organisationsOutput.length > 0) {
      output = [...output, ...organisationsOutput];
    }
  }
  return output;
};

function MarkerCluster(props) {
  const { data } = props;

  const renderMarkerIcon = (item = null) => {
    if (item !== null) {
      const {
        _id = '',
        latitude = '',
        longitude = '',
        location = null,
        organisations = [],
      } = item;
      if (latitude !== '' && longitude !== '') {
        const position = [latitude, longitude];
        const { ref: lRef = null } = location;
        const title = locationTooltip(lRef, organisations);
        return (
          <Marker
            key={_id}
            position={position}
            icon={markerIcon}
            draggable={false}
          >
            <Tooltip>{title}</Tooltip>
            <Popup>
              <PopupContent _id={_id} />
            </Popup>
          </Marker>
        );
      }
    }
    return null;
  };

  const markers = [];
  const { length } = data;
  for (let i = 0; i < length; i += 1) {
    const {
      _id: pId = '',
      label: pLabel = '',
      description: pDescription = '',
      spatial = [],
      count = 0,
      organisations = [],
    } = data[i];

    if (spatial.length > 0) {
      const [location] = spatial;
      const { ref: addressPoint } = location;
      const { latitude: lat = '', longitude: lon = '' } = addressPoint;
      if (lat !== '' && lon !== '') {
        const markerItem = {
          _id: pId,
          label: pLabel,
          description: pDescription,
          count,
          latitude: lat,
          longitude: lon,
          location,
          organisations,
        };
        markers.push(renderMarkerIcon(markerItem));
      }
    }
  }

  return (
    <MarkerClusterGroup showCoverageOnHover maxClusterRadius={4}>
      {markers}
    </MarkerClusterGroup>
  );
}
export default MarkerCluster;
MarkerCluster.propTypes = {
  data: PropTypes.array.isRequired,
};
