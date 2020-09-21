import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import {
  Spinner,
  ListGroup, ListGroupItem,
  Card, CardBody,
} from 'reactstrap';
import { Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {updateDocumentTitle,renderLoader} from '../helpers';

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

const Filters = lazy(() => import('../components/filters'));
const PageActions = lazy(() => import('../components/page-actions'));

class Temporals extends Component {
  constructor(props) {
    super(props);
    let temporalsPagination = this.props.temporalsPagination;

    this.state = {
      loading: true,
      temporalsLoading: true,
      items: [],
      page: temporalsPagination.page,
      gotoPage: temporalsPagination.page,
      limit: temporalsPagination.limit,
      totalPages: 0,
      totalItems: 0
    }

    this.load = this.load.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateTemporalsRelationship = this.updateTemporalsRelationship.bind(this);

    // cancelTokens
    const cancelToken1 = axios.CancelToken;
    this.cancelSource1 = cancelToken1.source();

  }

  async load() {
    this.setState({
      temporalsLoading: true
    });
    let filters = this.props.temporalsFilters;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      temporals: filters.temporals,
    };
    if (this.state.simpleSearchTerm!=="") {
      params.label = this.state.simpleSearchTerm;
    }
    let url = process.env.REACT_APP_APIPATH+'ui-temporals';
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
      let temporals = responseData.data;
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
          temporalsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: temporals
        });
      }
    }
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
    this.props.setPaginationParams("temporals", payload);
  }

  renderItems() {
    let outputObj = [];
    let output = [];
    if (this.state.items.length>0) {
      for (let i=0;i<this.state.items.length; i++) {
        let item = this.state.items[i];
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
      outputObj = <div className="events-list"><ListGroup>{output}</ListGroup></div>;
    }
    else {
      let item = <div key='no-results' className="col-12">
        <Card style={{marginBottom: '15px'}}>
          <CardBody>
            <h5>No results found</h5>
            <p>There are no dates matching your query</p>
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

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.cancelSource1.cancel('api request cancelled');
  }

  render() {
    let heading = "Dates";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-clock", active: true, path: ""}
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
          sort={false}
          current_page={this.state.page}
          gotoPageValue={this.state.gotoPage}
          total_pages={this.state.totalPages}
          updatePage={this.updatePage}
          gotoPage={this.gotoPage}
          handleChange={this.handleChange}
          updateLimit={this.updateLimit}
          pageType="temporals"
        />
      </Suspense>
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

      let filterType = ["temporals"];
      content = <div>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <Suspense fallback={renderLoader()}>
              <Filters
                name="temporals"
                filterType = {filterType}
                filtersSet={this.props.temporalsFilters}
                relationshipSet={this.props.temporalsRelationship}
                updatedata={this.load}/>
            </Suspense>
          </div>
          <div className="col-xs-12 col-sm-8">
            <h2>{heading}
              <div className="tool-box">
                <div className="tool-box-text">Total: {this.state.totalItems}</div>
              </div>
            </h2>
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
