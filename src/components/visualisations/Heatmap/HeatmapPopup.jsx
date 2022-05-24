import React from 'react';
import { Popup } from 'react-leaflet';
import PropTypes from 'prop-types';

function HeatmapPopup(props) {
  const { content, position } = props;

  const popup =
    position !== null && position.length > 0 ? (
      <Popup position={position}>{content}</Popup>
    ) : null;
  return popup;
}
HeatmapPopup.defaultProps = {
  content: null,
  open: false,
  position: [],
};
HeatmapPopup.propTypes = {
  content: PropTypes.object,
  open: PropTypes.bool,
  position: PropTypes.array,
};
export default HeatmapPopup;
