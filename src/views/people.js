import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  ListGroup, ListGroupItem,
  Collapse,
  UncontrolledTooltip
} from 'reactstrap';
import { Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getPersonThumbnailURL} from '../helpers/helpers';
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
    peoplePagination: state.peoplePagination,
    peopleFilters: state.peopleFilters,
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
      totalPages: 0,
      totalItems: 0,
      searchVisible: false,
      simpleSearchTerm: '',
      advancedSearchInputs: [],
    }

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
  }

  load() {
    this.setState({
      peopleLoading: true
    })
    let context = this;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      events: this.props.peopleFilters.events,
      organisations: this.props.peopleFilters.organisations,
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
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let people = responseData.data;
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
          peopleLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: people
        });

        context.updatePeopleRelationship(people);
      }
	  })
	  .catch(function (error) {
	  });
  }

  updatePeopleRelationship(people=null) {
    if(people===null){
      return false;
    }

    let id_people = people.map(item =>{
      return item._id;
    });
    
    let context = this;
    let params = {
      _ids: id_people,
    };
    let url = process.env.REACT_APP_APIPATH+'ui-person-active-filters';
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
      }

      setTimeout(function() {
        context.props.setRelationshipParams("people",payload);
      },10)

	  })
	  .catch(function (error) {
	  });
  }

  simpleSearch(e) {
    e.preventDefault();
    if (this.state.simpleSearchTerm.length<2) {
      return false;
    }
    this.setState({
      peopleLoading: true
    })
    let context = this;
    let params = {
      label: this.state.simpleSearchTerm,
      page: this.state.page,
      limit: this.state.limit
    };
    let url = process.env.REACT_APP_APIPATH+'people';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
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
          peopleLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: newPeople
        });
      }
	  })
	  .catch(function (error) {
	  });
  }

  advancedSearchSubmit(e) {
    e.preventDefault();
    this.setState({
      peopleLoading: true
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
        if (searchInput._id!=="default") {
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
    let url = process.env.REACT_APP_APIPATH+'people-advanced';
    axios({
      method: 'post',
      url: url,
      crossDomain: true,
      data: postData
    })
	  .then(function (response) {
      let responseData = response.data.data;
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
          peopleLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: newPeople
        });
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
    return <ListGroup>{output}</ListGroup>;
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
        current_page={this.state.page}
        gotoPageValue={this.state.gotoPage}
        total_pages={this.state.totalPages}
        updatePage={this.updatePage}
        gotoPage={this.gotoPage}
        handleChange={this.handleChange}
        updateLimit={this.updateLimit}
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
        {element: "honorificPrefix", label: "Honorific prefix"},
        {element: "firstName", label: "First name"},
        {element: "middleName", label: "Middle name"},
        {element: "lastName", label: "Last name"},
        {element: "fnameSoundex", label: "First name sounds like"},
        {element: "lnameSoundex", label: "Last name sounds like"},
        {element: "description", label: "Description"},
      ]

      let searchBox = <Collapse isOpen={this.state.searchVisible}>
        <SearchForm
          searchElements={searchElements}
          simpleSearchTerm={this.state.simpleSearchTerm}
          simpleSearch={this.simpleSearch}
          clearSearch={this.clearSearch}
          handleChange={this.handleChange}
          advancedSearch={this.advancedSearchSubmit}
          updateAdvancedSearchRows={this.updateAdvancedSearchRows}
          clearAdvancedSearch={this.clearAdvancedSearch}
          updateAdvancedSearchInputs={this.updateAdvancedSearchInputs}
          />
      </Collapse>

      content = <div>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <Filters name="people" updatedata={this.load}/>
          </div>
          <div className="col-xs-12 col-sm-8">
            <h2>{heading}
              <UncontrolledTooltip placement="top" target="search-tooltip">
                Search
              </UncontrolledTooltip>
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
