import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import {
  Spinner,
  ListGroup,
  ListGroupItem,
  Collapse,
  Card,
  CardBody,
  Tooltip,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import Breadcrumbs from '../components/breadcrumbs';
import { updateDocumentTitle, renderLoader } from '../helpers';

import { setPaginationParams, setRelationshipParams } from '../redux/actions';

const PageActions = lazy(() => import('../components/page-actions'));
const SearchForm = lazy(() => import('../components/search-form'));

const mapStateToProps = (state) => ({
  spatialsPagination: state.spatialsPagination,
  spatialsFilters: state.spatialsFilters,
  spatialsRelationship: state.spatialsRelationship,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
    setRelationshipParams: (type, params) =>
      dispatch(setRelationshipParams(type, params)),
  };
}

class Spatials extends Component {
  constructor(props) {
    super(props);
    const { spatialsPagination } = this.props;

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
    };

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
    this.updateSpatialsRelationship = this.updateSpatialsRelationship.bind(
      this
    );
    this.renderMap = this.renderMap.bind(this);

    // cancelTokens
    const cancelToken1 = axios.CancelToken;
    this.cancelSource1 = cancelToken1.source();

    const cancelToken2 = axios.CancelToken;
    this.cancelSource2 = cancelToken2.source();
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.cancelSource1.cancel('api request cancelled');
    this.cancelSource2.cancel('api request cancelled');
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  async load() {
    const { page, limit, simpleSearchTerm } = this.state;
    this.setState({
      spatialsLoading: true,
    });
    const params = {
      page,
      limit,
    };
    if (simpleSearchTerm !== '') {
      params.label = simpleSearchTerm;
    }
    const url = `${process.env.REACT_APP_APIPATH}spatials`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
      cancelToken: this.cancelSource1.token,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    if (typeof responseData !== 'undefined') {
      const spatials = responseData.data;
      let currentPage = 1;
      if (responseData.currentPage > 0) {
        currentPage = responseData.currentPage;
      }
      if (
        currentPage !== 1 &&
        currentPage > responseData.totalPages &&
        responseData.totalPages > 0
      ) {
        this.updatePage(responseData.totalPages);
      } else {
        this.setState({
          loading: false,
          spatialsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: spatials,
        });
      }
    }
  }

  updateSpatialsRelationship() {
    const {
      spatialsRelationship: payload,
      setRelationshipParams: setRelationshipParamsFn,
    } = this.props;
    setRelationshipParamsFn('spatials', payload);
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
    const { page, limit, simpleSearchTerm } = this.state;
    if (simpleSearchTerm.length < 2) {
      return false;
    }
    this.setState({
      spatialsLoading: true,
    });
    const params = {
      label: simpleSearchTerm,
      page,
      limit,
    };
    const url = `${process.env.REACT_APP_APIPATH}spatials`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
      cancelToken: this.cancelSource1.token,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    if (typeof responseData !== 'undefined') {
      const spatials = responseData.data;
      let currentPage = 1;
      if (responseData.currentPage > 0) {
        currentPage = responseData.currentPage;
      }
      if (
        currentPage !== 1 &&
        currentPage > responseData.totalPages &&
        responseData.totalPages > 0
      ) {
        this.updatePage(responseData.totalPages);
      } else {
        this.setState({
          loading: false,
          spatialsLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          items: spatials,
        });
      }
    }
    return false;
  }

  clearSearch() {
    this.updateStorePagination({ simpleSearchTerm: '', page: 1 });
    this.setState(
      {
        simpleSearchTerm: '',
        page: 1,
      },
      () => {
        this.load();
      }
    );
  }

  toggleSearch() {
    const { searchVisible } = this.state;
    this.setState({
      searchVisible: !searchVisible,
    });
  }

  updatePage(e) {
    const { page } = this.state;
    if (e > 0 && e !== page) {
      this.updateStorePagination({ page: e });
      this.setState(
        {
          page: e,
          gotoPage: e,
        },
        () => {
          this.load();
        }
      );
    }
  }

  gotoPage(e) {
    e.preventDefault();
    const { gotoPage } = this.state;
    const { page } = this.state;
    if (gotoPage > 0 && gotoPage !== page) {
      this.updateStorePagination({ page: e });
      this.setState(
        {
          page: gotoPage,
        },
        () => {
          this.load();
        }
      );
    }
  }

  updateLimit(limit) {
    this.setState(
      {
        limit,
      },
      () => {
        this.load();
      }
    );
    this.updateStorePagination({ limit });
  }

  updateStorePagination({
    limit = null,
    page = null,
    simpleSearchTerm = null,
  }) {
    const { setPaginationParams: setPaginationParamsFn } = this.props;
    const payload = {};
    if (limit !== null) {
      payload.limit = limit;
    }
    if (page !== null) {
      payload.page = page;
    }
    if (simpleSearchTerm !== null) {
      payload.simpleSearchTerm = simpleSearchTerm;
    }
    setPaginationParamsFn('spatials', payload);
  }

  toggleMap() {
    const { mapVisible } = this.state;
    this.setState({
      mapVisible: !mapVisible,
    });
  }

  renderMap() {
    const { mapVisible, items } = this.state;
    const zoom = 9;
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });

    const linkHref = '/spatial/';
    let visibleClass = '';
    if (mapVisible) {
      visibleClass = ' active';
    }
    const output = (
      <div className={`spatial-map-container spatials-list-map${visibleClass}`}>
        <Map center={[53.38129, -6.59185]} zoom={zoom} maxZoom={18}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {items.map((element, index) => {
            const key = `a${index}`;
            return (
              <Marker
                key={key}
                position={[element.latitude, element.longitude]}
              >
                <Popup>
                  <Link
                    to={linkHref + element._id}
                    href={linkHref + element._id}
                  >
                    {element.label}
                  </Link>
                </Popup>
              </Marker>
            );
          })}
        </Map>
      </div>
    );
    return output;
  }

  renderItems() {
    const { items } = this.state;
    let outputObj = [];
    const output = [];
    if (items.length > 0) {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const { label } = item;

        let thumbnailImage = [];
        const thumbnailURL = null; // getEventThumbnailURL(item);
        if (thumbnailURL !== null) {
          thumbnailImage = (
            <img
              src={thumbnailURL}
              className="events-list-thumbnail img-fluid img-thumbnail"
              alt={label}
            />
          );
        }
        const link = `/spatial/${item._id}`;
        const outputItem = (
          <ListGroupItem key={i}>
            <Link to={link} href={link}>
              {thumbnailImage}
            </Link>
            <Link to={link} href={link}>
              {label}
            </Link>
          </ListGroupItem>
        );
        output.push(outputItem);
      }
      outputObj = (
        <div className="events-list">
          <ListGroup>{output}</ListGroup>
        </div>
      );
    } else {
      const item = (
        <div key="no-results" className="col-12">
          <Card style={{ marginBottom: '15px' }}>
            <CardBody>
              <h5>No results found</h5>
              <p>There are no locations matching your query</p>
            </CardBody>
          </Card>
        </div>
      );
      outputObj.push(item);
    }
    return outputObj;
  }

  render() {
    const {
      loading,
      limit,
      page,
      gotoPage,
      totalPages,
      spatialsLoading,
      searchVisible,
      simpleSearchTerm,
      totalItems,
    } = this.state;
    const heading = 'Locations';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-users', active: true, path: '' },
    ];
    updateDocumentTitle(heading);
    let content = (
      <div>
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      </div>
    );

    if (!loading) {
      const pageActions = (
        <Suspense fallback={renderLoader()}>
          <PageActions
            limit={limit}
            sort={false}
            current_page={page}
            gotoPageValue={gotoPage}
            total_pages={totalPages}
            updatePage={this.updatePage}
            gotoPage={this.gotoPage}
            handleChange={this.handleChange}
            updateLimit={this.updateLimit}
            pageType="spatials"
          />
        </Suspense>
      );
      let spatials = (
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      );
      if (!spatialsLoading) {
        spatials = this.renderItems();
      }
      const searchElements = [
        {
          element: 'label',
          label: 'Label',
          inputType: 'text',
          inputData: null,
        },
      ];

      const searchBox = (
        <Collapse isOpen={searchVisible}>
          <Suspense fallback={renderLoader()}>
            <SearchForm
              name="spatials"
              searchElements={searchElements}
              simpleSearchTerm={simpleSearchTerm}
              simpleSearch={this.simpleSearch}
              clearSearch={this.clearSearch}
              handleChange={this.handleChange}
              adadvancedSearchEnable={false}
            />
          </Suspense>
        </Collapse>
      );

      // map
      const map = this.renderMap();

      content = (
        <div>
          <div className="row">
            <div className="col-12">
              <h2>
                {heading}
                <Tooltip placement="top" target="search-tooltip">
                  Search
                </Tooltip>
                <div className="tool-box">
                  <div className="tool-box-text">Total: {totalItems}</div>
                  <div
                    className="action-trigger"
                    onClick={() => this.toggleSearch()}
                    id="search-tooltip"
                    onKeyDown={() => false}
                    role="button"
                    tabIndex={0}
                    aria-label="toggle search"
                  >
                    <i className="fa fa-search" />
                  </div>
                  <div
                    className="action-trigger"
                    onClick={() => this.toggleMap()}
                    id="search-tooltip"
                    onKeyDown={() => false}
                    role="button"
                    tabIndex={0}
                    aria-label="toggle map"
                  >
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
      );
    }
    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
      </div>
    );
  }
}

Spatials.defaultProps = {
  spatialsPagination: {
    limit: 25,
    page: 1,
    simpleSearchTerm: '',
  },
  spatialsFilters: {
    spatials: [],
  },
  setRelationshipParams: () => {},
  setPaginationParams: () => {},
  spatialsRelationship: {
    spatials: [],
  },
};
Spatials.propTypes = {
  spatialsPagination: PropTypes.shape({
    limit: PropTypes.number,
    page: PropTypes.number,
    simpleSearchTerm: PropTypes.string,
  }),
  spatialsFilters: PropTypes.shape({
    spatials: PropTypes.array,
  }),
  setRelationshipParams: PropTypes.func,
  setPaginationParams: PropTypes.func,
  spatialsRelationship: PropTypes.shape({
    spatials: PropTypes.array,
  }),
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(Spatials);
