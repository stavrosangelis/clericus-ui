import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import {
  Spinner,
  ListGroup, ListGroupItem,
  Collapse,
  Card, CardBody,
  Tooltip
} from 'reactstrap';
import { Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {updateDocumentTitle,renderLoader} from '../helpers';
import HelpArticle from '../components/help-article';

import {connect} from "react-redux";
import {
  setPaginationParams,
  setRelationshipParams,
  updateFilters
} from "../redux/actions";

const Filters = lazy(() => import('../components/filters'));
const SearchForm = lazy(() => import('../components/search-form'));
const PageActions = lazy(() => import('../components/page-actions'));

const mapStateToProps = state => {
  return {
    eventsPagination: state.eventsPagination,
    eventsFilters: state.eventsFilters,
    eventsRelationship: state.eventsRelationship,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params)),
    setRelationshipParams: (type,params) => dispatch(setRelationshipParams(type,params)),
    updateFilters: (type,params) => dispatch(updateFilters(type,params))
  }
}


class Events extends Component {
  constructor(props) {
    super(props);
    let eventsPagination = this.props.eventsPagination;
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
      eventType: this.props.eventsFilters.eventType,
      helpVisible: false
    }

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

  updateType(val) {
    let payload = {
      eventType: val
    }
    this.setState(payload);
    this.props.updateFilters("events",payload);
  }

  async load() {
    this.setState({
      eventsLoading: true
    });
    let filters = this.props.eventsFilters;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      eventType: filters.eventType,
      temporals: filters.temporals,
    };
    if (this.state.simpleSearchTerm!=="") {
      params.label = this.state.simpleSearchTerm;
    }
    let url = process.env.REACT_APP_APIPATH+'ui-events';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params,
      cancelToken: this.cancelSource1.token
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
      console.log(error)
	  });
    if (typeof responseData!=="undefined") {
      let events = responseData.data;
      let currentPage = 1;
      if (responseData.currentPage>0) {
        currentPage = responseData.currentPage;
      }
      if (currentPage!==1 && currentPage>responseData.totalPages && responseData.totalPages>0) {
        this.updatePage(responseData.totalPages);
      }
      else {
        this.setState({
          loading: false,
          eventsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: events
        });
        //this.updateEventsRelationship(events);
      }
    }
  }

  async simpleSearch(e) {
    e.preventDefault();
    if (this.state.simpleSearchTerm.length<2) {
      return false;
    }
    this.updateStorePagination({simpleSearchTerm:this.state.simpleSearchTerm});
    this.setState({
      eventsLoading: true
    });
    let filters = this.props.eventsFilters;
    let params = {
      label: this.state.simpleSearchTerm,
      page: this.state.page,
      limit: this.state.limit,
      eventType: filters.eventType,
      temporals: filters.temporals,
    };
    let url = process.env.REACT_APP_APIPATH+'ui-events';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params,
      cancelToken: this.cancelSource2.token
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
      console.log(error);
	  });
    if (typeof responseData!=="undefined") {
      let events = responseData.data;
      let currentPage = 1;
      if (responseData.currentPage>0) {
        currentPage = responseData.currentPage;
      }
      if (currentPage!==1 && currentPage>responseData.totalPages && responseData.totalPages>0) {
        this.updatePage(responseData.totalPages);
      }
      else {
        this.setState({
          loading: false,
          eventsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: events
        });
        //this.updateEventsRelationship(events);
      }
    }
  }

  clearSearch() {
    this.updateStorePagination({simpleSearchTerm:"", page: 1});
    this.setState({
      simpleSearchTerm: '',
      page: 1,
    }, ()=>{
      this.load();
    })
  }

  toggleSearch() {
    this.setState({
      searchVisible: !this.state.searchVisible
    })
  }

  async updateEventsRelationship() {
    let filters = this.props.eventsFilters;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      temporals: filters.temporals,
    };
    let url = process.env.REACT_APP_APIPATH+'ui-events-active-filters';
    let responseData = await axios({
      method: 'post',
      url: url,
      crossDomain: true,
      params: params,
      cancelToken: this.cancelSource3.token
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
	  });
    if(typeof responseData!=="undefined" && responseData.status) {
      let payload = {
        events: responseData.data.events.map(item=>item),
      }
      this.props.setRelationshipParams("events",payload);
    }
  }

  updatePage(e) {
    if (e>0 && e!==this.state.page) {
      this.updateStorePagination({page:e});
      this.setState({
        page: e,
        gotoPage: e,
      }, () => {
        this.load();
      });
    }
  }

  gotoPage(e) {
    e.preventDefault();
    let gotoPage = this.state.gotoPage;
    let page = this.state.page;
    if (gotoPage>0 && gotoPage!==page) {
      this.updateStorePagination({page:e});
      this.setState({
        page: gotoPage
      }, () => {
        this.load();
      });
    }
  }

  updateLimit(limit) {
    this.setState({
      limit: limit
    }, () => {
      this.load();
    });
    this.updateStorePagination({limit:limit});
  }

  updateStorePagination({limit=null, page=null, simpleSearchTerm=null}) {
    let payload = {};
    if (limit!==null) {
      payload.limit = limit;
    }
    if (page!==null) {
      payload.page = page;
    }
    if (simpleSearchTerm!==null) {
      payload.simpleSearchTerm = simpleSearchTerm;
    }
    this.props.setPaginationParams("events", payload);
  }

  renderItems() {
    let outputObj = [];
    let output = [];
    if (this.state.items.length>0) {
      for (let i=0;i<this.state.items.length; i++) {
        let item = this.state.items[i];
        let label = item.label;

        let thumbnailImage = [];
        let thumbnailURL = null;
        if (thumbnailURL!==null) {
          thumbnailImage = <img src={thumbnailURL} className="events-list-thumbnail img-fluid img-thumbnail" alt={label} />
        }
        let link = "/event/"+item._id;
        let outputItem = <ListGroupItem key={i}>
          <Link to={link} href={link}>{thumbnailImage}</Link>
          <Link to={link} href={link}>{label}</Link>
        </ListGroupItem>;
        output.push(outputItem);
      }
      outputObj = <div className="events-list"><ListGroup>{output}</ListGroup></div>;
    }
    else {
      let query = "";
      if (this.state.simpleSearchTerm!=="") {
        query = <b>"{this.props.eventsPagination.simpleSearchTerm}"</b>;
      }
      let item = <div key='no-results' className="col-12">
        <Card style={{marginBottom: '15px'}}>
          <CardBody>
            <h5>No results found</h5>
            <p>There are no events matching your query {query}</p>
          </CardBody>
        </Card>
      </div>
      outputObj.push(item);
    }
    return outputObj;
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  toggleHelp() {
    this.setState({
      helpVisible: !this.state.helpVisible
    });
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.eventsFilters.eventType!==this.props.eventsFilters.eventType) {
      this.load();
    }
  }

  componentWillUnmount() {
    this.cancelSource1.cancel('api request cancelled');
    this.cancelSource2.cancel('api request cancelled');
    this.cancelSource3.cancel('api request cancelled');
  }

  render() {
    let heading = "Events";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-date", active: true, path: ""}
    ];
    updateDocumentTitle(heading);
    let content = <div>
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
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>

    if (!this.state.loading) {
      let pageActions = <Suspense fallback={renderLoader()}>
        <PageActions
          limit={this.state.limit}
          current_page={this.state.page}
          gotoPageValue={this.state.gotoPage}
          total_pages={this.state.totalPages}
          updatePage={this.updatePage}
          gotoPage={this.gotoPage}
          handleChange={this.handleChange}
          updateLimit={this.updateLimit}
          pageType="events"
        />
      </Suspense>
      let events = <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
      if (!this.state.eventsLoading) {
        events = this.renderItems();
      }
      let searchElements = [
        {element: "label", label: "Label", inputType: "text", inputData: null},
      ]

      let searchBox = <Collapse isOpen={this.state.searchVisible}>
        <Suspense fallback={renderLoader()}>
          <SearchForm
            name="events"
            searchElements={searchElements}
            simpleSearchTerm={this.state.simpleSearchTerm}
            simpleSearch={this.simpleSearch}
            clearSearch={this.clearSearch}
            handleChange={this.handleChange}
            adadvancedSearchEnable={false}
            />
        </Suspense>
      </Collapse>

      let filterType = ["eventType", "temporals"];
      content = <div>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <Suspense fallback={renderLoader()}>
              <Filters
                name="events"
                filterType = {filterType}
                filtersSet={this.props.eventsFilters}
                relationshipSet={this.props.eventsRelationship}
                updateType={this.updateType}
                updatedata={this.load}/>
            </Suspense>
          </div>
          <div className="col-xs-12 col-sm-8">
            <h2>{heading}
              <Tooltip placement="top" target="search-tooltip">
                Search
              </Tooltip>
              <div className="tool-box">
                <div className="tool-box-text">Total: {this.state.totalItems}</div>
                <div className="action-trigger" onClick={()=>this.toggleSearch()} id="search-tooltip">
                  <i className="fa fa-search" />
                </div>
                <div className="action-trigger" onClick={()=>this.toggleHelp()} title="Help">
                  <i className="fa fa-question-circle" />
                </div>
              </div>
            </h2>
            {searchBox}
            {pageActions}
            {events}
            {pageActions}
            <HelpArticle permalink={"events-help"} visible={this.state.helpVisible} toggle={this.toggleHelp}/>
          </div>
        </div>
      </div>
    }
    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
      </div>
    )

  }
}

export default Events = connect(mapStateToProps, mapDispatchToProps)(Events);
