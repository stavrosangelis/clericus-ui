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
import { updateDocumentTitle, renderLoader } from '../helpers';
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

const mapStateToProps = (state) => ({
  organisationsPagination: state.organisationsPagination,
  organisationsFilters: state.organisationsFilters,
  organisationsRelationship: state.organisationsRelationship,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
    setRelationshipParams: (type, params) =>
      dispatch(setRelationshipParams(type, params)),
    updateFilters: (type, params) => dispatch(updateFilters(type, params)),
  };
}

class Organisations extends Component {
  constructor(props) {
    super(props);
    const { organisationsPagination } = this.props;
    this.state = {
      loading: true,
      organisationsLoading: true,
      items: [],
      page: organisationsPagination.page,
      gotoPage: organisationsPagination.page,
      limit: organisationsPagination.limit,
      totalPages: 0,
      totalItems: 0,
      searchVisible: true,
      simpleSearchTerm: organisationsPagination.simpleSearchTerm,
      helpVisible: false,
    };

    this.load = this.load.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.updateType = this.updateType.bind(this);
    this.toggleHelp = this.toggleHelp.bind(this);

    // cancelTokens
    const cancelToken1 = axios.CancelToken;
    this.cancelSource1 = cancelToken1.source();

    const cancelToken2 = axios.CancelToken;
    this.cancelSource2 = cancelToken2.source();

    const cancelToken3 = axios.CancelToken;
    this.cancelSource3 = cancelToken3.source();
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    const { organisationsFilters } = this.props;
    if (
      prevProps.organisationsFilters.organisationType !==
      organisationsFilters.organisationType
    ) {
      this.load();
    }
  }

  componentWillUnmount() {
    this.cancelSource1.cancel('api request cancelled');
    this.cancelSource2.cancel('api request cancelled');
    this.cancelSource3.cancel('api request cancelled');
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
      organisationType: val,
    };
    updateFiltersFn('organisations', payload);
  }

  async load() {
    this.setState({
      organisationsLoading: true,
    });
    const { organisationsFilters: filters } = this.props;
    const { page, limit, simpleSearchTerm } = this.state;
    const params = {
      page,
      limit,
      organisationType: filters.organisationType,
    };
    if (simpleSearchTerm !== '') {
      params.label = simpleSearchTerm;
    }
    const url = `${process.env.REACT_APP_APIPATH}ui-organisations`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
      cancelToken: this.cancelSource1.token,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    if (typeof responseData !== 'undefined') {
      const organisations = responseData.data;
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
          organisationsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: organisations,
        });
        // this.updateOrganisationsRelationship(organisations);
      }
    }
  }

  async simpleSearch(e) {
    e.preventDefault();
    const { simpleSearchTerm, page, limit } = this.state;
    const { organisationsFilters: filters } = this.props;
    if (simpleSearchTerm.length < 2) {
      return false;
    }
    this.updateStorePagination({
      simpleSearchTerm,
    });
    this.setState({
      organisationsLoading: true,
    });
    const params = {
      label: simpleSearchTerm,
      page,
      limit,
      organisationType: filters.organisationType,
    };
    const url = `${process.env.REACT_APP_APIPATH}ui-organisations`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
      cancelToken: this.cancelSource2.token,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    if (typeof responseData !== 'undefined') {
      const organisations = responseData.data;
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
          organisationsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: organisations,
        });
        // this.updateOrganisationsRelationship(organisations);
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

  async updateOrganisationsRelationship() {
    const {
      organisationsFilters: filters,
      setRelationshipParams: setRelationshipParamsFn,
    } = this.props;
    const { page, limit } = this.state;
    const params = {
      page,
      limit,
      organisationTypes: filters.organisations,
    };
    const url = `${process.env.REACT_APP_APIPATH}ui-organisations-active-filters`;
    const responseData = await axios({
      method: 'post',
      url,
      crossDomain: true,
      params,
      cancelToken: this.cancelSource3.token,
    })
      .then((response) => response.data)
      .catch((error) => console.log(error));
    if (typeof responseData !== 'undefined' && responseData.status) {
      const payload = {
        organisationTypes: responseData.data.organisations.map((item) => item),
      };
      setRelationshipParamsFn('organisations', payload);
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

  updateStorePagination({
    limit = null,
    page = null,
    simpleSearchTerm = null,
  }) {
    const { setPaginationParams: setPaginationParamsFn } = this.props;
    const payload = {};
    if (limit !== null) {
      payload.limit = limit;
    }
    if (page !== null) {
      payload.page = page;
    }
    if (simpleSearchTerm !== null) {
      payload.simpleSearchTerm = simpleSearchTerm;
    }
    setPaginationParamsFn('organisations', payload);
  }

  renderItems() {
    const { items, simpleSearchTerm } = this.state;
    const { organisationsPagination } = this.props;
    let outputObj = [];
    const output = [];
    if (items.length > 0) {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const { label, organisationType } = item;

        let thumbnailImage = [];
        const thumbnailURL = null;
        if (thumbnailURL !== null) {
          thumbnailImage = (
            <img
              src={thumbnailURL}
              className="organisations-list-thumbnail img-fluid img-thumbnail"
              alt={label}
            />
          );
        }
        const link = `/organisation/${item._id}`;
        const organisationTypeOutput =
          organisationType !== '' ? (
            <small>{` [${organisationType}]`}</small>
          ) : (
            []
          );
        const outputItem = (
          <ListGroupItem key={i}>
            <Link to={link} href={link}>
              {thumbnailImage}
            </Link>
            <Link to={link} href={link}>
              {label}
              {organisationTypeOutput}
            </Link>
          </ListGroupItem>
        );
        output.push(outputItem);
      }
      outputObj = (
        <div className="organisations-list">
          <ListGroup>{output}</ListGroup>
        </div>
      );
    } else {
      let query = '';
      if (simpleSearchTerm !== '') {
        query = <b>&quot;{organisationsPagination.simpleSearchTerm}&quot;</b>;
      }
      const item = (
        <div key="no-results" className="col-12">
          <Card style={{ marginBottom: '15px' }}>
            <CardBody>
              <h5>No results found</h5>
              <p>There are no organisations matching your query {query}</p>
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
      page,
      gotoPage,
      totalPages,
      organisationsLoading,
      searchVisible,
      simpleSearchTerm,
      totalItems,
      helpVisible,
    } = this.state;
    const { organisationsFilters, organisationsRelationship } = this.props;
    const heading = 'Organisations';
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
            current_page={page}
            gotoPageValue={gotoPage}
            total_pages={totalPages}
            updatePage={this.updatePage}
            gotoPage={this.gotoPage}
            handleChange={this.handleChange}
            updateLimit={this.updateLimit}
            pageType="organisations"
          />
        </Suspense>
      );
      let organisations = (
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      );
      if (!organisationsLoading) {
        organisations = this.renderItems();
      }
      const searchElements = [
        {
          element: 'label',
          label: 'Label',
          inputType: 'text',
          inputData: null,
        },
      ];

      const searchBox = (
        <Collapse isOpen={searchVisible}>
          <Suspense fallback={renderLoader()}>
            <SearchForm
              name="organisations"
              searchElements={searchElements}
              simpleSearchTerm={simpleSearchTerm}
              simpleSearch={this.simpleSearch}
              clearSearch={this.clearSearch}
              handleChange={this.handleChange}
              adadvancedSearchEnable={false}
              advancedSearch={this.advancedSearchSubmit}
              updateAdvancedSearchRows={this.updateAdvancedSearchRows}
              clearAdvancedSearch={this.clearAdvancedSearch}
              updateAdvancedSearchInputs={this.updateAdvancedSearchInputs}
            />
          </Suspense>
        </Collapse>
      );

      const filterType = ['organisationType'];
      content = (
        <div>
          <div className="row">
            <div className="col-xs-12 col-sm-4">
              <Suspense fallback={renderLoader()}>
                <Filters
                  name="organisations"
                  filterType={filterType}
                  filtersSet={organisationsFilters}
                  relationshipSet={organisationsRelationship}
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
              {organisations}
              {pageActions}
              <HelpArticle
                permalink="organisations-help"
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

Organisations.defaultProps = {
  organisationsPagination: {
    limit: 25,
    page: 1,
    simpleSearchTerm: '',
  },
  organisationsFilters: {
    organisationType: '',
  },
  updateFilters: () => {},
  setRelationshipParams: () => {},
  setPaginationParams: () => {},
  organisationsRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
};
Organisations.propTypes = {
  organisationsPagination: PropTypes.shape({
    limit: PropTypes.number,
    page: PropTypes.number,
    simpleSearchTerm: PropTypes.string,
  }),
  organisationsFilters: PropTypes.shape({
    organisationType: PropTypes.string,
  }),
  updateFilters: PropTypes.func,
  setRelationshipParams: PropTypes.func,
  setPaginationParams: PropTypes.func,
  organisationsRelationship: PropTypes.shape({
    classpieces: PropTypes.array,
    events: PropTypes.array,
    organisations: PropTypes.array,
    people: PropTypes.array,
    temporals: PropTypes.array,
    spatials: PropTypes.array,
  }),
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  Organisations
);
