import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  ListGroup, ListGroupItem,
  Collapse,
  Tooltip
} from 'reactstrap';
import { Link} from 'react-router-dom';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet';
import {Breadcrumbs} from '../components/breadcrumbs';
import PageActions from '../components/page-actions';
import Filters from '../components/filters';
import SearchForm from '../components/search-form';
import {updateDocumentTitle} from '../helpers';

import {connect} from "react-redux";
import {
  setPaginationParams,
  setRelationshipParams
} from "../redux/actions";

const mapStateToProps = state => {
  return {
    spatialsPagination: state.spatialsPagination,
    spatialsFilters: state.spatialsFilters,
    spatialsRelationship: state.spatialsRelationship,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params)),
    setRelationshipParams: (type,params) => dispatch(setRelationshipParams(type,params))
  }
}


class Spatials extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      spatialsLoading: true,
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

    this.filtersDisable = true;

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
    this.updateSpatialsRelationship = this.updateSpatialsRelationship.bind(this);
    this.renderMap = this.renderMap.bind(this);
  }

  load() {
    this.setState({
      spatialsLoading: true
    })
    let context = this;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      eventType: this.props.spatialsFilters.events,
      //events: eventsData,
      //organisations: this.props.spatialsFilters.organisations,
      //people: this.props.spatialsFilters.people,
      //resources: this.props.spatialsFilters.classpieces,
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
    let url = process.env.REACT_APP_APIPATH+'spatials';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let spatials = responseData.data;
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
          spatialsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: spatials
        });

        context.updateSpatialsRelationship(spatials);
      }
	  })
	  .catch(function (error) {
	  });
  }

  updateSpatialsRelationship(spatials=null) {
    let payload = this.props.spatialsRelationship;
    this.props.setRelationshipParams("spatials",payload);
    /*
    if(spatials===null){
      return false;
    }

    let id_spatials = spatials.map(item =>{
      return item._id;
    });

    let context = this;
    let params = {
      _ids: id_spatials,
    };
    let url = process.env.REACT_APP_APIPATH+'ui-spatials-active-filters';
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
        context.props.setRelationshipParams("spatials",payload);
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
      spatialsLoading: true
    })
    let context = this;
    let params = {
      label: this.state.simpleSearchTerm,
      page: this.state.page,
      limit: this.state.limit
    };
    let url = process.env.REACT_APP_APIPATH+'spatials';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let spatials = responseData.data;
      let newSpatials = [];
      for (let i=0;i<spatials.length; i++) {
        let spatialData = spatials[i];
        spatialData.checked = false;
        newSpatials.push(spatialData);
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
          spatialsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: newSpatials
        });
        context.updateSpatialsRelationship(newSpatials);
      }
	  })
	  .catch(function (error) {
	  });
  }

  advancedSearchSubmit(e) {
    e.preventDefault();
    this.setState({
      spatialsLoading: true
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
    let url = process.env.REACT_APP_APIPATH+'spatials';
    axios({
      method: 'post',
      url: url,
      crossDomain: true,
      data: postData
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let spatials = responseData.data;
      let newSpatials = [];
      for (let i=0;i<spatials.length; i++) {
        let spatialData = spatials[i];
        spatialData.checked = false;
        newSpatials.push(spatialData);
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
          spatialsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: newSpatials
        });
        context.updateSpatialsRelationship(newSpatials);
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
    this.props.setPaginationParams("spatials", payload);
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

  renderMap() {
    let zoom = 9;
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png')
    });

    let link_href = "/spatial/";
    //center here maynooth
    let output = <div className="spatial-map-container">
        <Map center={[53.381290, -6.591850]} zoom={zoom} maxZoom={18}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {this.state.items.map((element, index) =>
            <Marker
              key={index}
              position={[element.latitude, element.longitude]}
              >
              <Popup>
                <Link to={link_href+element._id} href={link_href+element._id}>{element.label}</Link>
              </Popup>
            </Marker>
          )}
        </Map>
      </div>
    return output;
  }

  renderItems() {
    let output = [];
    for (let i=0;i<this.state.items.length; i++) {
      let item = this.state.items[i];
      let label = item.label;

      let thumbnailImage = [];
      let thumbnailURL = null;//getEventThumbnailURL(item);
      if (thumbnailURL!==null) {
        thumbnailImage = <img src={thumbnailURL} className="events-list-thumbnail img-fluid img-thumbnail" alt={label} />
      }
      let link = "/spatial/"+item._id;
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
    let heading = "Spatials";
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
        current_page={this.state.page}
        gotoPageValue={this.state.gotoPage}
        total_pages={this.state.totalPages}
        updatePage={this.updatePage}
        gotoPage={this.gotoPage}
        handleChange={this.handleChange}
        updateLimit={this.updateLimit}
        pageType="spatials"
      />
      let spatials = <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
      if (!this.state.spatialsLoading) {
        spatials = this.renderItems();
      }
      let searchElements = [
        {element: "label", label: "Label", inputType: "text", inputData: null},
      ]

      let searchBox = <Collapse isOpen={this.state.searchVisible}>
        <SearchForm
          name="spatials"
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

      let filters = null;
      if (!this.filtersDisable) {
        filters = <Filters
          name="spatials"
          filterType = {[]}
          //filterType = {[{name: "dataTypes", layer: ["type"], compareData: {dataSet: "eventType", typeSet: "_id"}, typeFilterDisable: false}]}
          filtersSet={this.props.spatialsFilters}
          relationshipSet={this.props.spatialsRelationship}
          decidingFilteringSet={!this.state.loading}
          updatedata={this.load}
          items={this.state.items}/>
      }

      //map
      let map = this.renderMap();

      content = <div>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            {map}
            {filters}
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
            {spatials}
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

export default Spatials = connect(mapStateToProps, mapDispatchToProps)(Spatials);
