import React, { useCallback, useEffect, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import {
  Spinner,
  ListGroup,
  ListGroupItem,
  Collapse,
  Card,
  CardBody,
  Tooltip,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import { updateDocumentTitle, renderLoader } from '../helpers';
import { setPaginationParams } from '../redux/actions';

const { REACT_APP_APIPATH: APIPath } = process.env;
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const SearchForm = lazy(() => import('../components/Search.form'));

const heading = 'Locations';
const defaultLimit = 25;

const searchElements = [
  {
    element: 'label',
    label: 'Label',
    inputType: 'text',
    inputData: null,
  },
];

function Spatials() {
  // redux
  const dispatch = useDispatch();

  const { spatialsPagination } = useSelector((state) => state);

  const {
    limit,
    page,
    simpleSearchTerm,
    orderField,
    orderDesc,
    totalItems,
    totalPages,
  } = spatialsPagination;

  // state
  const [loading, setLoading] = useState(true);
  const [loadComplete, setLoadComplete] = useState(false);
  const [items, setItems] = useState([]);
  const [gotoPage, setGotoPage] = useState(page);
  const [searchVisible, setSearchVisible] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);

  const updateStorePagination = useCallback(
    ({
      limitParam = null,
      pageParam = null,
      simpleSearchTermParam = null,
      orderFieldParam = null,
      orderDescParam = null,
      totalItemsParam = null,
      totalPagesParam = null,
    }) => {
      const payload = {};
      if (limitParam !== null) {
        payload.limit = limitParam;
      }
      if (pageParam !== null) {
        payload.page = pageParam;
      }
      if (simpleSearchTermParam !== null) {
        payload.simpleSearchTerm = simpleSearchTermParam;
      }
      if (orderFieldParam !== null) {
        payload.orderField = orderFieldParam;
      }
      if (orderDescParam !== null) {
        payload.orderDesc = orderDescParam;
      }
      if (totalItemsParam !== null) {
        payload.totalItems = totalItemsParam;
      }
      if (totalPagesParam !== null) {
        payload.totalPages = totalPagesParam;
      }
      dispatch(setPaginationParams('spatials', payload));
    },
    [dispatch]
  );

  const reload = (e = null) => {
    if (e !== null) {
      e.preventDefault();
    }
    setLoading(true);
  };

  const updatePage = useCallback(
    (value) => {
      if (value > 0 && value !== page) {
        updateStorePagination({ pageParam: value });
        reload();
      }
    },
    [page, updateStorePagination]
  );

  const gotoPageFn = (e) => {
    e.preventDefault();
    if (gotoPage > 0 && gotoPage !== page) {
      updateStorePagination({ pageParam: gotoPage });
      reload();
    }
  };

  const updateLimit = (limitParam) => {
    updateStorePagination({ limitParam });
    reload();
  };

  const updateSort = (orderFieldParam) => {
    const orderDescParam = orderField === orderFieldParam ? !orderDesc : false;
    updateStorePagination({ orderFieldParam, orderDescParam });
    reload();
  };

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      const loadData = async () => {
        const params = {
          limit,
          page,
          orderField,
          orderDesc,
        };
        if (simpleSearchTerm !== '' && simpleSearchTerm.length > 1) {
          params.label = simpleSearchTerm;
        }
        const responseData = await axios({
          method: 'get',
          url: `${APIPath}spatials`,
          crossDomain: true,
          params,
          signal: controller.signal,
        })
          .then((response) => {
            const { data: rData = null } = response;
            return rData;
          })
          .catch((error) => {
            console.log(error);
            return { data: null };
          });
        const { data = null } = responseData;
        return data;
      };
      const data = await loadData();
      if (!unmounted) {
        setLoading(false);
        setItems([]);
        updateDocumentTitle(heading);
        setLoadComplete(true);
        if (data !== null) {
          const {
            currentPage = 0,
            data: events = [],
            totalItems: totalItemsResp,
            totalPages: totalPagesResp,
          } = data;
          const cPage = currentPage > 0 ? currentPage : 1;
          if (cPage !== 1 && cPage > totalPages && totalPages > 0) {
            updatePage(totalPages);
          } else {
            updateStorePagination({
              totalItemsParam: totalItemsResp,
              totalPagesParam: totalPagesResp,
            });
            setItems(events);
          }
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
  }, [
    dispatch,
    limit,
    loading,
    orderDesc,
    orderField,
    page,
    simpleSearchTerm,
    totalPages,
    updatePage,
    updateStorePagination,
  ]);

  const clearSearch = () => {
    if (simpleSearchTerm !== '') {
      updateStorePagination({ simpleSearchTermParam: '', pageParam: 1 });
      reload();
    }
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  const toggleMap = () => {
    setMapVisible(!mapVisible);
  };

  const handleChange = (e) => {
    const { name, value = '' } = e.target;
    switch (name) {
      case 'gotoPage':
        setGotoPage(value);
        break;
      case 'simpleSearchTerm':
        updateStorePagination({ simpleSearchTermParam: value });
        break;
      default:
        break;
    }
  };

  const renderMap = () => {
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });

    const linkHref = '/spatial/';
    const visibleClass = mapVisible ? ' active' : '';
    const output = (
      <div className={`spatial-map-container spatials-list-map${visibleClass}`}>
        <MapContainer center={[53.38129, -6.59185]} zoom={9} maxZoom={18}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {items.map((element) => {
            const {
              _id = '',
              label = '',
              latitude = '',
              longitude = '',
            } = element;
            if (_id !== '' && latitude !== '' && longitude !== '') {
              const ref = `${linkHref}${_id}`;
              return (
                <Marker key={_id} position={[latitude, longitude]}>
                  <Popup>
                    <Link to={ref}>{label}</Link>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>
    );
    return output;
  };

  const renderItems = useCallback(() => {
    const { length } = items;
    let outputObj = [];
    const output = [];
    if (length > 0) {
      for (let i = 0; i < length; i += 1) {
        const item = items[i];
        const { _id: iId = '', label = '' } = item;

        const link = `/spatial/${iId}`;
        const outputItem = (
          <ListGroupItem key={i}>
            <Link to={link} href={link}>
              {label}
            </Link>
          </ListGroupItem>
        );
        output.push(outputItem);
      }
      outputObj = (
        <div className="resources-list">
          <ListGroup>{output}</ListGroup>
        </div>
      );
    } else if (simpleSearchTerm !== '' && simpleSearchTerm.length > 1) {
      const queryText = <b>&quot;{simpleSearchTerm}&quot;</b>;
      const item = (
        <div key="no-results" className="col-12">
          <Card style={{ marginBottom: '15px' }}>
            <CardBody>
              <h5>No results found</h5>
              <p>There are no locations matching your query {queryText}</p>
            </CardBody>
          </Card>
        </div>
      );
      outputObj.push(item);
    }
    return outputObj;
  }, [items, simpleSearchTerm]);

  const breadcrumbsItems = [
    {
      label: heading,
      icon: 'pe-7s-map',
      active: true,
      path: '',
    },
  ];

  const pageActions = (
    <Suspense fallback={renderLoader()}>
      <PageActions
        defaultLimit={defaultLimit}
        limit={limit}
        sort
        orderField={orderField}
        orderDesc={orderDesc}
        current_page={page}
        gotoPageValue={Number(gotoPage)}
        total_pages={totalPages}
        updatePage={updatePage}
        gotoPage={gotoPageFn}
        handleChange={handleChange}
        updateLimit={updateLimit}
        updateSort={updateSort}
        pageType="spatials"
      />
    </Suspense>
  );

  const searchBox = (
    <Collapse isOpen={searchVisible} style={{ paddingBottom: '15px' }}>
      <Suspense fallback={null}>
        <SearchForm
          searchElements={searchElements}
          simpleSearchTerm={simpleSearchTerm}
          simpleSearch={reload}
          clearSearch={clearSearch}
          handleChange={handleChange}
          adadvancedSearchEnable={false}
        />
      </Suspense>
    </Collapse>
  );

  const spatialsOutput =
    !loading && loadComplete ? (
      renderItems()
    ) : (
      <div style={{ padding: '40pt', textAlign: 'center' }}>
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>
    );

  const mapOutput = !loading && loadComplete ? renderMap() : null;

  return (
    <div className="container">
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-12">
          <h2>
            {heading}
            <Tooltip placement="top" target="search-tooltip">
              Search
            </Tooltip>
            <div className="tool-box">
              <div className="tool-box-text">Total: {totalItems}</div>
              <div
                className="action-trigger"
                onClick={() => toggleSearch()}
                id="search-tooltip"
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle search"
              >
                <i className="fa fa-search" />
              </div>
              <div
                className="action-trigger"
                onClick={() => toggleMap()}
                title="Help"
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle help"
              >
                <i className="fa fa-map" />
              </div>
            </div>
          </h2>
          {searchBox}
          {mapOutput}
          {pageActions}
          {spatialsOutput}
          {pageActions}
        </div>
      </div>
    </div>
  );
}
export default Spatials;
