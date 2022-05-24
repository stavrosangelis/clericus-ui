import React, { lazy, Suspense, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Spinner, Card, CardBody } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { updateDocumentTitle, outputDate, renderLoader } from '../helpers';

const { REACT_APP_APIPATH: APIPath } = process.env;
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const EventsBlock = lazy(() => import('../components/item-blocks/Events'));

function Temporal() {
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
        url: `${APIPath}ui-temporal`,
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
    const { events = [], startDate = '', endDate = '' } = item;

    // events
    const eventsRow =
      events.length > 0 ? (
        <Suspense fallback={renderLoader()} key="events">
          <EventsBlock items={events} _id={_id} />
        </Suspense>
      ) : null;

    // dates
    let datesRow = null;
    if (startDate !== '') {
      const endDateOutput =
        endDate !== '' && endDate !== startDate
          ? ` - ${outputDate(endDate, false)}`
          : '';
      datesRow = (
        <div key="datesRow">
          <h5>Dates</h5>
          <div style={{ paddingBottom: '10px' }}>
            <span className="tag-bg tag-item">
              {outputDate(startDate, false)}
              {endDateOutput}
            </span>
          </div>
        </div>
      );
    }

    return (
      <>
        {eventsRow}
        {datesRow}
      </>
    );
  };

  const renderItem = () => {
    const { label = '' } = item;

    // meta
    const metaTable = renderDetails();

    const output = (
      <div className="item-container">
        <h3>{label}</h3>
        <div className="row">
          <div className="col-12">{metaTable}</div>
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
    { label: 'Dates', icon: 'pe-7s-date', active: false, path: '/temporals' },
  ];

  if (!loading && item !== null) {
    const { label = '' } = item;
    const temporalCard = renderItem();

    breadcrumbsItems.push({
      label,
      icon: 'pe-7s-date',
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
              <div className="col-12">{temporalCard}</div>
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

export default Temporal;
