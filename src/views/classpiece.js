import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';

import {Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getResourceThumbnailURL, getResourceFullsizeURL} from '../helpers';
import {parseMetadata} from '../helpers/parse-metadata';
import Viewer from '../components/image-viewer.js';
import {updateDocumentTitle} from '../helpers';
import DescriptionBlock from '../components/item-blocks/description';
import ResourcesBlock from '../components/item-blocks/resources';
import ClasspiecesBlock from '../components/item-blocks/classpieces';
import EventsBlock from '../components/item-blocks/events';
import OrganisationsBlock from '../components/item-blocks/organisations';
import PeopleBlock from '../components/item-blocks/people';

class Classpiece extends Component {
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
      metadataDataVisible: true,
      error: {
        visible: false,
        text: []
      }
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderClasspieceDetails=this.renderClasspieceDetails.bind(this);
    this.renderThumbnailMetadata=this.renderThumbnailMetadata.bind(this);

    this.toggleViewer = this.toggleViewer.bind(this);
    this.toggleTable = this.toggleTable.bind(this);
  }

  async load() {
    let _id = this.props.match.params._id;
    if (typeof _id==="undefined" || _id===null || _id==="") {
      return false;
    }
    this.setState({
      loading: true
    });
    let params = {
      _id: _id,
    };
    let url = process.env.REACT_APP_APIPATH+'classpiece';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
      console.log(error);
	  });
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

  renderClasspieceDetails(stateData=null) {
    let item = stateData.item;

    //1. classpieceDetails
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
      descriptionRow = <DescriptionBlock key="descriptionRow" toggleTable={this.toggleTable} hidden={descriptionHidden} visible={descriptionVisibleClass} description={item.description}/>
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
      classpiecesRow = <ClasspiecesBlock key="classpieces" toggleTable={this.toggleTable} hidden={classpiecesHidden} visible={classpiecesVisibleClass} items={item.classpieces} />
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
      resourcesRow = <ResourcesBlock key="resourcesRow" toggleTable={this.toggleTable} hidden={resourcesHidden} visible={resourcesVisibleClass} resources={item.resources} />
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
      eventsRow = <EventsBlock key="eventsRow" toggleTable={this.toggleTable} hidden={eventsHidden} visible={eventsVisibleClass} events={item.events} />
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
      organisationsRow = <OrganisationsBlock key="organisationsRow" toggleTable={this.toggleTable} hidden={organisationsHidden} visible={organisationsVisibleClass} organisations={item.organisations} />
    }

    // people
    let peopleRow = <PeopleBlock
      key ={"classpiecePeople"}
      name = {"classpiece"}
      peopleItem = {item.people}
    />

    detailsOutput.push(descriptionRow);
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
    //1.6 classpieceDetails - classpieceDetails include description, events, organisations, and people

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

    //1 classpieceDetails - classpieceDetails include description, events, organisations, and people
    let classpieceDetails = this.renderClasspieceDetails(stateData);

    //2. thumbnailImage
    let thumbnailImage = [];
    let thumbnailURL = getResourceThumbnailURL(item);
    if (thumbnailURL!==null) {
      thumbnailImage = <div key={"thumbnailImage"} className="show-classpiece" onClick={()=>this.toggleViewer()}  onContextMenu={(e)=>{e.preventDefault();return false;}}>
        <img src={thumbnailURL} className="people-thumbnail img-fluid img-thumbnail" alt={label} />
      </div>
    }

    let output = <div>
      <h3>{label}</h3>
      <div className="row">
        <div className="col-xs-12 col-sm-6 col-md-7">
          {classpieceDetails}
        </div>
        <div className="col-xs-12 col-sm-6 col-md-5">
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

    let imgViewer = [];

    let label = "";
    let breadcrumbsItems = [
      {label: "Classpieces", icon: "pe-7s-photo", active: false, path: "/classpieces"},
    ];
    if (!this.state.loading) {
      if (this.state.item!==null) {
        let itemCard = this.renderItem(this.state);
        let timelineLink = [];
        if (this.state.item.events.length>0) {
          let timelinkURL = `/item-timeline/classpiece/${this.props.match.params._id}`;
          timelineLink = <div className="col-xs-12 col-sm-4">
            <Link href={timelinkURL} to={timelinkURL} className="person-component-link" title="Classpiece graph timeline"><i className="pe-7s-hourglass" /></Link>
            <Link href={timelinkURL} to={timelinkURL} className="person-component-link-label" title="Classpiece graph timeline"><label>Timeline</label></Link>
          </div>
        }
        let networkGraphLinkURL = `/classpiece-graph/${this.props.match.params._id}`;
        let networkGraphLink = <div className="col-xs-12 col-sm-4">
          <Link href={networkGraphLinkURL} to={networkGraphLinkURL} className="person-component-link" title="Classpiece graph network"><i className="pe-7s-graph1" /></Link>
          <Link href={networkGraphLinkURL} to={networkGraphLinkURL} className="person-component-link-label" title="Resource graph network"><label>Network graph</label></Link>
        </div>

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
        breadcrumbsItems.push({label: label, icon: "pe-7s-photo", active: true, path: ""});
        let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
        updateDocumentTitle(documentTitle);
        let fullsizePath = getResourceFullsizeURL(resource);
        if (fullsizePath!==null && resource.resourceType==="image") {
        let fullsizePath = getResourceFullsizeURL(resource);
        imgViewer = <Viewer
          visible={this.state.viewerVisible}
          path={fullsizePath}
          label={label}
          toggle={this.toggleViewer}
          item={resource}
        />
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

export default Classpiece;
