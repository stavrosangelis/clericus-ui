import React, { useCallback, useEffect, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import { Spinner, ListGroup, ListGroupItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { outputDate, renderLoader, updateDocumentTitle } from '../helpers';

import { setPaginationParams } from '../redux/actions';

const { REACT_APP_APIPATH: APIPath } = process.env;
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const Filters = lazy(() => import('../components/Filters'));
const PageActions = lazy(() => import('../components/Page.actions'));

const heading = 'Temporals';
const defaultLimit = 25;
const filterType = ['temporals'];

function Temporals() {
  // redux
  const dispatch = useDispatch();

  const { temporalsPagination, temporalsFilters, temporalsRelationship } =
    useSelector((state) => state);

  const { limit, page, orderField, orderDesc, totalItems, totalPages } =
    temporalsPagination;

  // state
  const [loading, setLoading] = useState(true);
  const [loadComplete, setLoadComplete] = useState(false);
  const [items, setItems] = useState([]);
  const [gotoPage, setGotoPage] = useState(page);

  const updateStorePagination = useCallback(
    ({
      limitParam = null,
      pageParam = null,
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
      dispatch(setPaginationParams('temporals', payload));
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

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      const loadData = async () => {
        const { temporals } = temporalsFilters;
        const params = {
          limit,
          page,
          temporals,
          orderField,
          orderDesc,
        };
        const responseData = await axios({
          method: 'get',
          url: `${APIPath}ui-temporals`,
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
    temporalsFilters,
    totalPages,
    updatePage,
    updateStorePagination,
  ]);

  const handleChange = (e) => {
    const { name, value = '' } = e.target;
    switch (name) {
      case 'gotoPage':
        setGotoPage(value);
        break;
      default:
        break;
    }
  };

  const renderItems = useCallback(() => {
    const { length } = items;
    let outputObj = [];
    const output = [];
    if (length > 0) {
      for (let i = 0; i < length; i += 1) {
        const item = items[i];
        const {
          _id: iId = '',
          label = '',
          startDate = '',
          endDate = '',
        } = item;

        let dateDetails = null;
        let space = '';
        if (startDate !== '') {
          const endDateOutput =
            endDate !== '' && endDate !== startDate
              ? ` - ${outputDate(endDate, false)}`
              : '';
          space = ' ';
          dateDetails = (
            <small>
              [{outputDate(startDate, false)}
              {endDateOutput}]
            </small>
          );
        }
        const link = `/temporal/${iId}`;
        const outputItem = (
          <ListGroupItem key={iId}>
            <Link to={link} href={link}>
              {label}
              {space}
              {dateDetails}
            </Link>
          </ListGroupItem>
        );
        output.push(outputItem);
      }
      outputObj = (
        <div className="events-list">
          <ListGroup>{output}</ListGroup>
        </div>
      );
    }
    return outputObj;
  }, [items]);

  const breadcrumbsItems = [
    {
      label: heading,
      icon: 'pe-7s-date',
      active: true,
      path: '',
    },
  ];

  const pageActions = (
    <Suspense fallback={renderLoader()}>
      <PageActions
        defaultLimit={defaultLimit}
        limit={limit}
        orderField={orderField}
        orderDesc={orderDesc}
        current_page={page}
        gotoPageValue={Number(gotoPage)}
        total_pages={totalPages}
        updatePage={updatePage}
        gotoPage={gotoPageFn}
        handleChange={handleChange}
        updateLimit={updateLimit}
        pageType="temporals"
      />
    </Suspense>
  );

  const temporalsOutput =
    !loading && loadComplete ? (
      renderItems()
    ) : (
      <div style={{ padding: '40pt', textAlign: 'center' }}>
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>
    );

  return (
    <div className="container">
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-xs-12 col-sm-4">
          <Suspense fallback={<h4>Filters</h4>}>
            <Filters
              name="temporals"
              filterType={filterType}
              filtersSet={temporalsFilters}
              relationshipSet={temporalsRelationship}
              updatedata={reload}
            />
          </Suspense>
        </div>
        <div className="col-xs-12 col-sm-8">
          <h2>
            {heading}
            <div className="tool-box">
              <div className="tool-box-text">Total: {totalItems}</div>
            </div>
          </h2>
          {pageActions}
          {temporalsOutput}
          {pageActions}
        </div>
      </div>
    </div>
  );
}
export default Temporals;
