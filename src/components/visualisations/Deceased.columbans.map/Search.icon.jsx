import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLeafletContext } from '@react-leaflet/core';
import L from 'leaflet';

export default function SearchIcon(props) {
  const { toggle } = props;
  const context = useLeafletContext();

  useEffect(() => {
    const container = context.layerContainer || context.map;
    const iconParent = L.DomUtil.create('div', 'map-search-toggle');
    iconParent.addEventListener('click', () => {
      toggle();
    });
    iconParent.innerHTML = "<i class='fa fa-search'></i>";
    iconParent.addTo(container);
    /* return () => {
      container.removeLayer(iconParent);
    }; */
  });
  return null;
}

SearchIcon.propTypes = {
  toggle: PropTypes.func.isRequired,
};
