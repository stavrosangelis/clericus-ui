import React, { Component, lazy, Suspense } from 'react';
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
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import {
  getPersonThumbnailURL,
  updateDocumentTitle,
  renderLoader,
} from '../helpers';
import defaultThumbnail from '../assets/images/spcc.jpg';
import icpThumbnail from '../assets/images/icp-logo.jpg';
import HelpArticle from '../components/help-article';

import {
  setPaginationParams,
  setRelationshipParams,
  updateFilters,
} from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const Filters = lazy(() => import('../components/filters'));
const SearchForm = lazy(() => import('../components/search-form'));
const PageActions = lazy(() => import('../components/page-actions'));

const mapStateToProps = (state) => {
  const peopleFilters = state.peopleFilters || null;
  const peopleRelationship = state.peopleRelationship || null;
  return {
    peoplePagination: state.peoplePagination,
    peopleFilters,
    peopleRelationship,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
    setRelationshipParams: (type, params) =>
      dispatch(setRelationshipParams(type, params)),
    updateFilters: (type, params) => dispatch(updateFilters(type, params)),
  };
}

class People extends Component {
  constructor(props) {
    super(props);
    const { peoplePagination } = this.props;
    this.state = {
      loading: true,
      peopleLoading: true,
      items: [],
      page: peoplePagination.page,
      gotoPage: peoplePagination.page,
      limit: peoplePagination.limit,
      orderField: peoplePagination.orderField,
      orderDesc: peoplePagination.orderDesc,
      totalPages: 0,
      totalItems: 0,
      searchVisible: true,
      simpleSearchTerm: peoplePagination.simpleSearchTerm,
      advancedSearchInputs: peoplePagination.advancedSearchInputs,
      helpVisible: false,
    };

    this.load = this.load.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.advancedSearchSubmit = this.advancedSearchSubmit.bind(this);
    this.clearAdvancedSearch = this.clearAdvancedSearch.bind(this);
    this.updateAdvancedSearchInputs =
      this.updateAdvancedSearchInputs.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.updateSort = this.updateSort.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updatePeopleRelationship = this.updatePeopleRelationship.bind(this);
    this.updateType = this.updateType.bind(this);
    this.toggleHelp = this.toggleHelp.bind(this);

    // cancelTokens
    const cancelToken1 = axios.CancelToken;
    this.cancelSource1 = cancelToken1.source();

    const cancelToken2 = axios.CancelToken;
    this.cancelSource2 = cancelToken2.source();

    const cancelToken3 = axios.CancelToken;
    this.cancelSource3 = cancelToken3.source();

    const cancelToken4 = axios.CancelToken;
    this.cancelSource4 = cancelToken4.source();
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    const { peopleFilters } = this.props;
    if (prevProps.peopleFilters.personType !== peopleFilters.personType) {
      this.load();
    }
  }

  componentWillUnmount() {
    this.cancelSource1.cancel('api request cancelled');
    this.cancelSource2.cancel('api request cancelled');
    this.cancelSource3.cancel('api request cancelled');
    this.cancelSource4.cancel('api request cancelled');
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  toggleHelp() {
    const { helpVisible } = this.state;
    this.setState({
      helpVisible: !helpVisible,
    });
  }

  updateType(val) {
    const { updateFilters: updateFiltersFn } = this.props;
    const payload = {
      personType: val,
    };
    updateFiltersFn('people', payload);
  }

  async load() {
    const { peopleFilters: filters } = this.props;
    const {
      page,
      limit,
      orderField,
      orderDesc,
      simpleSearchTerm,
      advancedSearchInputs,
    } = this.state;
    this.setState({
      peopleLoading: true,
    });
    const params = {
      page,
      limit,
      events: filters.events,
      organisations: filters.organisations,
      sources: filters.sources,
      temporals: filters.temporals,
      orderField,
      orderDesc,
    };
    if (filters.personType !== '') {
      params.personType = filters.personType;
    }
    if (simpleSearchTerm !== '') {
      params.label = simpleSearchTerm;
    } else if (advancedSearchInputs.length > 0) {
      for (let i = 0; i < advancedSearchInputs.length; i += 1) {
        const searchInput = advancedSearchInputs[i];
        params[searchInput.select] = searchInput.input;
      }
    }
    const url = `${process.env.REACT_APP_APIPATH}ui-people`;
    const responseData = await axios({
      method: 'post',
      url,
      crossDomain: true,
      data: params,
      cancelToken: this.cancelSource1.token,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    if (typeof responseData !== 'undefined') {
      const people = responseData.data;
      let currentPage = 1;
      if (responseData.currentPage > 0) {
        currentPage = responseData.currentPage;
      }
      if (
        currentPage !== 1 &&
        currentPage > responseData.totalPages &&
        responseData.totalPages > 0
      ) {
        this.updatePage(responseData.totalPages);
      } else {
        this.setState({
          loading: false,
          peopleLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: people,
        });
        this.updatePeopleRelationship();
      }
    }
  }

  async simpleSearch(e) {
    e.preventDefault();
    const { peopleFilters: filters } = this.props;
    const { page, limit, orderField, orderDesc, simpleSearchTerm } = this.state;
    if (simpleSearchTerm.length < 2) {
      return false;
    }
    this.updateStorePagination({
      simpleSearchTerm,
    });
    this.setState({
      peopleLoading: true,
    });

    const params = {
      label: simpleSearchTerm,
      page,
      limit,
      events: filters.events,
      organisations: filters.organisations,
      sources: filters.sources,
      temporals: filters.temporals,
      orderField,
      orderDesc,
    };
    if (filters.personType !== '') {
      params.personType = filters.personType;
    }
    const url = `${process.env.REACT_APP_APIPATH}ui-people`;
    const responseData = await axios({
      method: 'post',
      url,
      crossDomain: true,
      data: params,
      cancelToken: this.cancelSource2.token,
    })
      .then((response) => response.data.data)
      .catch((error) => console.log(error));
    if (typeof responseData !== 'undefined') {
      const people = responseData.data;
      let currentPage = 1;
      if (responseData.currentPage > 0) {
        currentPage = responseData.currentPage;
      }
      if (
        currentPage !== 1 &&
        currentPage > responseData.totalPages &&
        responseData.totalPages > 0
      ) {
        this.updatePage(responseData.totalPages);
      } else {
        this.setState({
          loading: false,
          peopleLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: people,
        });
        this.updatePeopleRelationship();
      }
    }
    return false;
  }

  async advancedSearchSubmit(e) {
    e.preventDefault();
    const { peopleFilters: filters } = this.props;
    const {
      page,
      limit,
      orderField,
      orderDesc,
      simpleSearchTerm,
      advancedSearchInputs,
    } = this.state;
    this.updateStorePagination({
      simpleSearchTerm,
      advancedSearchInputs,
    });
    this.setState({
      peopleLoading: true,
      simpleSearchTerm: '',
    });
    const params = {
      page,
      limit,
      events: filters.events,
      organisations: filters.organisations,
      sources: filters.sources,
      temporals: filters.temporals,
      orderField,
      orderDesc,
      personType: 'Clergy',
    };
    if (advancedSearchInputs.length > 0) {
      const advancedParams = advancedSearchInputs
        .filter((i) => i.input !== '')
        .map((item) => item);
      params.advancedSearch = advancedParams;
    } else {
      return false;
    }
    const url = `${process.env.REACT_APP_APIPATH}ui-people`;
    const responseData = await axios({
      method: 'post',
      url,
      crossDomain: true,
      data: params,
      cancelToken: this.cancelSource3.token,
    })
      .then((response) => response.data.data)
      .catch((error) => console.log(error));
    if (typeof responseData !== 'undefined') {
      const people = responseData.data;
      let currentPage = 1;
      if (responseData.currentPage > 0) {
        currentPage = responseData.currentPage;
      }
      if (
        currentPage !== 1 &&
        currentPage > responseData.totalPages &&
        responseData.totalPages > 0
      ) {
        this.updatePage(responseData.totalPages);
      } else {
        this.setState({
          loading: false,
          peopleLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: people,
        });
        this.updatePeopleRelationship();
      }
    }
    return false;
  }

  clearSearch() {
    this.updateStorePagination({ simpleSearchTerm: '', page: 1 });
    this.setState(
      {
        simpleSearchTerm: '',
        page: 1,
      },
      () => {
        this.load();
      }
    );
  }

  toggleSearch() {
    const { searchVisible } = this.state;
    this.setState({
      searchVisible: !searchVisible,
    });
  }

  clearAdvancedSearch() {
    const payload = { advancedSearchInputs: [] };
    this.updateStorePagination(payload);
    this.setState(payload, () => {
      this.load();
    });
  }

  updateAdvancedSearchInputs(advancedSearchInputs) {
    const payload = { advancedSearchInputs };
    this.updateStorePagination(payload);
    this.setState(payload);
  }

  async updatePeopleRelationship() {
    const {
      peopleFilters: filters,
      setRelationshipParams: setRelationshipParamsFn,
    } = this.props;
    const { page, limit, simpleSearchTerm, advancedSearchInputs } = this.state;
    const params = {
      page,
      limit,
      events: filters.events,
      organisations: filters.organisations,
      temporals: filters.temporals,
      personType: 'Clergy',
    };
    if (simpleSearchTerm !== '') {
      params.label = simpleSearchTerm;
    } else if (advancedSearchInputs.length > 0) {
      for (let i = 0; i < advancedSearchInputs.length; i += 1) {
        const searchInput = advancedSearchInputs[i];
        params[searchInput.select] = searchInput.input;
      }
    }
    const url = `${process.env.REACT_APP_APIPATH}ui-person-active-filters`;
    const responseData = await axios({
      method: 'post',
      url,
      crossDomain: true,
      data: params,
      cancelToken: this.cancelSource4.token,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (typeof responseData !== 'undefined' && responseData.status) {
      const payload = {
        events: responseData.data.events.map((item) => item),
        organisations: responseData.data.organisations.map((item) => item),
      };
      setRelationshipParamsFn('people', payload);
    }
  }

  updatePage(e) {
    const { page } = this.state;
    if (e > 0 && e !== page) {
      this.updateStorePagination({ page: e });
      this.setState(
        {
          page: e,
          gotoPage: e,
        },
        () => {
          this.load();
        }
      );
    }
  }

  gotoPage(e) {
    e.preventDefault();
    const { gotoPage } = this.state;
    const { page } = this.state;
    if (gotoPage > 0 && gotoPage !== page) {
      this.updateStorePagination({ page: e });
      this.setState(
        {
          page: gotoPage,
        },
        () => {
          this.load();
        }
      );
    }
  }

  updateLimit(limit) {
    this.setState(
      {
        limit,
      },
      () => {
        this.load();
      }
    );
    this.updateStorePagination({ limit });
  }

  updateSort(orderField) {
    const { orderField: stateOrderField, orderDesc: stateOrderDesc } =
      this.state;
    let orderDesc = false;
    if (orderField === stateOrderField) {
      orderDesc = !stateOrderDesc;
    }
    const update = {
      orderField,
      orderDesc,
    };
    this.updateStorePagination(update);
    this.setState(update, () => {
      this.load();
    });
  }

  updateStorePagination({
    limit = null,
    page = null,
    orderField = null,
    orderDesc = null,
    simpleSearchTerm = null,
    advancedSearchInputs = null,
  }) {
    const { setPaginationParams: setPaginationParamsFn } = this.props;
    const payload = {};
    if (limit !== null) {
      payload.limit = limit;
    }
    if (page !== null) {
      payload.page = page;
    }
    if (orderField !== null) {
      payload.orderField = orderField;
    }
    if (orderDesc !== null) {
      payload.orderDesc = orderDesc;
    }
    if (simpleSearchTerm !== null) {
      payload.simpleSearchTerm = simpleSearchTerm;
    }
    if (advancedSearchInputs !== null) {
      payload.advancedSearchInputs = advancedSearchInputs;
    }
    setPaginationParamsFn('people', payload);
  }

  renderItems() {
    const { items, simpleSearchTerm } = this.state;
    const { peoplePagination } = this.props;
    let outputObj = [];
    const output = [];
    if (items.length > 0) {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const affiliations =
          item.affiliations.map((a) => {
            const aLink = `/organisation/${a.ref._id}`;
            return (
              <div className="affiliation-block" key={a.ref._id}>
                [
                <Link to={aLink} href={aLink}>
                  {a.ref.label.trim()}
                </Link>
                ]
              </div>
            );
          }) ?? [];
        let label = item.firstName;
        if (
          typeof item.middleName !== 'undefined' &&
          item.middleName !== null &&
          item.middleName !== ''
        ) {
          label += ` ${item.middleName}`;
        }
        label += ` ${item.lastName}`;
        if (item.honorificPrefix.length > 0) {
          let labelHP = item.honorificPrefix
            .filter((ih) => ih !== '')
            .join(', ');
          if (labelHP !== '') {
            labelHP = `(${labelHP})`;
          }
          label = `${labelHP} ${label}`;
        }

        let thumbnailImage = [];
        const thumbnailURLs = getPersonThumbnailURL(item);
        if (
          typeof thumbnailURLs.thumbnails !== 'undefined' &&
          thumbnailURLs.thumbnails.length > 0
        ) {
          thumbnailImage = (
            <img
              src={thumbnailURLs.thumbnails[0]}
              className="people-list-thumbnail img-fluid img-thumbnail"
              alt={label}
            />
          );
        } else {
          const isinICP =
            item.resources.find((ir) =>
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
        const link = `/person/${item._id}`;
        const outputItem = (
          <ListGroupItem
            key={item._id}
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
      outputObj = (
        <div className="people-list">
          <ListGroup>{output}</ListGroup>
        </div>
      );
    } else {
      let query = '';
      if (simpleSearchTerm !== '') {
        query = <b>&quot;{peoplePagination.simpleSearchTerm}&quot;</b>;
      }
      const item = (
        <div key="no-results" className="col-12">
          <Card style={{ marginBottom: '15px' }}>
            <CardBody>
              <h5>No results found</h5>
              <p>There are no people matching your query {query}</p>
            </CardBody>
          </Card>
        </div>
      );
      outputObj.push(item);
    }
    return outputObj;
  }

  render() {
    const {
      loading,
      limit,
      orderField,
      orderDesc,
      page,
      gotoPage,
      totalPages,
      peopleLoading,
      advancedSearchInputs,
      searchVisible,
      simpleSearchTerm,
      helpVisible,
      totalItems,
    } = this.state;
    const { peopleFilters, peopleRelationship } = this.props;
    const heading = 'People';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-users', active: true, path: '' },
    ];
    updateDocumentTitle(heading);
    let content = (
      <div>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <h4>Filters</h4>
          </div>
          <div className="col-xs-12 col-sm-8">
            <h2>{heading}</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      </div>
    );

    if (!loading) {
      const pageActions = (
        <Suspense fallback={renderLoader()}>
          <PageActions
            limit={limit}
            sort
            orderField={orderField}
            orderDesc={orderDesc}
            current_page={page}
            gotoPageValue={gotoPage}
            total_pages={totalPages}
            updatePage={this.updatePage}
            gotoPage={this.gotoPage}
            handleChange={this.handleChange}
            updateLimit={this.updateLimit}
            updateSort={this.updateSort}
            pageType="people"
          />
        </Suspense>
      );
      let people = (
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      );
      if (!peopleLoading) {
        people = this.renderItems();
      }
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
        // {element: "middleName", label: "Middle name", inputType: "text", inputData: null},
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
        /* select option templete
        { element: "orderField", label: "Order Field",
          inputType: "select", inputData: [ {label: "First Name", value: "firstName"},
                                            {label: "Last Name", value: "lastName"} ]},
        */
      ];
      const advancedSearchInputsLength = advancedSearchInputs.length;
      const searchBox = (
        <Collapse isOpen={searchVisible}>
          <Suspense fallback={renderLoader()}>
            <SearchForm
              searchElements={searchElements}
              simpleSearchTerm={simpleSearchTerm}
              simpleSearch={this.simpleSearch}
              clearSearch={this.clearSearch}
              handleChange={this.handleChange}
              adadvancedSearchEnable
              advancedSearch={this.advancedSearchSubmit}
              updateAdvancedSearchRows={this.updateAdvancedSearchRows}
              clearAdvancedSearch={this.clearAdvancedSearch}
              updateAdvancedSearchInputs={this.updateAdvancedSearchInputs}
              advancedSearchInputsLength={advancedSearchInputsLength}
              advancedSearchInputs={advancedSearchInputs}
            />
          </Suspense>
        </Collapse>
      );

      const filterType = [
        'personType',
        'events',
        'organisations',
        'temporals',
        'sources',
      ];

      content = (
        <div>
          <div className="row">
            <div className="col-xs-12 col-sm-4">
              <Suspense fallback={renderLoader()}>
                <Filters
                  name="people"
                  filterType={filterType}
                  filtersSet={peopleFilters}
                  relationshipSet={peopleRelationship}
                  updateType={this.updateType}
                  updatedata={this.load}
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
                    onClick={() => this.toggleSearch()}
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
                    onClick={() => this.toggleHelp()}
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
              <HelpArticle
                permalink="people-help"
                visible={helpVisible}
                toggle={this.toggleHelp}
              />
            </div>
          </div>
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
}

People.defaultProps = {
  peoplePagination: {
    limit: 25,
    page: 1,
    orderField: 'lastName',
    orderDesc: false,
    simpleSearchTerm: '',
    advancedSearchInputs: [],
  },
  peopleFilters: {
    events: [],
    organisations: [],
    personType: '',
    sources: [],
    temporals: {
      startDate: '',
      endDate: '',
      dateType: 'exact',
    },
  },
  updateFilters: () => {},
  setRelationshipParams: () => {},
  setPaginationParams: () => {},
  peopleRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
};
People.propTypes = {
  peoplePagination: PropTypes.shape({
    limit: PropTypes.number,
    page: PropTypes.number,
    orderField: PropTypes.string,
    orderDesc: PropTypes.bool,
    simpleSearchTerm: PropTypes.string,
    advancedSearchInputs: PropTypes.array,
  }),
  peopleFilters: PropTypes.shape({
    events: PropTypes.array,
    organisations: PropTypes.array,
    personType: PropTypes.string,
    sources: PropTypes.array,
    temporals: PropTypes.shape({
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      dateType: PropTypes.string,
    }),
  }),
  updateFilters: PropTypes.func,
  setRelationshipParams: PropTypes.func,
  setPaginationParams: PropTypes.func,
  peopleRelationship: PropTypes.shape({
    classpieces: PropTypes.array,
    events: PropTypes.array,
    organisations: PropTypes.array,
    people: PropTypes.array,
    temporals: PropTypes.array,
    spatials: PropTypes.array,
  }),
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(People);
