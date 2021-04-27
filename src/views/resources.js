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
import Breadcrumbs from '../components/breadcrumbs';
import {
  updateDocumentTitle,
  getResourceThumbnailURL,
  renderLoader,
} from '../helpers';
import HelpArticle from '../components/help-article';

import { setPaginationParams } from '../redux/actions';

const Filters = lazy(() => import('../components/filters'));
const SearchForm = lazy(() => import('../components/search-form'));
const PageActions = lazy(() => import('../components/page-actions'));

const mapStateToProps = (state) => {
  const resourcesType = state.resourcesType.filter(
    (r) => r.labelId !== 'Classpiece'
  );
  return {
    resourcesType,
    resourcesPagination: state.resourcesPagination,
    resourcesFilters: state.resourcesFilters,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
  };
}

class Resources extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      resourcesLoading: true,
      items: [],
      page: 1,
      gotoPage: 1,
      limit: 50,
      totalPages: 0,
      totalItems: 0,
      searchVisible: true,
      simpleSearchTerm: '',
      helpVisible: false,
    };

    this.load = this.load.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleHelp = this.toggleHelp.bind(this);

    // cancelTokens
    const cancelToken1 = axios.CancelToken;
    this.cancelSource1 = cancelToken1.source();

    const cancelToken2 = axios.CancelToken;
    this.cancelSource2 = cancelToken2.source();
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.cancelSource1.cancel('api request cancelled');
    this.cancelSource2.cancel('api request cancelled');
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

  async load() {
    const { resourcesFilters: filters } = this.props;
    const { simpleSearchTerm, page, limit } = this.state;
    this.setState({
      resourcesLoading: true,
    });
    const params = {
      page,
      limit,
      resourcesTypes: filters.resourcesTypes,
    };
    if (simpleSearchTerm !== '') {
      params.label = simpleSearchTerm;
    }
    const url = `${process.env.REACT_APP_APIPATH}ui-resources`;
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
      const resources = responseData.data;
      let currentPage = 1;
      if (responseData.currentPage > 0) {
        currentPage = responseData.currentPage;
      }
      if (currentPage > responseData.totalPages) {
        this.updatePage(responseData.totalPages);
      } else {
        this.setState({
          loading: false,
          resourcesLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: resources,
        });
      }
    }
  }

  async simpleSearch(e) {
    e.preventDefault();
    const { simpleSearchTerm, page, limit } = this.state;
    if (simpleSearchTerm.length < 2) {
      return false;
    }
    this.updateStorePagination({
      simpleSearchTerm,
    });
    this.setState({
      resourcesLoading: true,
    });
    const params = {
      label: simpleSearchTerm,
      page,
      limit,
    };
    const url = `${process.env.REACT_APP_APIPATH}ui-resources`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
      cancelToken: this.cancelSource2.token,
    })
      .then((response) => response.data.data)
      .catch((error) => console.log(error));
    if (typeof responseData !== 'undefined') {
      const resources = responseData.data;
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
          resourcesLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: resources,
        });
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
    setPaginationParamsFn('resources', payload);
  }

  renderItems() {
    const { items, simpleSearchTerm } = this.state;
    const { resourcesPagination } = this.props;
    let outputObj = [];
    const output = [];
    if (items.length > 0) {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const { label } = item;

        let thumbnailImage = [];
        const thumbnailURL = getResourceThumbnailURL(item);
        if (thumbnailURL !== null) {
          thumbnailImage = (
            <img
              src={thumbnailURL}
              className="resources-list-thumbnail img-fluid img-thumbnail"
              alt={label}
            />
          );
        }
        if (item.resourceType === 'document') {
          thumbnailImage = (
            <i className="fa fa-file-pdf-o resource-list-icon-thumb" />
          );
        }

        const link = `/resource/${item._id}`;
        const outputItem = (
          <ListGroupItem key={i}>
            <Link to={link} href={link}>
              {thumbnailImage}
            </Link>
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
    } else {
      let query = '';
      if (simpleSearchTerm !== '') {
        query = <b>&quot;{resourcesPagination.simpleSearchTerm}&quot;</b>;
      }
      const item = (
        <div key="no-results" className="col-12">
          <Card style={{ marginBottom: '15px' }}>
            <CardBody>
              <h5>No results found</h5>
              <p>There are no resources matching your query {query}</p>
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
      resourcesLoading,
      searchVisible,
      simpleSearchTerm,
      totalItems,
      helpVisible,
    } = this.state;
    const { resourcesFilters } = this.props;
    const heading = 'Resources';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-users', active: true, path: '' },
    ];
    updateDocumentTitle(heading);
    let content = (
      <div>
        <div className="row">
          <div className="col-12">
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
            sort={false}
            current_page={page}
            gotoPageValue={gotoPage}
            total_pages={totalPages}
            updatePage={this.updatePage}
            gotoPage={this.gotoPage}
            handleChange={this.handleChange}
            updateLimit={this.updateLimit}
            updateSort={this.updateSort}
            pageType="resources"
          />
        </Suspense>
      );
      let resources = (
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      );
      if (!resourcesLoading) {
        resources = this.renderItems();
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
              searchElements={searchElements}
              simpleSearchTerm={simpleSearchTerm}
              simpleSearch={this.simpleSearch}
              clearSearch={this.clearSearch}
              handleChange={this.handleChange}
              adadvancedSearchEnable={false}
            />
          </Suspense>
        </Collapse>
      );

      // console.log(this.props)
      const filterType = ['resourcesTypes'];
      content = (
        <div>
          <div className="row">
            <div className="col-xs-12 col-sm-4">
              <Suspense fallback={renderLoader()}>
                <Filters
                  name="resources"
                  filterType={filterType}
                  filtersSet={resourcesFilters}
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
              {resources}
              {pageActions}
              <HelpArticle
                permalink="resources-help"
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
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
      </div>
    );
  }
}

Resources.defaultProps = {
  resourcesPagination: {
    limit: 25,
    page: 1,
    simpleSearchTerm: '',
  },
  resourcesFilters: {
    resourcesTypes: [],
    events: [],
    organisations: [],
    temporals: {
      startDate: '',
      endDate: '',
      dateType: 'exact',
    },
  },
  setPaginationParams: () => {},
};
Resources.propTypes = {
  resourcesPagination: PropTypes.shape({
    limit: PropTypes.number,
    page: PropTypes.number,
    simpleSearchTerm: PropTypes.string,
  }),
  resourcesFilters: PropTypes.shape({
    resourcesTypes: PropTypes.array,
    events: PropTypes.array,
    organisations: PropTypes.array,
    temporals: PropTypes.shape({
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      dateType: PropTypes.string,
    }),
  }),
  setPaginationParams: PropTypes.func,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(Resources);
