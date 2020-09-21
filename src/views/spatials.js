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
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet';
import {Breadcrumbs} from '../components/breadcrumbs';
import {updateDocumentTitle,renderLoader} from '../helpers';

import {connect} from "react-redux";
import {
  setPaginationParams,
  setRelationshipParams
} from "../redux/actions";

const PageActions = lazy(() => import('../components/page-actions'));
const SearchForm = lazy(() => import('../components/search-form'));

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
    let spatialsPagination = this.props.spatialsPagination;

    this.state = {
      loading: true,
      spatialsLoading: true,
      items: [],
      page: spatialsPagination.page,
      gotoPage: spatialsPagination.page,
      limit: spatialsPagination.limit,
      totalPages: 0,
      totalItems: 0,
      searchVisible: false,
      simpleSearchTerm: '',
      mapVisible: false,
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
    this.toggleMap = this.toggleMap.bind(this);
    this.updateSpatialsRelationship = this.updateSpatialsRelationship.bind(this);
    this.renderMap = this.renderMap.bind(this);

    // cancelTokens
    const cancelToken1 = axios.CancelToken;
    this.cancelSource1 = cancelToken1.source();

    const cancelToken2 = axios.CancelToken;
    this.cancelSource2 = cancelToken2.source();
  }

  async load() {
    this.setState({
      spatialsLoading: true
    });
    let params = {
      page: this.state.page,
      limit: this.state.limit
    };
    if (this.state.simpleSearchTerm!=="") {
      params.label = this.state.simpleSearchTerm;
    }
    let url = process.env.REACT_APP_APIPATH+'spatials';
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
      console.log(error);
	  });
    if (typeof responseData!=="undefined") {
      let spatials = responseData.data;
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
          spatialsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: spatials
        });
      }
    }
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


  async simpleSearch(e) {
    e.preventDefault();
    if (this.state.simpleSearchTerm.length<2) {
      return false;
    }
    this.setState({
      spatialsLoading: true
    })
    let params = {
      label: this.state.simpleSearchTerm,
      page: this.state.page,
      limit: this.state.limit
    };
    let url = process.env.REACT_APP_APIPATH+'spatials';
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
      console.log(error);
	  });
    if (typeof responseData!=="undefined") {
      let spatials = responseData.data;
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
          spatialsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: spatials
        });
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
    });
  }

  toggleSearch() {
    this.setState({
      searchVisible: !this.state.searchVisible
    })
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
    this.props.setPaginationParams("spatials", payload);
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
    let visibleClass = "";
    if (this.state.mapVisible) {
      visibleClass = " active";
    }
    let output = <div className={"spatial-map-container spatials-list-map"+visibleClass}>
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

  toggleMap() {
    this.setState({
      mapVisible: !this.state.mapVisible
    })
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
        let link = "/spatial/"+item._id;
        let outputItem = <ListGroupItem key={i}>
          <Link to={link} href={link}>{thumbnailImage}</Link>
          <Link to={link} href={link}>{label}</Link>
        </ListGroupItem>;
        output.push(outputItem);
      }
      outputObj = <div className="events-list"><ListGroup>{output}</ListGroup></div>
    }
    else {
      let item = <div key='no-results' className="col-12">
        <Card style={{marginBottom: '15px'}}>
          <CardBody>
            <h5>No results found</h5>
            <p>There are no locations matching your query</p>
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
    this.cancelSource2.cancel('api request cancelled');
  }

  render() {
    let heading = "Locations";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-users", active: true, path: ""}
    ];
    updateDocumentTitle(heading);
    let content = <div>
      <div className="row">
        <div className="col-12">
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
          pageType="spatials"
        />
      </Suspense>
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
        <Suspense fallback={renderLoader()}>
          <SearchForm
            name="spatials"
            searchElements={searchElements}
            simpleSearchTerm={this.state.simpleSearchTerm}
            simpleSearch={this.simpleSearch}
            clearSearch={this.clearSearch}
            handleChange={this.handleChange}
            adadvancedSearchEnable={false}
            />
        </Suspense>
      </Collapse>

      //map
      let map = this.renderMap();

      content = <div>
        <div className="row">
          <div className="col-12">
            <h2>{heading}
              <Tooltip placement="top" target="search-tooltip">
                Search
              </Tooltip>
              <div className="tool-box">
                <div className="tool-box-text">Total: {this.state.totalItems}</div>
                <div className="action-trigger" onClick={()=>this.toggleSearch()} id="search-tooltip">
                  <i className="fa fa-search" />
                </div>
                <div className="action-trigger" onClick={()=>this.toggleMap()} id="search-tooltip">
                  <i className="fa fa-map" />
                </div>
              </div>
            </h2>
            {searchBox}
            {map}
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
