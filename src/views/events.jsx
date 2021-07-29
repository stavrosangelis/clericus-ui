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
  updateDocumentTitle,
  renderLoader,
  outputRelationTypes,
  outputDate,
} from '../helpers';
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
  eventsPagination: state.eventsPagination,
  eventsFilters: state.eventsFilters,
  eventsRelationship: state.eventsRelationship,
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

class Events extends Component {
  constructor(props) {
    super(props);
    const { eventsPagination } = this.props;
    this.state = {
      loading: true,
      eventsLoading: true,
      items: [],
      page: eventsPagination.page,
      gotoPage: eventsPagination.page,
      limit: eventsPagination.limit,
      totalPages: 0,
      totalItems: 0,
      searchVisible: true,
      simpleSearchTerm: eventsPagination.simpleSearchTerm,
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
    this.updateEventsRelationship = this.updateEventsRelationship.bind(this);
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
    const { eventsFilters } = this.props;
    if (prevProps.eventsFilters.eventType !== eventsFilters.eventType) {
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

  updateType(val) {
    const { updateFilters: updateFiltersFn } = this.props;
    const payload = {
      eventType: val,
    };
    this.setState(payload);
    updateFiltersFn('events', payload);
  }

  async load() {
    const { eventsFilters } = this.props;
    const { page, limit, simpleSearchTerm } = this.state;
    this.setState({
      eventsLoading: true,
    });
    const filters = eventsFilters;
    const params = {
      page,
      limit,
      eventType: filters.eventType,
      temporals: filters.temporals,
    };
    if (simpleSearchTerm !== '') {
      params.label = simpleSearchTerm;
    }
    const url = `${process.env.REACT_APP_APIPATH}ui-events`;
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
      const events = responseData.data;
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
          eventsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: events,
        });
        // this.updateEventsRelationship(events);
      }
    }
  }

  async simpleSearch(e) {
    e.preventDefault();
    const { simpleSearchTerm, page, limit } = this.state;
    const { eventsFilters: filters } = this.props;
    if (simpleSearchTerm.length < 2) {
      return false;
    }
    this.updateStorePagination({
      simpleSearchTerm,
    });
    this.setState({
      eventsLoading: true,
    });
    const params = {
      label: simpleSearchTerm,
      page,
      limit,
      eventType: filters.eventType,
      temporals: filters.temporals,
    };
    const url = `${process.env.REACT_APP_APIPATH}ui-events`;
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
      const events = responseData.data;
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
          eventsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: events,
        });
        // this.updateEventsRelationship(events);
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

  async updateEventsRelationship() {
    const {
      eventsFilters: filters,
      setRelationshipParams: setRelationshipParamsFn,
    } = this.props;
    const { page, limit } = this.state;
    const params = {
      page,
      limit,
      temporals: filters.temporals,
    };
    const url = `${process.env.REACT_APP_APIPATH}ui-events-active-filters`;
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
        events: responseData.data.events.map((item) => item),
      };
      setRelationshipParamsFn('events', payload);
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
    setPaginationParamsFn('events', payload);
  }

  toggleHelp() {
    const { helpVisible } = this.state;
    this.setState({
      helpVisible: !helpVisible,
    });
  }

  renderItems() {
    const { items, simpleSearchTerm } = this.state;
    const { eventsPagination } = this.props;
    let outputObj = [];
    const output = [];
    if (items.length > 0) {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const { label } = item;
        const description = [];

        let thumbnailImage = [];
        const thumbnailURL = null;
        if (thumbnailURL !== null) {
          thumbnailImage = (
            <img
              src={thumbnailURL}
              className="events-list-thumbnail img-fluid img-thumbnail"
              alt={label}
            />
          );
        }

        if (typeof item.people !== 'undefined' && item.people.length > 0) {
          const peopleLabels = item.people.map((o, oi) => {
            const personTermLabel = outputRelationTypes(o.term.label);
            const br =
              oi > 0 ? (
                <small>
                  ,
                  <br />
                </small>
              ) : (
                []
              );
            const personOutput = (
              <small key={o._id}>
                {br}
                <i>{personTermLabel}</i> <span style={{ width: '10px' }} />{' '}
                <b>{o.ref.label}</b>
              </small>
            );
            return personOutput;
          });
          if (peopleLabels.length > 0) {
            description.push(<div key="people">{peopleLabels}</div>);
          }
        }
        if (
          typeof item.organisations !== 'undefined' &&
          item.organisations.length > 0
        ) {
          const organisationLabels = item.organisations.map((o) => {
            const orgTermLabel = outputRelationTypes(o.term.label);
            const organisationType =
              o.ref.organisationType !== ''
                ? ` [${o.ref.organisationType}]`
                : '';
            return (
              <small key={o._id}>
                <i>{orgTermLabel}</i> <b>{o.ref.label}</b>
                {organisationType}
              </small>
            );
          });
          if (organisationLabels.length > 0) {
            description.push(
              <div key="organisations">{organisationLabels}</div>
            );
          }
        }
        if (typeof item.temporal !== 'undefined' && item.temporal.length > 0) {
          const temporalLabels = item.temporal.map((t) => {
            const temp = t.ref;
            let tLabel = '';
            if (
              typeof temp.startDate !== 'undefined' &&
              temp.startDate !== ''
            ) {
              tLabel = outputDate(temp.startDate);
            }
            if (
              typeof temp.endDate !== 'undefined' &&
              temp.endDate !== '' &&
              temp.endDate !== temp.startDate
            ) {
              tLabel += ` - ${outputDate(temp.endDate)}`;
            }
            return tLabel;
          });
          if (temporalLabels.length > 0) {
            const temporalLabel = temporalLabels.join(' | ');
            description.push(
              <div key="temp">
                <i className="fa fa-calendar-o" />{' '}
                <small key="dates">{temporalLabel}</small>
              </div>
            );
          }
        }
        if (typeof item.spatial !== 'undefined' && item.spatial.length > 0) {
          const spatialLabels = item.spatial.map((s) => {
            const spatial = s.ref;
            return spatial.label;
          });
          if (spatialLabels.length > 0) {
            const spatialLabel = spatialLabels.join(' | ');
            description.push(
              <div key="spatial">
                <i className="fa fa-map" /> {spatialLabel}
              </div>
            );
          }
        }

        const link = `/event/${item._id}`;
        const outputItem = (
          <ListGroupItem key={i}>
            <Link to={link} href={link}>
              {thumbnailImage}
            </Link>
            <Link to={link} href={link}>
              {label}
            </Link>
            {description}
          </ListGroupItem>
        );
        output.push(outputItem);
      }
      outputObj = (
        <div className="events-list">
          <ListGroup>{output}</ListGroup>
        </div>
      );
    } else {
      let query = '';
      if (simpleSearchTerm !== '') {
        query = <b>&quot;{eventsPagination.simpleSearchTerm}&quot;</b>;
      }
      const item = (
        <div key="no-results" className="col-12">
          <Card style={{ marginBottom: '15px' }}>
            <CardBody>
              <h5>No results found</h5>
              <p>There are no events matching your query {query}</p>
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
      eventsLoading,
      searchVisible,
      simpleSearchTerm,
      totalItems,
      helpVisible,
    } = this.state;
    const { eventsFilters, eventsRelationship } = this.props;
    const heading = 'Events';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-date', active: true, path: '' },
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
            pageType="events"
          />
        </Suspense>
      );
      let events = (
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      );
      if (!eventsLoading) {
        events = this.renderItems();
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
              name="events"
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

      const filterType = ['eventType', 'temporals'];
      content = (
        <div>
          <div className="row">
            <div className="col-xs-12 col-sm-4">
              <Suspense fallback={renderLoader()}>
                <Filters
                  name="events"
                  filterType={filterType}
                  filtersSet={eventsFilters}
                  relationshipSet={eventsRelationship}
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
              {events}
              {pageActions}
              <HelpArticle
                permalink="events-help"
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
Events.defaultProps = {
  eventsPagination: {
    limit: 25,
    page: 1,
    simpleSearchTerm: '',
  },
  eventsFilters: {
    eventType: '',
    temporals: {
      startDate: '',
      endDate: '',
      dateType: 'exact',
    },
  },
  eventsRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
  updateFilters: () => {},
  setRelationshipParams: () => {},
  setPaginationParams: () => {},
};
Events.propTypes = {
  eventsPagination: PropTypes.shape({
    limit: PropTypes.number,
    page: PropTypes.number,
    simpleSearchTerm: PropTypes.string,
  }),
  eventsFilters: PropTypes.shape({
    eventType: PropTypes.string,
    temporals: PropTypes.shape({
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      dateType: PropTypes.string,
    }),
  }),
  eventsRelationship: PropTypes.shape({
    classpieces: PropTypes.array,
    events: PropTypes.array,
    organisations: PropTypes.array,
    people: PropTypes.array,
    temporals: PropTypes.array,
    spatials: PropTypes.array,
  }),
  updateFilters: PropTypes.func,
  setRelationshipParams: PropTypes.func,
  setPaginationParams: PropTypes.func,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(Events);
