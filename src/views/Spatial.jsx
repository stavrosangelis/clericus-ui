import React, { lazy, Suspense, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Spinner, Card, CardBody } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import { updateDocumentTitle, renderLoader } from '../helpers';

const { REACT_APP_APIPATH: APIPath } = process.env;
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const SpatialDetailsBlock = lazy(() =>
  import('../components/item-blocks/SpatialDetails')
);
const EventsBlock = lazy(() => import('../components/item-blocks/Events'));
const OrganisationsBlock = lazy(() =>
  import('../components/item-blocks/Organisations')
);

function Spatial() {
  const { _id } = useParams();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);

  const prevId = useRef(null);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      prevId.current = _id;
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}spatial`,
        crossDomain: true,
        params: { _id },
        signal: controller.signal,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (!unmounted) {
        setLoading(false);
        const { data = null } = responseData;
        if (data !== null) {
          setItem(data);
        }
      }
    };
    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading, _id]);

  useEffect(() => {
    if (!loading && prevId.current !== _id) {
      prevId.current = _id;
      setLoading(true);
      setItem(null);
    }
  }, [_id, loading]);

  const renderDetails = () => {
    const { events = [], organisations = [] } = item;

    // details
    const detailsRow = (
      <Suspense fallback={renderLoader()} key="details">
        <SpatialDetailsBlock item={item} />
      </Suspense>
    );

    // events
    const eventsRow =
      events.length > 0 ? (
        <Suspense fallback={renderLoader()} key="events">
          <EventsBlock items={events} _id={_id} />
        </Suspense>
      ) : null;

    // organisations
    const organisationsRow =
      organisations.length > 0 ? (
        <Suspense fallback={renderLoader()} key="organisations">
          <OrganisationsBlock items={organisations} />
        </Suspense>
      ) : null;

    return (
      <>
        {detailsRow}
        {eventsRow}
        {organisationsRow}
      </>
    );
  };

  const renderMap = () => {
    const { label = '', latitude = '', longitude = '' } = item;
    const position = [latitude, longitude];
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });

    return (
      <div className="spatial-map-container">
        <MapContainer center={position} zoom={13} maxZoom={18}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>{label}</Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  };

  const renderItem = () => {
    const { label = '', latitude = '', longitude = '' } = item;
    const itemDetails = renderDetails();
    const map = latitude !== '' && longitude !== '' ? renderMap() : null;

    const output = (
      <div>
        <h3>{label}</h3>
        <div className="row">
          <div className="col-xs-12 col-sm-6 col-md-6">{itemDetails}</div>
          <div className="col-xs-12 col-sm-6 col-md-6">{map}</div>
        </div>
      </div>
    );
    return output;
  };

  let content = (
    <div>
      <div className="row">
        <div className="col-12">
          <div style={{ padding: '40pt', textAlign: 'center' }}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>
  );

  const breadcrumbsItems = [
    {
      label: 'Locations',
      icon: 'pe-7s-map',
      active: false,
      path: '/spatials',
    },
  ];

  if (!loading && item !== null) {
    const { label = '' } = item;
    const spatialCard = renderItem();

    breadcrumbsItems.push({
      label,
      icon: 'pe-7s-map',
      active: true,
      path: '',
    });
    const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
    updateDocumentTitle(documentTitle);
    content = (
      <div>
        <Card>
          <CardBody>
            <div className="row">
              <div className="col-12">{spatialCard}</div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      {content}
    </div>
  );
}

export default Spatial;
