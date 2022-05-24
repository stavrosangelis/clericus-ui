import React, { useCallback, useEffect, useState } from 'react';
import L from 'leaflet';
import { Marker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import PropTypes from 'prop-types';

import 'react-leaflet-markercluster/dist/styles.min.css';
import markerIconPath from '../../../assets/leaflet/images/marker-icon.png';

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

function MarkerCluster(props) {
  const { data, openPopup } = props;
  const [markers, setMarkers] = useState([]);
  const map = useMap();

  const renderMarkerIcon = useCallback(
    (item = null) => {
      const { _id = '', label = '', latitude = '', longitude = '' } = item;
      if (latitude !== '' && longitude !== '') {
        const position = [latitude, longitude];
        const marker = (
          <Marker
            key={_id}
            position={position}
            icon={markerIcon}
            draggable={false}
            eventHandlers={{
              click: () => openPopup({ _id, label, position }),
            }}
          />
        );
        return marker;
      }
      return null;
    },
    [openPopup]
  );

  useEffect(() => {
    if (map !== null) {
      const markerIcons = [];
      const { length } = data;
      for (let i = 0; i < length; i += 1) {
        const {
          _id: pId = '',
          label: pLabel = '',
          description: pDescription = '',
          features = [],
          count = 0,
        } = data[i];
        if (features.length > 0) {
          const { ref: addressPoint } = features[0];
          const { latitude: lat = '', longitude: lon = '' } = addressPoint;
          if (lat !== '' && lon !== '') {
            const markerItem = {
              _id: pId,
              label: pLabel,
              description: pDescription,
              count,
              latitude: lat,
              longitude: lon,
            };
            markerIcons.push(renderMarkerIcon(markerItem));
          }
        }
      }
      setMarkers(markerIcons);
    }
  }, [map, data, renderMarkerIcon]);

  return <MarkerClusterGroup showCoverageOnHover>{markers}</MarkerClusterGroup>;
}
export default MarkerCluster;
MarkerCluster.propTypes = {
  data: PropTypes.array.isRequired,
  openPopup: PropTypes.func.isRequired,
};
