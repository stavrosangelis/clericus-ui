import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { useMap } from 'react-leaflet';
import PropTypes from 'prop-types';

function HeatmapLayer(props) {
  const { points, gradient } = props;
  const map = useMap();

  useEffect(() => {
    if (map !== null) {
      if (gradient === null) {
        L.heatLayer(points).addTo(map);
      } else {
        L.heatLayer(points, { gradient }).addTo(map);
      }
    }
  }, [gradient, map, points]);

  return <div />;
}
export default HeatmapLayer;
HeatmapLayer.defaultProps = {
  gradient: null,
};
HeatmapLayer.propTypes = {
  points: PropTypes.array.isRequired,
  gradient: PropTypes.object,
};
