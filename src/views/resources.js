import React, { Component } from 'react';
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
import {getResourceThumbnailURL} from '../helpers';
import PageActions from '../components/page-actions';
import SearchForm from '../components/search-form';
import {updateDocumentTitle} from '../helpers';
import HelpArticle from '../components/help-article';

import {connect} from "react-redux";
import {
  setPaginationParams
} from "../redux/actions";

const mapStateToProps = state => {
  return {
    resourcesPagination: state.resourcesPagination
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params))
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
    this.handleChange = this.handleChange.bind(this);
    this.toggleHelp = this.toggleHelp.bind(this);
  }

  async load() {
    this.setState({
      resourcesLoading: true
    })
    let params = {
      page: this.state.page,
      limit: this.state.limit
    };
    if (this.state.simpleSearchTerm!=="") {
      params.label = this.state.simpleSearchTerm;
    }
    let url = process.env.REACT_APP_APIPATH+'ui-resources';
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
    if (currentPage>responseData.totalPages) {
      this.updatePage(responseData.totalPages);
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
    }
  }

  async simpleSearch(e) {
    e.preventDefault();
    if (this.state.simpleSearchTerm.length<2) {
      return false;
    }
    this.updateStorePagination({simpleSearchTerm:this.state.simpleSearchTerm})
    this.setState({
      resourcesLoading: true
    });
    let params = {
      label: this.state.simpleSearchTerm,
      page: this.state.page,
      limit: this.state.limit,
    };
    let url = process.env.REACT_APP_APIPATH+'ui-resources';
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
        resourcesLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        items: resources
      });
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
    this.props.setPaginationParams("resources", payload);
  }

  renderItems() {
    let outputObj = [];
    let output = [];
    if (this.state.items.length>0) {
      for (let i=0;i<this.state.items.length; i++) {
        let item = this.state.items[i];
        let label = item.label;

        let thumbnailImage = [];
        let thumbnailURL = getResourceThumbnailURL(item);
        if (thumbnailURL!==null) {
          thumbnailImage = <img src={thumbnailURL} className="resources-list-thumbnail img-fluid img-thumbnail" alt={label} />
        }
        if (item.resourceType==="document") {
          thumbnailImage = <i className="fa fa-file-pdf-o resource-list-icon-thumb" />
        }

        let link = "/resource/"+item._id;
        let outputItem = <ListGroupItem key={i}>
          <Link to={link} href={link}>{thumbnailImage}</Link>
          <Link to={link} href={link}>{label}</Link>
        </ListGroupItem>;
        output.push(outputItem);
      }
      outputObj = <div className="resources-list"><ListGroup>{output}</ListGroup></div>;
    }
    else {
      let query = "";
      if (this.state.simpleSearchTerm!=="") {
        query = <b>"{this.props.resourcesPagination.simpleSearchTerm}"</b>;
      }
      let item = <div key='no-results' className="col-12">
        <Card style={{marginBottom: '15px'}}>
          <CardBody>
            <h5>No results found</h5>
            <p>There are no resources matching your query {query}</p>
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

  render() {
    let heading = "Resources";
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
      let pageActions = <PageActions
        limit={this.state.limit}//sort={this.state.sort}
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
      let searchElements = [{ element: "label", label: "Label",
          inputType: "text", inputData: null}]

      let searchBox = <Collapse isOpen={this.state.searchVisible}>
        <SearchForm
          searchElements={searchElements}
          simpleSearchTerm={this.state.simpleSearchTerm}
          simpleSearch={this.simpleSearch}
          clearSearch={this.clearSearch}
          handleChange={this.handleChange}
          adadvancedSearchEnable={false}
          />
      </Collapse>

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
                <div className="action-trigger" onClick={()=>this.toggleHelp()} title="Help">
                  <i className="fa fa-question-circle" />
                </div>
              </div>
            </h2>
            {searchBox}
            {pageActions}
            {resources}
            {pageActions}
            <HelpArticle permalink={"resources-help"} visible={this.state.helpVisible} toggle={this.toggleHelp}/>
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
