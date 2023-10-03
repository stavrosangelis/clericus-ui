import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const Block = (props) => {
  // state
  const [visible, setVisible] = useState(true);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  // props
  const { items } = props;
  const { length } = items;

  let spatialRow = null;
  if (length > 0) {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });
    const spatialData = items.map((item, idx) => {
      const { ref = null, term = null } = item;
      if (ref !== null) {
        const { _id = '', label = '', latitude = '', longitude = '' } = ref;
        const position = [latitude, longitude];
        const zoom = 13;
        const url = `/spatial/${_id}`;
        const { label: tLabel = '' } = term;
        const key = `${idx}-${_id}`;
        return (
          <div key={key} className="col-xs-12 col-sm-6">
            <div className="spatial-map-container small">
              <h5>
                <Link href={url} to={url}>
                  <small>
                    <i>{tLabel}</i>
                  </small>{' '}
                  {label}
                </Link>
              </h5>
              <MapContainer center={position} zoom={zoom} maxZoom={18}>
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                  <Popup>{label}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        );
      }
      return null;
    });

    let visibleClass = '';
    let visibleIcon = '';
    if (!visible) {
      visibleClass = ' item-hidden';
      visibleIcon = ' closed';
    }

    spatialRow = (
      <>
        <h5 className="item-block-heading">
          <span>
            Locations <small>[{length}]</small>
          </span>
          <div
            className="btn btn-default btn-xs pull-icon-middle toggle-info-btn"
            onClick={toggleVisible}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle locations visibility"
          >
            <i className={`fa fa-angle-down${visibleIcon}`} />
          </div>
        </h5>
        <div className={`item-block${visibleClass}`}>
          <div className="row">{spatialData}</div>
        </div>
      </>
    );
  }
  return spatialRow;
};
Block.defaultProps = {
  items: [],
};
Block.propTypes = {
  items: PropTypes.array,
};
export default Block;
