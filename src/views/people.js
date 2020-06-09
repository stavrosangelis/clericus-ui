import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  ListGroup, ListGroupItem,
  Collapse,
  Tooltip
} from 'reactstrap';
import { Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getPersonThumbnailURL, getInfoFromSort, getInfoFromFilterObj} from '../helpers/helpers';
import PageActions from '../components/page-actions';
import Filters from '../components/filters';
import SearchForm from '../components/search-form';

import {connect} from "react-redux";
import {
  setPaginationParams,
  setRelationshipParams
} from "../redux/actions";

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

    this.state = {
      loading: true,
      peopleLoading: true,
      items: [],
      page: 1,
      gotoPage: 1,
      limit: 50,
      sort: "asc_firstName",
      totalPages: 0,
      totalItems: 0,
      searchVisible: true,
      simpleSearchTerm: '',
      advancedSearchInputs: [],
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
  }

  async load() {
    this.setState({
      peopleLoading: true
    })
    let filterInfo = getInfoFromFilterObj("people", this.props.peopleFilters);
    let orderField = getInfoFromSort("orderField", this.state.sort);
    let orderDesc = getInfoFromSort("orderDesc", this.state.sort);
    
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      //eventType: eventsType,
      events: filterInfo.events,
      organisations: filterInfo.organisations,
      temporals: filterInfo.temporals,
      //organisationType: organisationsType,
      //people: this.props.peopleFilters.people,
      //resources: this.props.peopleFilters.classpieces,
      //spatial: this.props.peopleFilters.spatials,
      orderField: orderField,
      orderDesc: orderDesc,
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
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
      console.log(error);
	  });
    let people = responseData.data;
    let currentPage = 1;
    if (responseData.currentPage>0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage>1 && responseData.data.length===0) {
      this.setState({
        page: currentPage-1
      });
      let context = this;
      setTimeout(() =>{
        context.load();
      },10);
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

  async updatePeopleRelationship() {
    let filterInfo = getInfoFromFilterObj("people", this.props.peopleFilters);
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      //eventType: eventsType,
      events: filterInfo.events,
      organisations: filterInfo.organisations,
      temporals: filterInfo.temporals,
      //organisationType: organisationsType,
      //people: this.props.peopleFilters.people,
      //resources: this.props.peopleFilters.classpieces,
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
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
      console.log(error);
	  });

    /*
    let responseDataType = ["events","organisations","people","resources","spatials"];
    let payload = {};
    for(let i=0;i<responseDataType.length;i++) {
      if(typeof responseData[`${responseDataType[i]}`] !== "undefined") {
        let name =`${responseDataType[i]}`;
        if(responseDataType[i]==="resources") {
          name = "classpieces";
        }
        payload[name] = responseData[`${responseDataType[i]}`].map(item=>{return item._id});
      }
    }
    */
    let payload = {
      events: responseData.events.map(item=>{return item}),
      organisations: responseData.organisations.map(item=>{return item._id}),
      people: responseData.people.map(item=>{return item._id}),
      classpieces: responseData.resources.map(item=>{return item._id}),
      //temporals: responseData.temporals.map(item=>{return item._id}),
      //spatials: responseData.spatials.map(item=>{return item._id}),
    }
    this.props.setRelationshipParams("people",payload);
  }

  async simpleSearch(e) {
    e.preventDefault();
    if (this.state.simpleSearchTerm.length<2) {
      return false;
    }
    this.setState({
      peopleLoading: true
    });
    
    let filterInfo = getInfoFromFilterObj("people", this.props.peopleFilters);
    let orderField = getInfoFromSort("orderField", this.state.sort);
    let orderDesc = getInfoFromSort("orderDesc", this.state.sort);

    let params = {
      label: this.state.simpleSearchTerm,
      page: this.state.page,
      limit: this.state.limit,
      orderField: orderField,
      orderDesc: orderDesc,
      events: filterInfo.events,
      organisations: filterInfo.organisations,
      temporals: filterInfo.temporals,
    };
    let url = process.env.REACT_APP_APIPATH+'ui-people';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
	  });

    let people = responseData.data;
    let newPeople = [];
    for (let i=0;i<people.length; i++) {
      let person = people[i];
      person.checked = false;
      newPeople.push(person);
    }
    let currentPage = 1;
    if (responseData.currentPage>0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage>1 && responseData.data.length===0) {
      this.setState({
        page: currentPage-1
      });
      let context = this;
      setTimeout(function() {
        context.load();
      },10)
    }
    else {
      this.setState({
        loading: false,
        peopleLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        items: newPeople
      });
      this.updatePeopleRelationship();
    }
  }

  async advancedSearchSubmit(e) {
    e.preventDefault();
    this.setState({
      peopleLoading: true
    })
    let filterInfo = getInfoFromFilterObj("people", this.props.peopleFilters);
    let orderField = getInfoFromSort("orderField", this.state.sort);
    let orderDesc = getInfoFromSort("orderDesc", this.state.sort);
    let params = {
      page: 1,
      limit: this.state.limit,
      orderField: orderField,
      orderDesc: orderDesc,
      events: filterInfo.events,
      organisations: filterInfo.organisations,
      temporals: filterInfo.temporals,
    };
    //let queryRows = [];
    if (this.state.advancedSearchInputs.length>0) {
      for (let i=0; i<this.state.advancedSearchInputs.length; i++) {
        let searchInput = this.state.advancedSearchInputs[i];
        /*
        if (searchInput._id!=="default") {
          let queryRow = {};
          queryRow.field = searchInput.select;
          queryRow.qualifier = searchInput.qualifier;
          queryRow.term = searchInput.input;
          queryRow.boolean = searchInput.boolean;
          queryRows.push(queryRow);
        }
        */
        if(searchInput.input!==""){
          /*
          let queryRow = {};
          queryRow.field = searchInput.select;
          queryRow.qualifier = searchInput.qualifier;
          queryRow.term = searchInput.input;
          queryRow.boolean = searchInput.boolean;
          queryRows.push(queryRow);
          */
          params[`${searchInput.select}`] = searchInput.input;
        }
      }
      //params.query = queryRows;
    }
    else {
      return false;
    }
    let url = process.env.REACT_APP_APIPATH+'ui-people';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
	  });

    let people = responseData.data;
    let newPeople = [];
    for (let i=0;i<people.length; i++) {
      let person = people[i];
      person.checked = false;
      newPeople.push(person);
    }
    let currentPage = 1;
    if (responseData.currentPage>0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage>1 && responseData.data.length===0) {
      this.setState({
        page: currentPage-1
      });
      let context = this;
      setTimeout(function() {
        context.load();
      },10)
    }
    else {
      this.setState({
        loading: false,
        peopleLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        items: newPeople
      });
      this.updatePeopleRelationship();
    }
  }

  clearSearch() {
    this.setState({
      simpleSearchTerm: '',
      page: 1,
    }, ()=>{
      this.load();
    })
  }

  clearAdvancedSearch(defaultSearch) {
    this.setState({
      advancedSearchInputs: defaultSearch,
    }, ()=>{
      this.load();
    })
  }

  updateAdvancedSearchInputs(advancedSearchInputs) {
    this.setState({
      advancedSearchInputs: advancedSearchInputs,
    })
  }

  updatePage(e) {
    if (e>0 && e!==this.state.page) {
      this.setState({
        page: e,
        gotoPage: e,
      })
      this.updateStorePagination(null,e);
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateStorePagination(limit=null, page=null, sort=null) {
    if (limit===null) {
      limit = this.state.limit;
    }
    if (page===null) {
      page = this.state.page;
    }
    if(sort===null) {
      sort = this.state.sort;
    }
    let payload = {
      limit:limit,
      page:page,
      sort:sort,
    }
    this.props.setPaginationParams("people", payload);
  }

  gotoPage(e) {
    e.preventDefault();
    let gotoPage = this.state.gotoPage;
    let page = this.state.page;
    if (gotoPage>0 && gotoPage!==page) {
      this.setState({
        page: gotoPage
      })
      this.updateStorePagination(null,gotoPage,null);
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateLimit(limit) {
    this.setState({
      limit: limit
    })
    this.updateStorePagination(limit,null,null);
    let context = this;
    setTimeout(function(){
      context.load();
    },100)
  }
  
  updateSort(sort) {
    this.setState({
      sort: sort
    })
    this.updateStorePagination(null,null,sort);
    let context = this;
    setTimeout(function(){
      context.load();
    },100)
  }

  renderItems() {
    let output = [];
    for (let i=0;i<this.state.items.length; i++) {
      let item = this.state.items[i];
      let label = item.firstName;
      if (typeof item.middleName!=="undefined" && item.middleName!==null && item.middleName!=="") {
        label += " "+item.middleName;
      }
      label += " "+item.lastName;
      let thumbnailImage = [];
      let thumbnailURL = getPersonThumbnailURL(item);
      if (thumbnailURL!==null) {
        thumbnailImage = <img src={thumbnailURL} className="people-list-thumbnail img-fluid img-thumbnail" alt={label} />
      }
      let link = "/person/"+item._id;
      let outputItem = <ListGroupItem key={i}>
        <Link to={link} href={link}>{thumbnailImage}</Link>
        <Link to={link} href={link}>{label}</Link>
      </ListGroupItem>;
      output.push(outputItem);
    }
    return <div className="people-list"><ListGroup>{output}</ListGroup></div>;
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  toggleSearch() {
    this.setState({
      searchVisible: !this.state.searchVisible
    })
  }

  componentDidMount() {
    this.load();
  }

  render() {
    let heading = "People";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-users", active: true, path: ""}
    ];
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
      let pageActions = <PageActions
        limit={this.state.limit}
        sort={this.state.sort}
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

      let searchBox = <Collapse isOpen={this.state.searchVisible}>
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
          />
      </Collapse>

      content = <div>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <Filters
              name="people"
              filterType = {[
                {name: "organisations", layer: ["type","data"], compareData: {dataSet: "organisationType", typeSet: "labelId"}, typeFilterDisable: true},
                {name: "events", layer: ["type"], compareData: {dataSet: "eventType", typeSet: "_id"}, typeFilterDisable: true},
                {name: "temporals"},
                //{name: "spatials"},
                ]}
              filtersSet={this.props.peopleFilters}
              relationshipSet={this.props.peopleRelationship}
              decidingFilteringSet={!this.state.loading}
              updatedata={this.load}/>
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
              </div>
            </h2>
            {searchBox}
            {pageActions}
            {people}
            {pageActions}
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
