import React from 'react';
import {Link} from 'react-router-dom';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';

const Block = props => {
  let propsSpatial = props.spatial;
  let spatialRow = [];
  if (propsSpatial.length>0) {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png')
    });
    let spatialData = propsSpatial.map(eachItem =>{
      let item = eachItem.ref;
      let position = [item.latitude, item.longitude];
      let zoom = 13;
      let url = `/spatial/${item._id}`;
      return <div key={item._id} className="col-xs-12 col-sm-6 col-md-4 spatial-map-container small">
        <h5><Link href={url} to={url}><small><i>{eachItem.term.label}</i></small> {item.label}</Link></h5>
        <Map center={position} zoom={zoom} maxZoom={18}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              {item.label}
            </Popup>
          </Marker>
        </Map>
      </div>
    });
    spatialRow = <div key="spatial">
      <h5>Locations <small>[{propsSpatial.length}]</small>
        <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{props.toggleTable(e,"locations")}}>
          <i className={"fa fa-angle-down"+props.hidden}/>
        </div>
      </h5>
      <div className={props.visible}>
        <div className="row">{spatialData}</div>
      </div>
    </div>;
  }
  return (spatialRow)
}
export default Block;
