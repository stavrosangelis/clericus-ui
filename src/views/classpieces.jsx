import React, { useCallback, useEffect, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import {
  Label,
  Spinner,
  Card,
  CardBody,
  CardImg,
  CardText,
  Collapse,
  Tooltip,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getResourceThumbnailURL, updateDocumentTitle } from '../helpers';
import defaultThumbnail from '../assets/images/classpiece-default-thumbnail.jpg';
import { setPaginationParams, setRelationshipParams } from '../redux/actions';

import '../scss/classpieces.scss';

const { REACT_APP_APIPATH: APIPath } = process.env;
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const HelpArticle = lazy(() => import('../components/Help.article'));
const Filters = lazy(() => import('../components/Filters'));
const SearchForm = lazy(() => import('../components/Search.form'));
const PageActions = lazy(() => import('../components/Page.actions'));

const heading = 'Classpieces';
const defaultLimit = 24;

const searchElements = [
  {
    element: 'label',
    label: 'Label',
    inputType: 'text',
    inputData: null,
  },
  {
    element: 'description',
    label: 'Description',
    inputType: 'text',
    inputData: null,
  },
];
const filterType = ['events', 'temporals'];

function Classpieces() {
  // redux
  const dispatch = useDispatch();
  const {
    classpiecesPagination,
    classpiecesFilters: filters,
    classpiecesRelationship,
  } = useSelector((state) => state);
  const { limit, page, simpleSearchTerm, totalItems, totalPages } =
    classpiecesPagination;

  // state
  const [loading, setLoading] = useState(true);
  const [loadComplete, setLoadComplete] = useState(false);
  const [items, setItems] = useState([]);
  const [gotoPage, setGotoPage] = useState(page);
  const [searchVisible, setSearchVisible] = useState(true);
  const [helpVisible, setHelpVisible] = useState(false);

  const renderItem = (item = null, i = 0) => {
    if (item !== null) {
      const { _id, label } = item;
      const parseUrl = `/classpiece/${_id}`;
      let thumbnailImage = <img src={defaultThumbnail} alt={label} />;
      const thumbnailPath = getResourceThumbnailURL(item);
      if (thumbnailPath !== null) {
        const thumbStyle = { backgroundImage: `url("${thumbnailPath}")` };
        thumbnailImage = (
          <Link
            to={parseUrl}
            href={parseUrl}
            className="classpieces-list-thumbnail"
          >
            <div className="classpiece-thumbnail" style={thumbStyle} />
            <CardImg src={defaultThumbnail} alt={label} />
          </Link>
        );
      }

      const itemOutput = (
        <div
          key={i}
          className="col-12 col-sm-6 col-md-3"
          onContextMenu={(e) => {
            e.preventDefault();
            return false;
          }}
        >
          <Card style={{ marginBottom: '15px' }}>
            {thumbnailImage}
            <CardBody>
              <CardText className="text-center">
                <Label>
                  <Link to={parseUrl} href={parseUrl}>
                    {label}
                  </Link>
                </Label>
              </CardText>
            </CardBody>
          </Card>
        </div>
      );
      return itemOutput;
    }
    return null;
  };

  const updateStorePagination = useCallback(
    ({
      limitParam = null,
      pageParam = null,
      simpleSearchTermParam = null,
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
      if (totalItemsParam !== null) {
        payload.totalItems = totalItemsParam;
      }
      if (totalPagesParam !== null) {
        payload.totalPages = totalPagesParam;
      }
      dispatch(setPaginationParams('classpieces', payload));
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
      const { events, organisations, temporals } = filters;
      const params = {
        page,
        limit,
        events,
        organisations,
        temporals,
      };
      if (simpleSearchTerm !== '') {
        params.label = simpleSearchTerm;
      }
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}classpieces`,
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
      const activeFiltersResponseData = await axios({
        method: 'get',
        url: `${APIPath}classpieces-active-filters`,
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
      if (!unmounted) {
        setLoading(false);
        setItems([]);
        updateDocumentTitle(heading);
        setLoadComplete(true);
        const { data = null } = responseData;
        if (data !== null) {
          const {
            currentPage = 0,
            data: classpieces = [],
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
            setItems(classpieces);
            const { data: activeFiltersData = null } =
              activeFiltersResponseData;
            if (activeFiltersData !== null) {
              const { events: afdEvents, organisations: afdOrganisations } =
                activeFiltersData;
              const payload = {
                events: afdEvents,
                organisations: afdOrganisations,
              };
              dispatch(setRelationshipParams('classpieces', payload));
            }
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
    filters,
    limit,
    loading,
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

  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
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

  const breadcrumbsItems = [
    {
      label: 'Classpieces',
      icon: 'pe-7s-photo',
      active: true,
      path: '',
    },
  ];

  const pageActions = (
    <Suspense fallback={null}>
      <PageActions
        defaultLimit={defaultLimit}
        limit={limit}
        sort={false}
        current_page={page}
        gotoPageValue={Number(gotoPage)}
        total_pages={totalPages}
        updatePage={updatePage}
        gotoPage={gotoPageFn}
        handleChange={handleChange}
        updateLimit={updateLimit}
        pageType="classpieces"
      />
    </Suspense>
  );

  let classpieces =
    !loading && loadComplete ? (
      items.map((item, idx) => renderItem(item, idx))
    ) : (
      <div style={{ padding: '40pt', textAlign: 'center' }}>
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>
    );

  if (
    !loading &&
    loadComplete &&
    simpleSearchTerm !== '' &&
    items.length === 0
  ) {
    const queryText =
      simpleSearchTerm !== '' ? <b>&quot;{simpleSearchTerm}&quot;</b> : '';
    classpieces = (
      <div key="no-results" className="col-12">
        <Card style={{ marginBottom: '15px' }}>
          <CardBody>
            <h5>No results found</h5>
            <p>There are no classpieces matching your query {queryText}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="container">
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-xs-12 col-sm-4">
          <Suspense fallback={<h4>Filters</h4>}>
            <Filters
              name="classpieces"
              filterType={filterType}
              filtersSet={filters}
              relationshipSet={classpiecesRelationship}
              updatedata={reload}
            />
          </Suspense>
        </div>
        <div className="col-xs-12 col-sm-8">
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
                onClick={() => toggleHelp()}
                title="Help"
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle help"
              >
                <i className="fa fa-question-circle" />
              </div>
            </div>
          </h2>
          {searchBox}
          {pageActions}
          <div className="row">{classpieces}</div>
          {pageActions}
        </div>
      </div>

      <Suspense fallback={null}>
        <HelpArticle
          permalink="classpieces-help"
          visible={helpVisible}
          toggle={toggleHelp}
        />
      </Suspense>
    </div>
  );
}

export default Classpieces;
