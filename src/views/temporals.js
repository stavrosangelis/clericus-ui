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
import PageActions from '../components/page-actions';
import Filters from '../components/filters';
import SearchForm from '../components/search-form';

import {connect} from "react-redux";
import {
  setPaginationParams,
  setRelationshipParams
} from "../redux/actions";

const mapStateToProps = state => {
  return {
    temporalsPagination: state.temporalsPagination,
    temporalsFilters: state.temporalsFilters,
    temporalsRelationship: state.temporalsRelationship,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params)),
    setRelationshipParams: (type,params) => dispatch(setRelationshipParams(type,params))
  }
}


class Temporals extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      temporalsLoading: true,
      items: [],
      page: 1,
      gotoPage: 1,
      limit: 50,
      totalPages: 0,
      totalItems: 0,
      searchVisible: false,
      simpleSearchTerm: '',
      advancedSearchInputs: [],
    }
    
    this.conductingFilterAtFrontEnd = true;

    this.load = this.load.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.advancedSearchSubmit = this.advancedSearchSubmit.bind(this);
    this.clearAdvancedSearch = this.clearAdvancedSearch.bind(this);
    this.updateAdvancedSearchInputs = this.updateAdvancedSearchInputs.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.updateTemporalsRelationship = this.updateTemporalsRelationship.bind(this);
  }

  load() {
    this.setState({
      temporalsLoading: true
    })
    let context = this;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      eventType: this.props.temporalsFilters.events,
      //events: eventsData,
      //organisations: this.props.temporalsFilters.organisations,
      //people: this.props.temporalsFilters.people,
      //resources: this.props.temporalsFilters.classpieces,
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
    let url = process.env.REACT_APP_APIPATH+'temporals';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let temporals = responseData.data;
      let currentPage = 1;
      if (responseData.currentPage>0) {
        currentPage = responseData.currentPage;
      }
      // normalize the page number when the selected page is empty for the selected number of items per page
      if (currentPage>1 && responseData.data.length===0) {
        context.setState({
          page: currentPage-1
        });
        setTimeout(function() {
          context.load();
        },10)
      }
      else {
        context.setState({
          loading: false,
          temporalsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: temporals
        });

        context.updateTemporalsRelationship(temporals);
      }
	  })
	  .catch(function (error) {
	  });
  }

  updateTemporalsRelationship(temporals=null) {
    let payload = this.props.temporalsRelationship;
    this.props.setRelationshipParams("temporals",payload);
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
  
  
  simpleSearch(e) {
    e.preventDefault();
    /*
    if (this.state.simpleSearchTerm.length<2) {
      return false;
    }
    */
    this.setState({
      temporalsLoading: true
    })
    let context = this;
    let params = {
      label: this.state.simpleSearchTerm,
      page: this.state.page,
      limit: this.state.limit
    };
    let url = process.env.REACT_APP_APIPATH+'temporals';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let temporals = responseData.data;
      let newTemporals = [];
      for (let i=0;i<temporals.length; i++) {
        let temporalData = temporals[i];
        temporalData.checked = false;
        newTemporals.push(temporalData);
      }
      let currentPage = 1;
      if (responseData.currentPage>0) {
        currentPage = responseData.currentPage;
      }
      // normalize the page number when the selected page is empty for the selected number of items per page
      if (currentPage>1 && responseData.data.length===0) {
        context.setState({
          page: currentPage-1
        });
        setTimeout(function() {
          context.load();
        },10)
      }
      else {
        context.setState({
          loading: false,
          temporalsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: newTemporals
        });
        context.updateTemporalsRelationship(newTemporals);
      }
	  })
	  .catch(function (error) {
	  });
  }

  advancedSearchSubmit(e) {
    e.preventDefault();
    this.setState({
      temporalsLoading: true
    })
    let context = this;
    let postData = {
      page: 1,
      limit: this.state.limit
    };
    if (this.state.advancedSearchInputs.length>0) {
      let queryRows = [];
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
          let queryRow = {};
          queryRow.field = searchInput.select;
          queryRow.qualifier = searchInput.qualifier;
          queryRow.term = searchInput.input;
          queryRow.boolean = searchInput.boolean;
          queryRows.push(queryRow);
        }
      }
      postData.query = queryRows;
    }
    else {
      return false;
    }
    let url = process.env.REACT_APP_APIPATH+'temporals';
    axios({
      method: 'post',
      url: url,
      crossDomain: true,
      data: postData
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let temporals = responseData.data;
      let newTemporals = [];
      for (let i=0;i<temporals.length; i++) {
        let temporalData = temporals[i];
        temporalData.checked = false;
        newTemporals.push(temporalData);
      }
      let currentPage = 1;
      if (responseData.currentPage>0) {
        currentPage = responseData.currentPage;
      }
      // normalize the page number when the selected page is empty for the selected number of items per page
      if (currentPage>1 && responseData.data.length===0) {
        context.setState({
          page: currentPage-1
        });
        setTimeout(function() {
          context.load();
        },10)
      }
      else {
        context.setState({
          loading: false,
          temporalsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: newTemporals
        });
        context.updateTemporalsRelationship(newTemporals);
      }
	  })
	  .catch(function (error) {
	  });
  }

  clearSearch() {
    this.setState({
      simpleSearchTerm: '',
      page: 1,
    }, ()=>{
      this.load();
    })
  }

  clearAdvancedSearch() {
    this.setState({
      advancedSearchInputs: [],
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

  updateStorePagination(limit=null, page=null) {
    if (limit===null) {
      limit = this.state.limit;
    }
    if (page===null) {
      page = this.state.page;
    }
    let payload = {
      limit:limit,
      page:page,
    }
    this.props.setPaginationParams("temporals", payload);
  }

  gotoPage(e) {
    e.preventDefault();
    let gotoPage = this.state.gotoPage;
    let page = this.state.page;
    if (gotoPage>0 && gotoPage!==page) {
      this.setState({
        page: gotoPage
      })
      this.updateStorePagination(null,gotoPage);
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
    this.updateStorePagination(limit,null);
    let context = this;
    setTimeout(function(){
      context.load();
    },100)
  }

  renderItems() {
    let output = [];
    let filters = {};
    if ((this.conductingFilterAtFrontEnd === true) && 
        (this.props.temporalsFilters.temporals.startDate !== "")) {
      filters = {
        dateType: this.props.temporalsFilters.temporals.dateType,
        startDate: Date.parse(this.props.temporalsFilters.temporals.startDate),
        endDate: Date.parse(this.props.temporalsFilters.temporals.endDate),
      }
    }
    for (let i=0;i<this.state.items.length; i++) {
      let item = this.state.items[i];
      
      if ((this.conductingFilterAtFrontEnd === true) && 
          (this.props.temporalsFilters.temporals.startDate !== "")) {
        //let itemStartDate = Date.parse(item.startDate);
        let dateParts = item.startDate.split("-");
        // month is 0-based, that's why we need dataParts[1] - 1
        let itemStartDate = Date.parse(new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])); 
        
        if (filters.dateType === "exact") {
          if(!(itemStartDate === filters.startDate)) {
            continue;
          }
        }
        else if (filters.dateType === "before") {
          if(!(itemStartDate < filters.startDate)) {
            continue;
          }
        }
        else if (filters.dateType === "after") {
          if(!(itemStartDate > filters.startDate)) {
            continue;
          }
        }
        else if (filters.dateType === "range") {
          //let itemEndDate = Date.parse(item.endDate);
          dateParts = item.endDate.split("-");
          // month is 0-based, that's why we need dataParts[1] - 1
          let itemEndDate = Date.parse(new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])); 
          if (!((itemStartDate >= filters.startDate) && (itemEndDate <= filters.endDate))) {
            continue;
          }
        }
      }
      
      let label = item.label;

      let thumbnailImage = [];
      let thumbnailURL = null;//getEventThumbnailURL(item);
      if (thumbnailURL!==null) {
        thumbnailImage = <img src={thumbnailURL} className="events-list-thumbnail img-fluid img-thumbnail" alt={label} />
      }
      let link = "/temporal/"+item._id;
      let outputItem = <ListGroupItem key={i}>
        <Link to={link} href={link}>{thumbnailImage}</Link>
        <Link to={link} href={link}>{label}</Link>
      </ListGroupItem>;
      output.push(outputItem);
    }
    return <div className="events-list"><ListGroup>{output}</ListGroup></div>;
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
    let heading = "Temporals";
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
        current_page={this.state.page}
        gotoPageValue={this.state.gotoPage}
        total_pages={this.state.totalPages}
        updatePage={this.updatePage}
        gotoPage={this.gotoPage}
        handleChange={this.handleChange}
        updateLimit={this.updateLimit}
        pageType="temporals"
      />
      let temporals = <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
      if (!this.state.temporalsLoading) {
        temporals = this.renderItems();
      }
      let searchElements = [
        {element: "label", label: "Label", inputType: "text", inputData: null},
      ]

      let searchBox = <Collapse isOpen={this.state.searchVisible}>
        <SearchForm
          name="temporals"
          searchElements={searchElements}
          simpleSearchTerm={this.state.simpleSearchTerm}
          simpleSearch={this.simpleSearch}
          clearSearch={this.clearSearch}
          handleChange={this.handleChange}
          adadvancedSearchEnable={false}
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
              name="temporals"
              //filterType = {[]}
              filterType = {[{name: "temporals"}]}
              filtersSet={this.props.temporalsFilters}
              relationshipSet={this.props.temporalsRelationship}
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
            {temporals}
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

export default Temporals = connect(mapStateToProps, mapDispatchToProps)(Temporals);
