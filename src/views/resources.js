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
import {getResourceThumbnailURL, /*getInfoFromFilterObj*/} from '../helpers/helpers';
import PageActions from '../components/page-actions';
import Filters from '../components/filters';
import SearchForm from '../components/search-form';
import {updateDocumentTitle} from '../helpers/helpers';

import {connect} from "react-redux";
import {
  setPaginationParams,
  setRelationshipParams
} from "../redux/actions";

const mapStateToProps = state => {
  let resourcesFilters = state.resourcesFilters || null;
  let resourcesRelationship = state.resourcesRelationship || null;
  return {
    resourcesPagination: state.resourcesPagination,
    resourcesFilters: resourcesFilters,
    resourcesRelationship: resourcesRelationship
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params)),
    setRelationshipParams: (type,params) => dispatch(setRelationshipParams(type,params))
  }
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
      sort: "asc_label",
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
    this.updateResourcesRelationship = this.updateResourcesRelationship.bind(this);
  }

  async load() {
    this.setState({
      resourcesLoading: true
    })
    //let filterInfo = getInfoFromFilterObj("resources", this.props.resourcesFilters);
    //let orderField = getInfoFromSort("orderField", this.state.sort);
    //let orderDesc = getInfoFromSort("orderDesc", this.state.sort);
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      systemType: this.props.resourcesFilters.resources,
      //events: filterInfo.events,
      //organisations: filterInfo.organisations,
      //temporals: filterInfo.temporals,
      //organisationType: organisationsType,
      //people: this.props.resourcesFilters.people,
      //resources: this.props.resourcesFilters.classpieces,
      //spatial: this.props.resourcesFilters.spatials,
      //orderField: orderField,
      //orderDesc: orderDesc,
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
    let url = process.env.REACT_APP_APIPATH+'resources';
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
    let resources = responseData.data;
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
        resourcesLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        items: resources
      });
      this.updateResourcesRelationship();
    }
  }

  async updateResourcesRelationship() {
    let payload = this.props.resourcesRelationship;
    this.props.setRelationshipParams("resources",payload);
    /*
    let filterInfo = getInfoFromFilterObj("resources", this.props.resourcesFilters);
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      //eventType: eventsType,
      events: filterInfo.events,
      organisations: filterInfo.organisations,
      temporals: filterInfo.temporals,
      //organisationType: organisationsType,
      //people: this.props.resourcesFilters.people,
      //resources: this.props.resourcesFilters.classpieces,
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
    let url = process.env.REACT_APP_APIPATH+'ui-resource-active-filters';
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

    let payload = {
      events: responseData.events.map(item=>{return item}),
      organisations: responseData.organisations.map(item=>{return item._id}),
      people: responseData.people.map(item=>{return item._id}),
      classpieces: responseData.resources.map(item=>{return item._id}),
      //temporals: responseData.temporals.map(item=>{return item._id}),
      //spatials: responseData.spatials.map(item=>{return item._id}),
    }
    this.props.setRelationshipParams("resources",payload);
    */
  }

  async simpleSearch(e) {
    e.preventDefault();
    if (this.state.simpleSearchTerm.length<2) {
      return false;
    }
    this.setState({
      resourcesLoading: true
    });

    //let filterInfo = getInfoFromFilterObj("resources", this.props.resourcesFilters);
    //let orderField = getInfoFromSort("orderField", this.state.sort);
    //let orderDesc = getInfoFromSort("orderDesc", this.state.sort);

    let params = {
      label: this.state.simpleSearchTerm,
      page: this.state.page,
      limit: this.state.limit,
      //orderField: orderField,
      //orderDesc: orderDesc,
      //events: filterInfo.events,
      //organisations: filterInfo.organisations,
      //temporals: filterInfo.temporals,
      systemType: this.props.resourcesFilters.resources,
    };
    let url = process.env.REACT_APP_APIPATH+'resources';
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

    let resources = responseData.data;
    let newResources = [];
    for (let i=0;i<resources.length; i++) {
      let resource = resources[i];
      resource.checked = false;
      newResources.push(resource);
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
        resourcesLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        items: newResources
      });
      this.updateResourcesRelationship();
    }
  }

  async advancedSearchSubmit(e) {
    e.preventDefault();
    this.setState({
      resourcesLoading: true
    })
    //let filterInfo = getInfoFromFilterObj("resources", this.props.resourcesFilters);
    //let orderField = getInfoFromSort("orderField", this.state.sort);
    //let orderDesc = getInfoFromSort("orderDesc", this.state.sort);
    let params = {
      page: 1,
      limit: this.state.limit,
      //orderField: orderField,
      //orderDesc: orderDesc,
      //events: filterInfo.events,
      //organisations: filterInfo.organisations,
      //temporals: filterInfo.temporals,
      systemType: this.props.resourcesFilters.resources,
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
    let url = process.env.REACT_APP_APIPATH+'resources';
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

    let resources = responseData.data;
    let newResources = [];
    for (let i=0;i<resources.length; i++) {
      let resource = resources[i];
      resource.checked = false;
      newResources.push(resource);
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
        resourcesLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        items: newResources
      });
      this.updateResourcesRelationship();
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
    this.props.setPaginationParams("resources", payload);
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
      let label = item.label;

      let thumbnailImage = [];
      let thumbnailURL = getResourceThumbnailURL(item);
      if (thumbnailURL!==null) {
        thumbnailImage = <img src={thumbnailURL} className="resources-list-thumbnail img-fluid img-thumbnail" alt={label} />
      }

      let link = "/resource/"+item._id;
      let outputItem = <ListGroupItem key={i}>
        <Link to={link} href={link}>{thumbnailImage}</Link>
        <Link to={link} href={link}>{label}</Link>
      </ListGroupItem>;
      output.push(outputItem);
    }
    return <div className="resources-list"><ListGroup>{output}</ListGroup></div>;
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
    let heading = "Resources";
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
      let pageActions = <PageActions
        limit={this.state.limit}
        sort={""}//sort={this.state.sort}
        current_page={this.state.page}
        gotoPageValue={this.state.gotoPage}
        total_pages={this.state.totalPages}
        updatePage={this.updatePage}
        gotoPage={this.gotoPage}
        handleChange={this.handleChange}
        updateLimit={this.updateLimit}
        updateSort={this.updateSort}
        pageType="resources"
      />
      let resources = <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
      if (!this.state.resourcesLoading) {
        resources = this.renderItems();
      }
      let searchElements = [
        { element: "label", label: "Label",
          inputType: "text", inputData: null},
        { element: "description", label: "Description",
          inputType: "text", inputData: null},
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
              name="resources"
              filterType = {[{name: "dataTypes", layer: ["type"], compareData: {dataSet: "systemType", typeSet: "_id"}, typeFilterDisable: false}]}
              filtersSet={this.props.resourcesFilters}
              relationshipSet={this.props.resourcesRelationship}
              decidingFilteringSet={!this.state.loading}
              updatedata={this.load}
              items={this.state.items}/>
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
            {resources}
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

export default Resources = connect(mapStateToProps, mapDispatchToProps)(Resources);
