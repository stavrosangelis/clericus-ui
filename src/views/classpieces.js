import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody, CardImg, CardText,
  Collapse,
  Tooltip
} from 'reactstrap';
import { Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getResourceThumbnailURL,updateDocumentTitle,renderLoader} from '../helpers';
import defaultThumbnail from '../assets/images/classpiece-default-thumbnail.jpg';
import HelpArticle from '../components/help-article';

import {connect} from "react-redux";
import {
  setPaginationParams,
  setRelationshipParams
} from "../redux/actions";

import '../scss/classpieces.scss';

const Filters = lazy(() => import('../components/filters'));
const SearchForm = lazy(() => import('../components/search-form'));
const PageActions = lazy(() => import('../components/page-actions'));

const mapStateToProps = state => {
  return {
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
    let classpiecesPagination = this.props.classpiecesPagination;
    this.state = {
      loading: true,
      classpiecesLoading: true,
      items: [],
      page: classpiecesPagination.page,
      gotoPage: classpiecesPagination.page,
      limit: classpiecesPagination.limit,
      totalPages: 0,
      totalItems: 0,
      searchVisible: true,
      simpleSearchTerm: classpiecesPagination.simpleSearchTerm,
      helpVisible: false
    }

    this.load = this.load.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateClasspiecesRelationship = this.updateClasspiecesRelationship.bind(this);
    this.toggleHelp = this.toggleHelp.bind(this);

    // cancelTokens
    const cancelToken1 = axios.CancelToken;
    this.cancelSource1 = cancelToken1.source();

    const cancelToken2 = axios.CancelToken;
    this.cancelSource2 = cancelToken2.source();

    const cancelToken3 = axios.CancelToken;
    this.cancelSource3 = cancelToken3.source();
  }

  async load() {
    this.setState({
      classpiecesLoading: true
    });
    let filters = this.props.classpiecesFilters;
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
    let url = process.env.REACT_APP_APIPATH+'classpieces';
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
      let classpieces = responseData.data;
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
          classpiecesLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: classpieces
        });
        this.updateClasspiecesRelationship();
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
      classpiecesLoading: true
    });
    let filters = this.props.classpiecesFilters;
    let params = {
      label: this.state.simpleSearchTerm,
      page: this.state.page,
      limit: this.state.limit,
      events: filters.events,
      organisations: filters.organisations,
      temporals: filters.temporals,
    };
    let url = process.env.REACT_APP_APIPATH+'classpieces';
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
	  });
    if (typeof responseData!=="undefined") {
      let classpieces = responseData.data;
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
          classpiecesLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: classpieces
        });

        this.updateClasspiecesRelationship();
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

  async updateClasspiecesRelationship() {
    let filters = this.props.classpiecesFilters;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      events: filters.events,
      organisations: filters.organisations,
      temporals: filters.temporals,
    };
    let url = process.env.REACT_APP_APIPATH+'classpieces-active-filters';
    let responseData = await axios({
      method: 'get',
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
        organisations: responseData.data.organisations.map(item=>item),
      }
      this.props.setRelationshipParams("classpieces",payload);
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
    this.props.setPaginationParams("classpieces", payload);
  }

  renderItems() {
    let output = [];
    if (this.state.items.length>0) {
      for (let i=0;i<this.state.items.length; i++) {
        let item = this.state.items[i];
        output.push(this.renderItem(i, item));
      }
    }
    else {
      let query = "";
      if (this.state.simpleSearchTerm!=="") {
        query = <b>"{this.props.classpiecesPagination.simpleSearchTerm}"</b>;
      }
      let item = <div key='no-results' className="col-12">
        <Card style={{marginBottom: '15px'}}>
          <CardBody>
            <h5>No results found</h5>
            <p>There are no classpieces matching your query {query}</p>
          </CardBody>
        </Card>
      </div>
      output.push(item);
    }
    return output;
  }

  renderItem(i, item) {
    let parseUrl = "/classpiece/"+item._id;
    let thumbnailImage = <img src={defaultThumbnail} alt={item.label} />;
    let thumbnailPath = getResourceThumbnailURL(item);
    if (thumbnailPath!==null) {
      let thumbStyle={backgroundImage: `url("${thumbnailPath}")`};
      thumbnailImage = <Link to={parseUrl} href={parseUrl} className="classpieces-list-thumbnail">
        <div className="classpiece-thumbnail" style={thumbStyle}></div>
        <CardImg src={defaultThumbnail} alt={item.label}  />
      </Link>
    }

    let itemOutput = <div key={i} className="col-12 col-sm-6 col-md-3" onContextMenu={(e)=>{e.preventDefault();return false;}}>
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
  }

  render() {
    let heading = "Classpieces";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-photo", active: true, path: ""}
    ];
    updateDocumentTitle(heading);
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
          pageType="classpieces"
        />
      </Suspense>
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

      let searchElements = [
        { element: "label", label: "Label",
          inputType: "text", inputData: null},
        { element: "description", label: "Description",
          inputType: "text", inputData: null},
      ]
      let searchBox = <Collapse isOpen={this.state.searchVisible}>
        <Suspense fallback={renderLoader()}>
          <SearchForm
            searchElements={searchElements}
            simpleSearchTerm={this.state.simpleSearchTerm}
            simpleSearch={this.simpleSearch}
            clearSearch={this.clearSearch}
            handleChange={this.handleChange}
            adadvancedSearchEnable={false}
            />
        </Suspense>
      </Collapse>
      
      let filterType = ["events", "temporals"];
      content = <div>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <Suspense fallback={renderLoader()}>
              <Filters
                name="classpieces"
                filterType={filterType}
                filtersSet={this.props.classpiecesFilters}
                relationshipSet={this.props.classpiecesRelationship}
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
            <div className="row">
              {classpieces}
            </div>
            {pageActions}
            <HelpArticle permalink={"classpieces-help"} visible={this.state.helpVisible} toggle={this.toggleHelp}/>
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
