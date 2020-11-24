import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';
import {Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getResourceThumbnailURL, getResourceFullsizeURL,renderLoader,updateDocumentTitle} from '../helpers';
import {parseMetadata} from '../helpers/parse-metadata';
const Viewer = lazy(() => import('../components/image-viewer-resource.js'));
const DescriptionBlock = lazy(() => import('../components/item-blocks/description'));
const ResourcesBlock = lazy(() => import('../components/item-blocks/resources'));
const ClasspiecesBlock = lazy(() => import('../components/item-blocks/classpieces'));
const EventsBlock = lazy(() => import('../components/item-blocks/events'));
const OrganisationsBlock = lazy(() => import('../components/item-blocks/organisations'));
const PeopleBlock = lazy(() => import('../components/item-blocks/people'));

export default class Resource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: null,
      viewerVisible: false,
      descriptionVisible: true,
      eventsVisible: true,
      peopleVisible: true,
      classpiecesVisible: true,
      resourcesVisible: true,
      organisationsVisible: true,
      metadataDataVisible:false,
      error: {
        visible: false,
        text: []
      }
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderResourceDetails=this.renderResourceDetails.bind(this);
    this.renderThumbnailMetadata=this.renderThumbnailMetadata.bind(this);

    this.toggleViewer = this.toggleViewer.bind(this);
    this.toggleTable = this.toggleTable.bind(this);

    const cancelToken = axios.CancelToken;
    this.cancelSource = cancelToken.source();
  }

  async load() {
    let _id = this.props.match.params._id;
    if (typeof _id==="undefined" || _id===null || _id==="") {
      return false;
    }
    this.setState({
      loading: true,
    });
    let params = {
      _id: _id,
    };
    let url = process.env.REACT_APP_APIPATH+'ui-resource';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params,
      cancelToken: this.cancelSource.token
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
      console.log(error);
	  });
    if (typeof responseData!=="undefined") {
      if (responseData.status) {
        this.setState({
          loading: false,
          item: responseData.data
        });
      }
      else {
        this.setState({
          loading: false,
          error: {
            visible: true,
            text: responseData.msg
          }
        });
      }
    }
  }

  toggleTable(e, dataType=null) {
    let payload = {
      [dataType+"Visible"]:!this.state[dataType+"Visible"]
    }
    this.setState(payload);
  }

  toggleViewer() {
    this.setState({
      viewerVisible: !this.state.viewerVisible
    });
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.cancelSource.cancel('api request cancelled');
  }

  renderResourceDetails(stateData=null, systemType) {
    let item = stateData.item;

    //1. resourceDetails
    let detailsOutput = [];

    // description
    let descriptionRow = [];
    let descriptionHidden = "";
    let descriptionVisibleClass = "";
    if(!this.state.descriptionVisible){
      descriptionHidden = " closed";
      descriptionVisibleClass = "hidden";
    }
    if (typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      descriptionRow = <Suspense fallback={renderLoader()} key="description">
        <DescriptionBlock toggleTable={this.toggleTable} hidden={descriptionHidden} visible={descriptionVisibleClass} description={item.description}/>
      </Suspense>
    }

    let originalLocation = [];
    if (typeof item.originalLocation!=="undefined" && item.originalLocation!==null && item.originalLocation!=="") {
      originalLocation = <div className="original-location" key="original-location">Original location: <a href={item.originalLocation} rel="noopener noreferrer" target="_blank">URL</a></div>
    }

    // classpieces
    let classpiecesRow = [];
    let classpiecesHidden = "";
    let classpiecesVisibleClass = "";
    if(!this.state.classpiecesVisible){
      classpiecesHidden = " closed";
      classpiecesVisibleClass = "hidden";
    }
    if (typeof item.classpieces!=="undefined" && item.classpieces!==null && item.classpieces!=="") {
      classpiecesRow = <Suspense fallback={renderLoader()} key="classpieces">
        <ClasspiecesBlock toggleTable={this.toggleTable} hidden={classpiecesHidden} visible={classpiecesVisibleClass} items={item.classpieces} />
      </Suspense>
    }

    // resources
    let resourcesRow = [];
    let resourcesHidden = "";
    let resourcesVisibleClass = "";
    if(!this.state.resourcesVisible){
      resourcesHidden = " closed";
      resourcesVisibleClass = "hidden";
    }
    if (typeof item.resources!=="undefined" && item.resources!==null && item.resources!=="") {
      resourcesRow = <Suspense fallback={renderLoader()} key="resources">
        <ResourcesBlock toggleTable={this.toggleTable} hidden={resourcesHidden} visible={resourcesVisibleClass} resources={item.resources} />
      </Suspense>
    }

    // events
    let eventsRow = [];
    let eventsHidden = "";
    let eventsVisibleClass = "";
    if(!this.state.eventsVisible){
      eventsHidden = " closed";
      eventsVisibleClass = "hidden";
    }
    if (typeof item.events!=="undefined" && item.events!==null && item.events!=="") {
      eventsRow = <Suspense fallback={renderLoader()} key="events">
        <EventsBlock toggleTable={this.toggleTable} hidden={eventsHidden} visible={eventsVisibleClass} events={item.events} />
      </Suspense>
    }

    // organisations
    let organisationsRow = [];
    let organisationsHidden = "";
    let organisationsVisibleClass = "";
    if(!this.state.organisationsVisible){
      organisationsHidden = " closed";
      organisationsVisibleClass = "hidden";
    }
    if (typeof item.organisations!=="undefined" && item.organisations!==null && item.organisations!=="") {
      organisationsRow = <Suspense fallback={renderLoader()} key="organisations">
        <OrganisationsBlock toggleTable={this.toggleTable} hidden={organisationsHidden} visible={organisationsVisibleClass} organisations={item.organisations} />
      </Suspense>
    }

    // people
    let peopleRow = <Suspense fallback={renderLoader()} key="people">
      <PeopleBlock name="resource" peopleItem={item.people} />
    </Suspense>

    detailsOutput.push(descriptionRow);
    detailsOutput.push(originalLocation);
    detailsOutput.push(eventsRow);
    detailsOutput.push(peopleRow);
    detailsOutput.push(classpiecesRow);
    detailsOutput.push(resourcesRow);
    detailsOutput.push(organisationsRow);

    // 1.5 technical metadata
    let technicalMetadata = [];
    if(Object.keys(stateData.item.metadata).length>0) {
      technicalMetadata = this.renderThumbnailMetadata(stateData.item.metadata, stateData.metadataDataVisible);
      detailsOutput.push(technicalMetadata);
    }
    return <div className="classpiece-details-container">{detailsOutput}</div>
  }

  renderThumbnailMetadata(metadata=null, visible) {
    let metadataDataHidden = "";
    let metadataVisibleClass = "";
    if(!visible){
      metadataDataHidden = " closed";
      metadataVisibleClass = "hidden";
    }
    let metadataOutput = <div key="metadata">
      <h5>Technical metadata
        <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"metadataData")}}>
          <i className={"fa fa-angle-down"+metadataDataHidden}/>
        </div>
      </h5>
      <div className={metadataVisibleClass}>{parseMetadata(metadata.image)}</div>
    </div>;
    return metadataOutput;
  }

  renderItem(stateData=null) {
    let item = stateData.item;
    let label = item.label;

    //1 resourceDetails - resourceDetails include description, events, organisations, and people
    let resourceDetails = this.renderResourceDetails(stateData);

    //2. thumbnailImage
    let thumbnailImage = [];
    let thumbnailURL = getResourceThumbnailURL(item);
    if (thumbnailURL!==null) {
      thumbnailImage = <div key={"thumbnailImage"} className="show-resource" onClick={()=>this.toggleViewer()}>
        <img src={thumbnailURL} className="people-thumbnail img-fluid img-thumbnail" alt={label} />
      </div>
    }
    else if (item.resourceType==="document") {
      let fullsizePath = getResourceFullsizeURL(item);
      thumbnailImage = [<a key="link" target="_blank" href={fullsizePath} className="pdf-thumbnail" rel="noopener noreferrer"><i className="fa fa-file-pdf-o"/></a>, <a key="link-label" target="_blank" href={fullsizePath} className="pdf-thumbnail" rel="noopener noreferrer"><label>Preview file</label> </a>];
    }

    let leftColClass = "col-sm-6 col-md-7";
    let rightColClass = "col-sm-6 col-md-5";
    if (thumbnailURL===null) {
      leftColClass = "extra-side-padding";
      rightColClass = "";
    }
    let output = <div>
      <h3>{label}</h3>
      <div className="row">
        <div className={`col-xs-12 ${leftColClass}`}>
          {resourceDetails}
        </div>
        <div className={`col-xs-12 ${rightColClass}`}>
          {thumbnailImage}
        </div>
      </div>
    </div>
    return output;
  }

  render() {
    let content = <div>
      <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>

    let label = "";
    let breadcrumbsItems = [{label: "Resources", icon: "pe-7s-photo", active: false, path: "/resources"}];

    let imgViewer = [];
    if (!this.state.loading) {
      if (this.state.item!==null) {
        let itemCard = this.renderItem(this.state);

        let labelGraph = "resource-graph";
        let _id = this.props.match.params._id;

        let timelineLink = [];
        if (this.state.item.events.length>0) {
          let timelinkURL = `/item-timeline/resource/${this.props.match.params._id}`;
          timelineLink = <div className="col-xs-12 col-sm-4">
            <Link href={timelinkURL} to={timelinkURL} className="person-component-link" title="Resource graph timeline"><i className="pe-7s-hourglass" /></Link>
            <Link href={timelinkURL} to={timelinkURL} className="person-component-link-label" title="Resource graph timeline"><label>Timeline</label></Link>
          </div>
        }
        let networkGraphLinkURL = `/${labelGraph}/${_id}`
        let networkGraphLink = <div className="col-xs-12 col-sm-4">
          <Link href={networkGraphLinkURL} to={networkGraphLinkURL} className="person-component-link" title="Resource graph network"><i className="pe-7s-graph1" /></Link>
          <Link href={networkGraphLinkURL} to={networkGraphLinkURL} className="person-component-link-label" title="Resource graph network"><label>Network graph</label></Link>
        </div>;
        content = <div>
          <Card>
            <CardBody>
              <div className="row">
                <div className="col-12">
                  {itemCard}
                </div>
              </div>
              <div className="row timelink-row">
                {timelineLink}
                {networkGraphLink}
              </div>
            </CardBody>
          </Card>
        </div>
        let resource = this.state.item;
        label = resource.label;
        let icon = "pe-7s-photo";
        if (resource.resourceType==="document") {
          icon = "fa fa-file-pdf-o";
        }
        breadcrumbsItems = [
          {label: "Resources", icon: icon, active: false, path: "/resources"},
          {label: label, icon: icon, active: true, path: ""},
        ];
        let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
        updateDocumentTitle(documentTitle);
        let fullsizePath = getResourceFullsizeURL(resource);
        if (fullsizePath!==null && resource.resourceType==="image") {
          let fullsizePath = getResourceFullsizeURL(resource);
          if (resource.resourceType!=="document") {
            imgViewer = <Suspense fallback={renderLoader()}>
              <Viewer
                visible={this.state.viewerVisible}
                path={fullsizePath}
                label={label}
                toggle={this.toggleViewer}
                item={resource}
              />
            </Suspense>
          }
        }
      }
      else if (this.state.error.visible){
        breadcrumbsItems.push({label: this.state.error.text, icon: "fa fa-times", active: true, path: ""});
        let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
        updateDocumentTitle(documentTitle);
        content = <div>
          <Card>
            <CardBody>
              <div className="row">
                <div className="col-12">
                  <h3>Error</h3>
                  <p>{this.state.error.text}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      }
    }
    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
        {imgViewer}
      </div>
    )

  }
}
