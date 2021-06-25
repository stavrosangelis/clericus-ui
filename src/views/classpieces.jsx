import React, { Component, lazy, Suspense } from 'react';
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
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import {
  getResourceThumbnailURL,
  updateDocumentTitle,
  renderLoader,
} from '../helpers';
import defaultThumbnail from '../assets/images/classpiece-default-thumbnail.jpg';
import HelpArticle from '../components/help-article';

import { setPaginationParams, setRelationshipParams } from '../redux/actions';

import '../scss/classpieces.scss';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const Filters = lazy(() => import('../components/filters'));
const SearchForm = lazy(() => import('../components/search-form'));
const PageActions = lazy(() => import('../components/page-actions'));

const mapStateToProps = (state) => ({
  classpiecesPagination: state.classpiecesPagination,
  classpiecesFilters: state.classpiecesFilters,
  classpiecesRelationship: state.classpiecesRelationship,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
    setRelationshipParams: (type, params) =>
      dispatch(setRelationshipParams(type, params)),
  };
}

class Classpieces extends Component {
  static renderItem(i, item) {
    const parseUrl = `/classpiece/${item._id}`;
    let thumbnailImage = <img src={defaultThumbnail} alt={item.label} />;
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
          <CardImg src={defaultThumbnail} alt={item.label} />
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
                  {item.label}
                </Link>
              </Label>
            </CardText>
          </CardBody>
        </Card>
      </div>
    );
    return itemOutput;
  }

  constructor(props) {
    super(props);
    const { classpiecesPagination } = this.props;
    this.state = {
      loading: true,
      classpiecesLoading: true,
      items: [],
      page: classpiecesPagination.page,
      gotoPage: classpiecesPagination.page,
      limit: classpiecesPagination.limit,
      totalPages: 0,
      totalItems: 0,
      searchVisible: true,
      simpleSearchTerm: classpiecesPagination.simpleSearchTerm,
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
    this.updateClasspiecesRelationship = this.updateClasspiecesRelationship.bind(
      this
    );
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

  async load() {
    const { classpiecesFilters: filters } = this.props;
    const { page, limit, simpleSearchTerm } = this.state;
    this.setState({
      classpiecesLoading: true,
    });
    const params = {
      page,
      limit,
      events: filters.events,
      organisations: filters.organisations,
      temporals: filters.temporals,
    };
    if (simpleSearchTerm !== '') {
      params.label = simpleSearchTerm;
    }
    const url = `${process.env.REACT_APP_APIPATH}classpieces`;
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
      const classpieces = responseData.data;
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
          classpiecesLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: classpieces,
        });
        this.updateClasspiecesRelationship();
      }
    }
  }

  async simpleSearch(e) {
    e.preventDefault();
    const { simpleSearchTerm, page, limit } = this.state;
    const { classpiecesFilters } = this.props;
    if (simpleSearchTerm.length < 2) {
      return false;
    }
    this.updateStorePagination({
      simpleSearchTerm,
    });
    this.setState({
      classpiecesLoading: true,
    });
    const filters = classpiecesFilters;
    const params = {
      label: simpleSearchTerm,
      page,
      limit,
      events: filters.events,
      organisations: filters.organisations,
      temporals: filters.temporals,
    };
    const url = `${process.env.REACT_APP_APIPATH}classpieces`;
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
      const classpieces = responseData.data;
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
          classpiecesLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: classpieces,
        });

        this.updateClasspiecesRelationship();
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

  async updateClasspiecesRelationship() {
    const { page, limit } = this.state;
    const {
      classpiecesFilters,
      setRelationshipParams: setRelationshipParamsFn,
    } = this.props;
    const filters = classpiecesFilters;
    const params = {
      page,
      limit,
      events: filters.events,
      organisations: filters.organisations,
      temporals: filters.temporals,
    };
    const url = `${process.env.REACT_APP_APIPATH}classpieces-active-filters`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
      cancelToken: this.cancelSource3.token,
    })
      .then((response) => response.data)
      .catch((error) => console.log(error));
    if (typeof responseData !== 'undefined' && responseData.status) {
      const payload = {
        events: responseData.data.events.map((item) => item),
        organisations: responseData.data.organisations.map((item) => item),
      };
      setRelationshipParamsFn('classpieces', payload);
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
    const { setRelationshipParams: setRelationshipParamsFn } = this.props;
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
    setRelationshipParamsFn('classpieces', payload);
  }

  toggleHelp() {
    const { helpVisible } = this.state;
    this.setState({
      helpVisible: !helpVisible,
    });
  }

  renderItems() {
    const { items, simpleSearchTerm } = this.state;
    const { classpiecesPagination } = this.props;
    const output = [];
    if (items.length > 0) {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        output.push(this.constructor.renderItem(i, item));
      }
    } else {
      let query = '';
      if (simpleSearchTerm !== '') {
        query = <b>&quot;{classpiecesPagination.simpleSearchTerm}&quot;</b>;
      }
      const item = (
        <div key="no-results" className="col-12">
          <Card style={{ marginBottom: '15px' }}>
            <CardBody>
              <h5>No results found</h5>
              <p>There are no classpieces matching your query {query}</p>
            </CardBody>
          </Card>
        </div>
      );
      output.push(item);
    }
    return output;
  }

  render() {
    const {
      loading,
      limit,
      page,
      gotoPage,
      totalPages,
      classpiecesLoading,
      searchVisible,
      simpleSearchTerm,
      totalItems,
      helpVisible,
    } = this.state;
    const { classpiecesFilters, classpiecesRelationship } = this.props;
    const heading = 'Classpieces';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-photo', active: true, path: '' },
    ];
    updateDocumentTitle(heading);
    let content = (
      <div>
        <div className="row">
          <div className="col-xs-12">
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
            sort={false}
            current_page={page}
            gotoPageValue={gotoPage}
            total_pages={totalPages}
            updatePage={this.updatePage}
            gotoPage={this.gotoPage}
            handleChange={this.handleChange}
            updateLimit={this.updateLimit}
            pageType="classpieces"
          />
        </Suspense>
      );
      let classpieces = (
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      );
      if (!classpiecesLoading) {
        classpieces = this.renderItems();
      }

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

      const filterType = ['events', 'temporals'];
      content = (
        <div>
          <div className="row">
            <div className="col-xs-12 col-sm-4">
              <Suspense fallback={renderLoader()}>
                <Filters
                  name="classpieces"
                  filterType={filterType}
                  filtersSet={classpiecesFilters}
                  relationshipSet={classpiecesRelationship}
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
              <div className="row">{classpieces}</div>
              {pageActions}
              <HelpArticle
                permalink="classpieces-help"
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

Classpieces.defaultProps = {
  classpiecesPagination: null,
  classpiecesFilters: {
    events: [],
    organisations: [],
    temporals: {
      startDate: '',
      endDate: '',
      dateType: 'exact',
    },
  },
  setRelationshipParams: () => {},
  classpiecesRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
};
Classpieces.propTypes = {
  classpiecesPagination: PropTypes.object,
  classpiecesFilters: PropTypes.shape({
    events: PropTypes.array,
    organisations: PropTypes.array,
    temporals: PropTypes.shape({
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      dateType: PropTypes.string,
    }),
  }),
  setRelationshipParams: PropTypes.func,
  classpiecesRelationship: PropTypes.shape({
    classpieces: PropTypes.array,
    events: PropTypes.array,
    organisations: PropTypes.array,
    people: PropTypes.array,
    temporals: PropTypes.array,
    spatials: PropTypes.array,
  }),
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  Classpieces
);
