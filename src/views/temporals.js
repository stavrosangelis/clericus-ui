import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import { Spinner, ListGroup, ListGroupItem, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import Breadcrumbs from '../components/breadcrumbs';
import { updateDocumentTitle, renderLoader } from '../helpers';

import { setPaginationParams, setRelationshipParams } from '../redux/actions';

const mapStateToProps = (state) => ({
  temporalsPagination: state.temporalsPagination,
  temporalsFilters: state.temporalsFilters,
  temporalsRelationship: state.temporalsRelationship,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
    setRelationshipParams: (type, params) =>
      dispatch(setRelationshipParams(type, params)),
  };
}

const Filters = lazy(() => import('../components/filters'));
const PageActions = lazy(() => import('../components/page-actions'));

class Temporals extends Component {
  constructor(props) {
    super(props);
    const { temporalsPagination } = this.props;

    this.state = {
      loading: true,
      temporalsLoading: true,
      items: [],
      page: temporalsPagination.page,
      gotoPage: temporalsPagination.page,
      limit: temporalsPagination.limit,
      totalPages: 0,
      totalItems: 0,
    };

    this.load = this.load.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateTemporalsRelationship = this.updateTemporalsRelationship.bind(
      this
    );

    // cancelTokens
    const cancelToken1 = axios.CancelToken;
    this.cancelSource1 = cancelToken1.source();
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.cancelSource1.cancel('api request cancelled');
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
    const { temporalsFilters: filters } = this.props;
    const { page, limit, simpleSearchTerm } = this.state;
    this.setState({
      temporalsLoading: true,
    });
    const params = {
      page,
      limit,
      temporals: filters.temporals,
    };
    if (simpleSearchTerm !== '') {
      params.label = simpleSearchTerm;
    }
    const url = `${process.env.REACT_APP_APIPATH}ui-temporals`;
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
      const temporals = responseData.data;
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
          temporalsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: temporals,
        });
      }
    }
  }

  updateTemporalsRelationship() {
    const {
      temporalsRelationship: payload,
      setRelationshipParams: setRelationshipParamsFn,
    } = this.props;
    setRelationshipParamsFn('temporals', payload);
    /*
    if(temporals===null){
      return false;
    }

    let id_temporals = temporals.map(item =>{
      return item._id;
    });

    let context = this;
    let params = {
      _ids: id_temporals,
    };
    let url = process.env.REACT_APP_APIPATH+'ui-temporals-active-filters';
    axios({
      method: 'post',
      url: url,
      crossDomain: true,
      data: params
    })
	  .then(function (response) {
      let responseData = response.data.data;

      let payload = {
        events: responseData.events.map(item=>{return item._id}),
        organisations: responseData.organisations.map(item=>{return item._id}),
        people: responseData.people.map(item=>{return item._id}),
        classpieces: responseData.resources.map(item=>{return item._id}),
        temporals: responseData.temporals.map(item=>{return item._id}),
        spatials: responseData.spatials.map(item=>{return item._id}),
      }

      setTimeout(function() {
        context.props.setRelationshipParams("temporals",payload);
      },10)

	  })
	  .catch(function (error) {
	  });
    */
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
    setPaginationParamsFn('temporals', payload);
  }

  renderItems() {
    const { items } = this.state;
    let outputObj = [];
    const output = [];
    if (items.length > 0) {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const { label } = item;

        let thumbnailImage = [];
        const thumbnailURL = null; // getEventThumbnailURL(item);
        if (thumbnailURL !== null) {
          thumbnailImage = (
            <img
              src={thumbnailURL}
              className="events-list-thumbnail img-fluid img-thumbnail"
              alt={label}
            />
          );
        }
        const link = `/temporal/${item._id}`;
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
        <div className="events-list">
          <ListGroup>{output}</ListGroup>
        </div>
      );
    } else {
      const item = (
        <div key="no-results" className="col-12">
          <Card style={{ marginBottom: '15px' }}>
            <CardBody>
              <h5>No results found</h5>
              <p>There are no dates matching your query</p>
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
      temporalsLoading,
      totalItems,
    } = this.state;
    const { temporalsFilters, temporalsRelationship } = this.props;
    const heading = 'Dates';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-clock', active: true, path: '' },
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
            sort={false}
            current_page={page}
            gotoPageValue={gotoPage}
            total_pages={totalPages}
            updatePage={this.updatePage}
            gotoPage={this.gotoPage}
            handleChange={this.handleChange}
            updateLimit={this.updateLimit}
            pageType="temporals"
          />
        </Suspense>
      );
      let temporals = (
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      );
      if (!temporalsLoading) {
        temporals = this.renderItems();
      }

      const filterType = ['temporals'];
      content = (
        <div>
          <div className="row">
            <div className="col-xs-12 col-sm-4">
              <Suspense fallback={renderLoader()}>
                <Filters
                  name="temporals"
                  filterType={filterType}
                  filtersSet={temporalsFilters}
                  relationshipSet={temporalsRelationship}
                  updatedata={this.load}
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
              {temporals}
              {pageActions}
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

Temporals.defaultProps = {
  temporalsPagination: {
    limit: 25,
    page: 1,
    simpleSearchTerm: '',
  },
  temporalsRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
  temporalsFilters: {
    temporals: {
      startDate: '',
      endDate: '',
      dateType: 'exact',
    },
  },
  setRelationshipParams: () => {},
  setPaginationParams: () => {},
};
Temporals.propTypes = {
  temporalsPagination: PropTypes.shape({
    limit: PropTypes.number,
    page: PropTypes.number,
    simpleSearchTerm: PropTypes.string,
  }),
  temporalsRelationship: PropTypes.shape({
    classpieces: PropTypes.array,
    events: PropTypes.array,
    organisations: PropTypes.array,
    people: PropTypes.array,
    temporals: PropTypes.array,
    spatials: PropTypes.array,
  }),
  temporalsFilters: PropTypes.shape({
    temporals: PropTypes.shape({
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      dateType: PropTypes.string,
    }),
  }),
  setRelationshipParams: PropTypes.func,
  setPaginationParams: PropTypes.func,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(Temporals);
