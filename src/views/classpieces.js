import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody, CardImg, CardText
} from 'reactstrap';
import { Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getResourceThumbnailURL, getInfoFromFilterObj} from '../helpers/helpers';
import PageActions from '../components/page-actions';
import Filters from '../components/filters';

import {connect} from "react-redux";
import {
  setPaginationParams,
  setRelationshipParams
} from "../redux/actions";

const mapStateToProps = state => {
  return {
    resourceSystemTypes: state.resourceSystemTypes,
    classpiecesPagination: state.classpiecesPagination,
    classpiecesFilters: state.classpiecesFilters,
    classpiecesRelationship: state.classpiecesRelationship,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params)),
    setRelationshipParams: (type,params) => dispatch(setRelationshipParams(type,params))
  }
}


class Classpieces extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      classpiecesLoading: true,
      items: [],
      page: 1,
      gotoPage: 1,
      limit: 50,
      totalPages: 0,
      totalItems: 0,
    }

    this.load = this.load.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateClasspiecesRelationship = this.updateClasspiecesRelationship.bind(this);
  }

  load() {
    this.setState({
      classpiecesLoading: true
    })
    let context = this;
    let filterInfo = getInfoFromFilterObj("classpieces", this.props.classpiecesFilters);
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      //eventType: eventsType,
      events: filterInfo.events,
      organisations: filterInfo.organisations,
      temporals: filterInfo.temporals,
      //organisationType: organisationsType,
      //people: this.props.classpiecesFilters.people,
      //resources: this.props.classpiecesFilters.classpieces,
      //spatial: this.props.classpiecesFilters.spatials,
    };
    let url = process.env.REACT_APP_APIPATH+'classpieces';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let classpieces = responseData.data;
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
          classpiecesLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          items: classpieces
        });
        
        context.updateClasspiecesRelationship();
      }
	  })
	  .catch(function (error) {
	  });
  }

  updateClasspiecesRelationship() {
  	let context = this;
    let filterInfo = getInfoFromFilterObj("classpieces", this.props.classpiecesFilters);
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      //eventType: eventsType,
      events: filterInfo.events,
      organisations: filterInfo.organisations,
      temporals: filterInfo.temporals,
      //organisationType: organisationsType,
      //people: this.props.classpiecesFilters.people,
      //resources: this.props.classpiecesFilters.classpieces,
      //spatials: this.props.classpiecesFilters.spatials,
    };
    let url = process.env.REACT_APP_APIPATH+'classpieces-active-filters';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      
      let payload = {
        events: responseData.events.map(item=>{return item}),
        organisations: responseData.organisations.map(item=>{return item._id}),
        people: responseData.people.map(item=>{return item._id}),
        classpieces: responseData.resources.map(item=>{return item._id}),
        //temporals: responseData.temporals.map(item=>{return item._id}),
        //spatials: responseData.spatials.map(item=>{return item._id}),
      }
      
      context.props.setRelationshipParams("classpieces",payload);
      
	  })
	  .catch(function (error) {
	  });
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
    this.props.setPaginationParams("classpieces", payload);
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
      output.push(this.renderItem(i, item));
    }
    return output;
  }

  renderItem(i, item) {
    let parseUrl = "/classpiece/"+item._id;
    let thumbnailImage = [];
    let thumbnailPath = getResourceThumbnailURL(item);
    if (thumbnailPath!==null) {
      thumbnailImage = <Link to={parseUrl} href={parseUrl}><CardImg src={thumbnailPath} alt={item.label} /></Link>
    }

    let itemOutput = <div key={i} className="col-12 col-sm-6 col-md-3">
      <Card style={{marginBottom: '15px'}}>
        {thumbnailImage}
        <CardBody>
          <CardText className="text-center">
            <label><Link to={parseUrl} href={parseUrl}>{item.label}</Link></label>
          </CardText>
        </CardBody>
      </Card>
    </div>;
    return itemOutput;
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  componentDidMount() {
    this.load();
  }

  render() {
    let heading = "Classpieces";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-photo", active: true, path: ""}
    ];
    let content = <div>
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
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>

    if (!this.state.loading) {
      let pageActions = <PageActions
        limit={this.state.limit}
        sort={""}
        current_page={this.state.page}
        gotoPageValue={this.state.gotoPage}
        total_pages={this.state.totalPages}
        updatePage={this.updatePage}
        gotoPage={this.gotoPage}
        handleChange={this.handleChange}
        updateLimit={this.updateLimit}
        pageType="classpieces"
      />
      let classpieces = <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
      if (!this.state.classpiecesLoading) {
        classpieces = this.renderItems();
      }
      content = <div>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <Filters
              name="classpieces"
              filterType = {[
                {name: "organisations", layer: ["type","data"], compareData: {dataSet: "organisationType", typeSet: "labelId"}, typeFilterDisable: true},
                {name: "events", layer: ["type","data"], compareData: {dataSet: "eventType", typeSet: "_id"}, typeFilterDisable: true},
                {name: "temporals"},
                //{name: "spatials"},
                ]}
              filtersSet={this.props.classpiecesFilters}
              relationshipSet={this.props.classpiecesRelationship}
              decidingFilteringSet={!this.state.loading}
              updatedata={this.load}/>
          </div>
          <div className="col-xs-12 col-sm-8">
            <h2>{heading}</h2>
            {pageActions}
            <div className="row">
              {classpieces}
            </div>
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

export default Classpieces = connect(mapStateToProps, mapDispatchToProps)(Classpieces);
