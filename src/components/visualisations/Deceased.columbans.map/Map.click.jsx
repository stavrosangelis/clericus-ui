import { useMapEvent } from 'react-leaflet';
import PropTypes from 'prop-types';

export default function MapClick(props) {
  const { toggle, visible } = props;
  // eslint-disable-next-line no-unused-vars
  const map = useMapEvent('click', () => {
    if (visible) {
      toggle();
    }
  });
  return null;
}
MapClick.propTypes = {
  toggle: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};
