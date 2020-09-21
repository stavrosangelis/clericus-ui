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
import {getPersonThumbnailURL,updateDocumentTitle,renderLoader} from '../helpers';
import defaultThumbnail from '../assets/images/spcc.jpg';
import HelpArticle from '../components/help-article';

import {connect} from "react-redux";
import {
  setPaginationParams,
  setRelationshipParams
} from "../redux/actions";

const Filters = lazy(() => import('../components/filters'));
const SearchForm = lazy(() => import('../components/search-form'));
const PageActions = lazy(() => import('../components/page-actions'));

const mapStateToProps = state => {
  let peopleFilters = state.peopleFilters || null;
  let peopleRelationship = state.peopleRelationship || null;
  return {
    peoplePagination: state.peoplePagination,
    peopleFilters: peopleFilters,
    peopleRelationship: peopleRelationship
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params)),
    setRelationshipParams: (type,params) => dispatch(setRelationshipParams(type,params))
  }
}


class People extends Component {
  constructor(props) {
    super(props);
    let peoplePagination = this.props.peoplePagination;
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
      helpVisible: false
    }

    this.load = this.load.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.advancedSearchSubmit = this.advancedSearchSubmit.bind(this);
    this.clearAdvancedSearch = this.clearAdvancedSearch.bind(this);
    this.updateAdvancedSearchInputs = this.updateAdvancedSearchInputs.bind(this);
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

  async load() {
    this.setState({
      peopleLoading: true
    });
    let filters = this.props.peopleFilters;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      events: filters.events,
      organisations: filters.organisations,
      temporals: filters.temporals,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
    };
    if (this.state.simpleSearchTerm!=="") {
      params.label = this.state.simpleSearchTerm;
    }
    else if (this.state.advancedSearchInputs.length>0) {
      for (let i=0; i<this.state.advancedSearchInputs.length; i++) {
        let searchInput = this.state.advancedSearchInputs[i];
        params[searchInput.select] = searchInput.input;
      }
    }
    let url = process.env.REACT_APP_APIPATH+'ui-people';
    let responseData = await axios({
      method: 'post',
      url: url,
      crossDomain: true,
      data: params,
      cancelToken: this.cancelSource1.token
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
      console.log(error);
	  });
    if (typeof responseData!=="undefined") {
      let people = responseData.data;
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
          peopleLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: people
        });
        this.updatePeopleRelationship();
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
      peopleLoading: true
    });

    let filters = this.props.peopleFilters;
    let params = {
      label: this.state.simpleSearchTerm,
      page: this.state.page,
      limit: this.state.limit,
      events: filters.events,
      organisations: filters.organisations,
      temporals: filters.temporals,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
    };
    let url = process.env.REACT_APP_APIPATH+'ui-people';
    let responseData = await axios({
      method: 'post',
      url: url,
      crossDomain: true,
      data: params,
      cancelToken: this.cancelSource2.token
    })
    .then(function (response) {
      return response.data.data;
    })
    .catch(function (error) {
    });
    if (typeof responseData!=="undefined") {
      let people = responseData.data;
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
          peopleLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: people
        });
        this.updatePeopleRelationship();
      }
    }
  }

  async advancedSearchSubmit(e) {
    e.preventDefault();
    this.updateStorePagination({
      simpleSearchTerm:this.state.simpleSearchTerm,
      advancedSearchInputs:this.state.advancedSearchInputs
    });
    this.setState({
      peopleLoading: true,
      simpleSearchTerm: ""
    })
    let filters = this.props.peopleFilters;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      events: filters.events,
      organisations: filters.organisations,
      temporals: filters.temporals,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
    };
    if (this.state.advancedSearchInputs.length>0) {
      let advancedParams = this.state.advancedSearchInputs.filter(i=>i.input!=="").map(item=>item);
      params.advancedSearch = advancedParams;
    }
    else {
      return false;
    }
    let url = process.env.REACT_APP_APIPATH+'ui-people';
    let responseData = await axios({
      method: 'post',
      url: url,
      crossDomain: true,
      data: params,
      cancelToken: this.cancelSource3.token
    })
    .then(function (response) {
      return response.data.data;
    })
    .catch(function (error) {
    });
    if (typeof responseData!=="undefined") {
      let people = responseData.data;
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
          peopleLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: people
        });
        this.updatePeopleRelationship();
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
    });
  }

  clearAdvancedSearch() {
    let payload = {advancedSearchInputs: []}
    this.updateStorePagination(payload);
    this.setState(payload, ()=>{
      this.load();
    });
  }

  updateAdvancedSearchInputs(advancedSearchInputs) {
    let payload = {advancedSearchInputs: advancedSearchInputs}
    this.updateStorePagination(payload);
    this.setState(payload);
  }

  async updatePeopleRelationship() {
    let filters = this.props.peopleFilters;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      events: filters.events,
      organisations: filters.organisations,
      temporals: filters.temporals,
    };
    if (this.state.simpleSearchTerm!=="") {
      params.label = this.state.simpleSearchTerm;
    }
    else if (this.state.advancedSearchInputs.length>0) {
      for (let i=0; i<this.state.advancedSearchInputs.length; i++) {
        let searchInput = this.state.advancedSearchInputs[i];
        params[searchInput.select] = searchInput.input;
      }
    }
    let url = process.env.REACT_APP_APIPATH+'ui-person-active-filters';
    let responseData = await axios({
      method: 'post',
      url: url,
      crossDomain: true,
      data: params,
      cancelToken: this.cancelSource4.token
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
      console.log(error);
	  });
    if(typeof responseData!=="undefined" && responseData.status) {
      let payload = {
        events: responseData.data.events.map(item=>{return item}),
        organisations: responseData.data.organisations.map(item=>item),
      }
      this.props.setRelationshipParams("people",payload);
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

  updateSort(orderField) {
    let orderDesc = false;
    if (orderField === this.state.orderField) {
      orderDesc = !this.state.orderDesc;
    }
    let update = {
      orderField: orderField,
      orderDesc: orderDesc,
    };
    this.updateStorePagination(update);
    this.setState(update, () => {
      this.load();
    });
  }

  updateStorePagination({limit=null, page=null, orderField=null, orderDesc=null, simpleSearchTerm=null, advancedSearchInputs=null}) {
    let payload = {};
    if (limit!==null) {
      payload.limit = limit;
    }
    if (page!==null) {
      payload.page = page;
    }
    if (orderField!==null) {
      payload.orderField = orderField;
    }
    if (orderDesc!==null) {
      payload.orderDesc = orderDesc;
    }
    if (simpleSearchTerm!==null) {
      payload.simpleSearchTerm = simpleSearchTerm;
    }
    if (advancedSearchInputs!==null) {
      payload.advancedSearchInputs = advancedSearchInputs;
    }
    this.props.setPaginationParams("people", payload);
  }

  renderItems() {
    let outputObj = [];
    let output = [];
    if (this.state.items.length>0) {
      for (let i=0;i<this.state.items.length; i++) {
        let item = this.state.items[i];
        let label = item.firstName;
        if (typeof item.middleName!=="undefined" && item.middleName!==null && item.middleName!=="") {
          label += " "+item.middleName;
        }
        label += " "+item.lastName;
        if (item.honorificPrefix.length>0) {
          let labelHP = item.honorificPrefix.filter(i=>i!=="").join(", ");
          if (labelHP!=="") {
            labelHP = `(${labelHP})`;
          }
          label = `${labelHP} ${label}`;
        }

        let thumbnailImage = <img src={defaultThumbnail} className="people-list-thumbnail img-fluid img-thumbnail" alt={label} />;
        let thumbnailURLs = getPersonThumbnailURL(item);
        if (typeof thumbnailURLs.thumbnails!=="undefined" && thumbnailURLs.thumbnails.length>0) {
          thumbnailImage = <img src={thumbnailURLs.thumbnails[0]} className="people-list-thumbnail img-fluid img-thumbnail" alt={label} />
        }
        let link = "/person/"+item._id;
        let outputItem = <ListGroupItem key={i} onContextMenu={(e)=>{e.preventDefault();return false;}}>
          <Link to={link} href={link}>{thumbnailImage}</Link>
          <Link to={link} href={link}>{label}</Link>
        </ListGroupItem>;
        output.push(outputItem);
      }
      outputObj = <div className="people-list"><ListGroup>{output}</ListGroup></div>;
    }
    else {
      let query = "";
      if (this.state.simpleSearchTerm!=="") {
        query = <b>"{this.props.peoplePagination.simpleSearchTerm}"</b>;
      }
      let item = <div key='no-results' className="col-12">
        <Card style={{marginBottom: '15px'}}>
          <CardBody>
            <h5>No results found</h5>
            <p>There are no people matching your query {query}</p>
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

  componentWillUnmount() {
    this.cancelSource1.cancel('api request cancelled');
    this.cancelSource2.cancel('api request cancelled');
    this.cancelSource3.cancel('api request cancelled');
    this.cancelSource4.cancel('api request cancelled');
  }

  render() {
    let heading = "People";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-users", active: true, path: ""}
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
          sort={true}
          orderField={this.state.orderField}
          orderDesc={this.state.orderDesc}
          current_page={this.state.page}
          gotoPageValue={this.state.gotoPage}
          total_pages={this.state.totalPages}
          updatePage={this.updatePage}
          gotoPage={this.gotoPage}
          handleChange={this.handleChange}
          updateLimit={this.updateLimit}
          updateSort={this.updateSort}
          pageType="people"
        />
      </Suspense>
      let people = <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
      if (!this.state.peopleLoading) {
        people = this.renderItems();
      }
      let searchElements = [
        { element: "honorificPrefix", label: "Honorific prefix",
          inputType: "text", inputData: null},
        { element: "firstName", label: "First name",
          inputType: "text", inputData: null},
        //{element: "middleName", label: "Middle name", inputType: "text", inputData: null},
        { element: "lastName", label: "Last name",
          inputType: "text", inputData: null},
        { element: "fnameSoundex", label: "First name sounds like",
          inputType: "text", inputData: null},
        { element: "lnameSoundex", label: "Last name sounds like",
          inputType: "text", inputData: null},
        { element: "description", label: "Description",
          inputType: "text", inputData: null},
        /* select option templete
        { element: "orderField", label: "Order Field",
          inputType: "select", inputData: [ {label: "First Name", value: "firstName"},
                                            {label: "Last Name", value: "lastName"} ]},
        */
      ]
      let advancedSearchInputsLength = this.state.advancedSearchInputs.length;
      let searchBox = <Collapse isOpen={this.state.searchVisible}>
        <Suspense fallback={renderLoader()}>
          <SearchForm
            searchElements={searchElements}
            simpleSearchTerm={this.state.simpleSearchTerm}
            simpleSearch={this.simpleSearch}
            clearSearch={this.clearSearch}
            handleChange={this.handleChange}
            adadvancedSearchEnable={true}
            advancedSearch={this.advancedSearchSubmit}
            updateAdvancedSearchRows={this.updateAdvancedSearchRows}
            clearAdvancedSearch={this.clearAdvancedSearch}
            updateAdvancedSearchInputs={this.updateAdvancedSearchInputs}
            advancedSearchInputsLength={advancedSearchInputsLength}
            advancedSearchInputs={this.state.advancedSearchInputs}
            />
        </Suspense>
      </Collapse>

      let filterType = ["events", "organisations", "temporals"];
      content = <div>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <Suspense fallback={renderLoader()}>
              <Filters
                name="people"
                filterType = {filterType}
                filtersSet={this.props.peopleFilters}
                relationshipSet={this.props.peopleRelationship}
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
            {people}
            {pageActions}
            <HelpArticle permalink={"people-help"} visible={this.state.helpVisible} toggle={this.toggleHelp}/>
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

export default People = connect(mapStateToProps, mapDispatchToProps)(People);
