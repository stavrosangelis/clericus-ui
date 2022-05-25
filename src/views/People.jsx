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
import {
  getItemThumbnailsURL,
  updateDocumentTitle,
  renderLoader,
} from '../helpers';
import defaultThumbnail from '../assets/images/spcc.jpg';
import icpThumbnail from '../assets/images/icp-logo.jpg';

import {
  setPaginationParams,
  setRelationshipParams,
  updateFilters,
} from '../redux/actions';

const { REACT_APP_APIPATH: APIPath } = process.env;
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const HelpArticle = lazy(() => import('../components/Help.article'));
const Filters = lazy(() => import('../components/Filters'));
const SearchForm = lazy(() => import('../components/Search.form'));
const PageActions = lazy(() => import('../components/Page.actions'));

const heading = 'People';
const defaultLimit = 25;
const searchElements = [
  {
    element: 'honorificPrefix',
    label: 'Honorific prefix',
    inputType: 'text',
    inputData: null,
  },
  {
    element: 'firstName',
    label: 'First name',
    inputType: 'text',
    inputData: null,
  },
  {
    element: 'lastName',
    label: 'Last name',
    inputType: 'text',
    inputData: null,
  },
  {
    element: 'fnameSoundex',
    label: 'First name sounds like',
    inputType: 'text',
    inputData: null,
  },
  {
    element: 'lnameSoundex',
    label: 'Last name sounds like',
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
const filterType = ['personType', 'events', 'temporals', 'sources'];

function People() {
  // redux
  const dispatch = useDispatch();
  const { peoplePagination, peopleFilters, peopleRelationship } = useSelector(
    (state) => state
  );
  const {
    advancedSearchInputs,
    limit,
    page,
    simpleSearchTerm,
    orderField,
    orderDesc,
    totalItems,
    totalPages,
  } = peoplePagination;
  const {
    events: fEvents,
    personType: fPersonType,
    sources: fSources,
    temporals: fTemporals,
  } = peopleFilters;

  // state
  const [loading, setLoading] = useState(true);
  const [loadComplete, setLoadComplete] = useState(false);
  const [items, setItems] = useState([]);
  const [gotoPage, setGotoPage] = useState(page);
  const [searchVisible, setSearchVisible] = useState(true);
  const [helpVisible, setHelpVisible] = useState(false);

  const updateStorePagination = useCallback(
    ({
      advancedSearchInputsParam = null,
      limitParam = null,
      pageParam = null,
      simpleSearchTermParam = null,
      orderFieldParam = null,
      orderDescParam = null,
      totalItemsParam = null,
      totalPagesParam = null,
    }) => {
      const payload = {};
      if (advancedSearchInputsParam !== null) {
        payload.advancedSearchInputs = advancedSearchInputsParam;
      }
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
      dispatch(setPaginationParams('people', payload));
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
          events: fEvents,
          sources: fSources,
          temporals: fTemporals,
          orderField,
          orderDesc,
        };
        if (fPersonType !== '') {
          params.personType = fPersonType;
        }
        if (simpleSearchTerm !== '' && simpleSearchTerm.length > 1) {
          params.label = simpleSearchTerm;
        } else if (advancedSearchInputs.length > 0) {
          const advancedParams = advancedSearchInputs
            .filter((i) => i.input !== '')
            .map((item) => item);
          params.advancedSearch = advancedParams;
        }
        const responseData = await axios({
          method: 'post',
          url: `${APIPath}ui-people`,
          crossDomain: true,
          data: params,
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

      const loadActiveFilters = async () => {
        const params = {
          limit,
          page,
          events: fEvents,
          sources: fSources,
          temporals: fTemporals,
        };
        if (fPersonType !== '') {
          params.personType = fPersonType;
        }
        if (simpleSearchTerm !== '' && simpleSearchTerm.length > 1) {
          params.label = simpleSearchTerm;
        } else if (advancedSearchInputs.length > 0) {
          const advancedParams = advancedSearchInputs
            .filter((i) => i.input !== '')
            .map((item) => item);
          params.advancedSearch = advancedParams;
        }
        const responseData = await axios({
          method: 'post',
          url: `${APIPath}ui-person-active-filters`,
          crossDomain: true,
          data: params,
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
      const activeFiltersData = await loadActiveFilters();
      if (!unmounted) {
        setLoading(false);
        setItems([]);
        updateDocumentTitle(heading);
        setLoadComplete(true);
        if (data !== null) {
          const {
            currentPage = 0,
            data: people = [],
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
            setItems(people);
            if (activeFiltersData !== null) {
              const { events, sources } = activeFiltersData;
              const payload = {
                events,
                sources,
              };
              dispatch(setRelationshipParams('people', payload));
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
    advancedSearchInputs,
    dispatch,
    fEvents,
    fPersonType,
    fSources,
    fTemporals,
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

  const clearAdvancedSearch = () => {
    if (advancedSearchInputs.length > 0) {
      updateStorePagination({ advancedSearchInputsParam: [] });
      reload();
    }
  };

  const updateAdvancedSearchInputs = (data = []) => {
    updateStorePagination({ advancedSearchInputsParam: data });
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
  };

  const updateType = (val = '') => {
    const payload = {
      personType: val,
    };
    dispatch(updateFilters('people', payload));
    reload();
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
    { label: 'People', icon: 'pe-7s-users', active: true, path: '' },
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
        pageType="people"
      />
    </Suspense>
  );
  const searchBox = (
    <Collapse isOpen={searchVisible}>
      <Suspense fallback={null}>
        <SearchForm
          searchElements={searchElements}
          simpleSearchTerm={simpleSearchTerm}
          simpleSearch={reload}
          clearSearch={clearSearch}
          handleChange={handleChange}
          advancedSearchEnable
          clearAdvancedSearch={clearAdvancedSearch}
          updateAdvancedSearchInputs={updateAdvancedSearchInputs}
          advancedSearchInputs={advancedSearchInputs}
        />
      </Suspense>
    </Collapse>
  );

  const renderItems = useCallback(() => {
    let outputObj = [];
    const output = [];
    const { length } = items;
    if (length > 0) {
      for (let i = 0; i < length; i += 1) {
        const item = items[i];
        const {
          affiliations: iAffiliations = [],
          _id = null,
          firstName = '',
          middleName = '',
          lastName = '',
          honorificPrefix = [],
          resources = [],
        } = item;

        if (_id !== null) {
          const affiliations =
            iAffiliations.map((a) => {
              const { ref = null } = a;
              if (ref !== null) {
                const { _id: aId = null, label = '' } = ref;
                if (aId !== null) {
                  const aLink = `/organisation/${aId}`;
                  return (
                    <div className="affiliation-block" key={aId}>
                      [
                      <Link to={aLink} href={aLink}>
                        {label.trim()}
                      </Link>
                      ]
                    </div>
                  );
                }
              }
              return null;
            }) || null;
          let label = firstName;
          if (middleName !== '') {
            label += ` ${middleName}`;
          }
          if (lastName !== '') {
            label += ` ${lastName}`;
          }

          if (honorificPrefix.length > 0) {
            let labelHP = honorificPrefix
              .filter((ih) => typeof ih !== 'undefined' && ih !== '')
              .join(', ');
            if (labelHP !== '') {
              labelHP = `(${labelHP})`;
            }
            label = `${labelHP} ${label}`;
          }

          let thumbnailImage = [];
          const { thumbnails = [] } = getItemThumbnailsURL(item);
          if (thumbnails.length > 0) {
            thumbnailImage = (
              <img
                src={thumbnails[0]}
                className="people-list-thumbnail img-fluid img-thumbnail"
                alt={label}
              />
            );
          } else {
            const isinICP =
              resources.find((ir) =>
                ir.ref.label.includes('Liam Chambers and Sarah Frank')
              ) || null;
            if (isinICP) {
              thumbnailImage = (
                <img
                  src={icpThumbnail}
                  className="people-list-thumbnail img-fluid img-thumbnail"
                  alt={label}
                />
              );
            } else {
              thumbnailImage = (
                <img
                  src={defaultThumbnail}
                  className="people-list-thumbnail img-fluid img-thumbnail"
                  alt={label}
                />
              );
            }
          }
          const link = `/person/${_id}`;
          const outputItem = (
            <ListGroupItem
              key={_id}
              onContextMenu={(e) => {
                e.preventDefault();
                return false;
              }}
            >
              <Link to={link} href={link}>
                {thumbnailImage}
              </Link>
              <div className="person-list-details">
                <Link to={link} href={link}>
                  {label}
                </Link>
                <div className="affiliation-blocks">{affiliations}</div>
              </div>
            </ListGroupItem>
          );
          output.push(outputItem);
        }
      }
      if (output.length > 0) {
        outputObj = (
          <div className="people-list">
            <ListGroup>{output}</ListGroup>
          </div>
        );
      }
    } else if (simpleSearchTerm.length > 1 || advancedSearchInputs.length > 0) {
      const queryText =
        simpleSearchTerm !== '' ? <b>&quot;{simpleSearchTerm}&quot;</b> : '';
      const item = (
        <div key="no-results" className="col-12">
          <Card style={{ marginBottom: '15px' }}>
            <CardBody>
              <h5>No results found</h5>
              <p>There are no people matching your query {queryText}</p>
            </CardBody>
          </Card>
        </div>
      );
      outputObj.push(item);
    }
    return outputObj;
  }, [items, simpleSearchTerm, advancedSearchInputs]);

  const people =
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
              name="people"
              filterType={filterType}
              filtersSet={peopleFilters}
              relationshipSet={peopleRelationship}
              updateType={updateType}
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
          {people}
          {pageActions}
        </div>
      </div>

      <Suspense fallback={[]}>
        <HelpArticle
          permalink="people-help"
          visible={helpVisible}
          toggle={toggleHelp}
        />
      </Suspense>
    </div>
  );
}
export default People;
