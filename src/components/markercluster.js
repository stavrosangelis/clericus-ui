import { MapLayer, withLeaflet } from 'react-leaflet';
import L from 'leaflet';

require('leaflet.markercluster');

class MarkerClusterGroup extends MapLayer {
  createLeafletElement({ children, leaflet: { map }, ...props }) {
    const clusterProps = {};
    const clusterEvents = {};

    // Splitting props and events to different objects
    Object.entries(props).forEach(([propName, prop]) => {
      if (propName.startsWith('on')) {
        clusterEvents[propName] = prop;
      } else {
        clusterProps[propName] = prop;
      }
    });

    // Creating markerClusterGroup Leaflet element
    const markerClusterGroup = new L.MarkerClusterGroup(clusterProps);
    this.contextValue = { layerContainer: markerClusterGroup, map };

    // Initializing event listeners
    Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
      const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`;
      markerClusterGroup.on(clusterEvent, callback);
    });

    return markerClusterGroup;
  }
}

export default withLeaflet(MarkerClusterGroup);
