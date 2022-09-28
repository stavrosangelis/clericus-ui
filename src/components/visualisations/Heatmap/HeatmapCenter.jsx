import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import PropTypes from 'prop-types';

function HeatmapCenter(props) {
  const { center } = props;
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

HeatmapCenter.propTypes = {
  center: PropTypes.array.isRequired,
};
export default HeatmapCenter;
