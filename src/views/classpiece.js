import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';

import {Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getResourceThumbnailURL, getResourceFullsizeURL, outputDate} from '../helpers';
import {parseMetadata} from '../helpers/parse-metadata';
import Viewer from '../components/image-viewer.js';
import TagPeopleSearch from '../components/tag-people-search.js';
import {updateDocumentTitle} from '../helpers';

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

    //1.1 classpieceDetails - description
    let descriptionRow = [];
    let descriptionHidden = "";
    let descriptionVisibleClass = "";
    if(!this.state.descriptionVisible){
      descriptionHidden = " closed";
      descriptionVisibleClass = "hidden";
    }
    if (typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      descriptionRow = descriptionRow = <div key="descriptionRow">
        <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"description")}}>
          <i className={"fa fa-angle-down"+descriptionHidden}/>
        </div>
        <div className={descriptionVisibleClass}>{item.description}</div>
      </div>;
    }

    let classpiecesRow = [];
    let classpiecesHidden = "";
    let classpiecesVisibleClass = "";
    if(!this.state.classpiecesVisible){
      classpiecesHidden = " closed";
      classpiecesVisibleClass = "hidden";
    }
    let resourcesRow = [];
    let resourcesHidden = "";
    let resourcesVisibleClass = "";
    if(!this.state.resourcesVisible){
      resourcesHidden = " closed";
      resourcesVisibleClass = "hidden";
    }
    if (typeof item.resources!=="undefined" && item.resources!==null && item.resources!=="") {
      let classpieces = [];
      let resources = [];
      for (let i=0;i<item.resources.length; i++) {
        let resource = item.resources[i];
        if(resource.term.label==="isDepictedOn"){
          let url = "/classpiece/"+resource.ref._id;
          classpieces.push(<li key={resource.ref._id}><Link className="tag-bg tag-item" to={url} href={url}>{resource.ref.label}</Link></li>);
        }
        else if (resource.term.label!=="hasRepresentationObject") {
          let url = "/resource/"+resource.ref._id;
          resources.push(<li key={resource.ref._id}><Link className="tag-bg tag-item" href={url} to={url}>{resource.ref.label}</Link></li>)
        }
      }
      if (classpieces.length>0) {
        classpiecesRow = <div key="classpiecesRow">
          <h5>Classpieces <small>[{classpieces.length}]</small>
            <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"classpieces")}}>
              <i className={"fa fa-angle-down"+classpiecesHidden}/>
            </div>
          </h5>
          <div className={classpiecesVisibleClass}><ul className="tag-list">{classpieces}</ul></div>
        </div>;
      }
      if (resources.length>0) {
        resourcesRow = <div key="resourcesRow">
          <h5>Resources <small>[{resources.length}]</small>
            <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"resources")}}>
              <i className={"fa fa-angle-down"+resourcesHidden}/>
            </div>
          </h5>
          <div className={resourcesVisibleClass}><ul className="tag-list">{resources}</ul></div>
        </div>;
      }
    }

    //1.2 classpieceDetails - events
    let eventsRow = [];
    let eventsHidden = "";
    let eventsVisibleClass = "";
    if(!this.state.eventsVisible){
      eventsHidden = " closed";
      eventsVisibleClass = "hidden";
    }
    if (typeof item.events!=="undefined" && item.events!==null && item.events!=="") {
      if (item.events.length>0) {
        let eventsData = item.events.map(eachItem =>{
          let label = [<span key="label">{eachItem.ref.label}</span>];
          if (typeof eachItem.temporal!=="undefined" && eachItem.temporal.length>0) {
            let temporalLabels = eachItem.temporal.map((t,i)=>{
              let temp = t.ref;
              let tLabel = "";
              if (typeof temp.startDate!=="undefined" && temp.startDate!=="") {
                tLabel = outputDate(temp.startDate)
              }
              if (typeof temp.endDate!=="undefined" && temp.endDate!=="") {
                tLabel += " - "+outputDate(temp.endDate);
              }
              return `[${tLabel}]`;
            });
            if (temporalLabels.length>0) {
              let temporalLabel = temporalLabels.join(" | ");
              label.push(<span key="dates">{temporalLabel}</span>);
            }
          }
          let url = "/event/"+eachItem.ref._id;
          return <li key={eachItem.ref.label}><Link className="tag-bg tag-item" href={url} to={url}>{label}</Link></li>
        })
        eventsRow = <div key="events">
        <h5>Events <small>[{item.events.length}]</small>
        <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"events")}}>
          <i className={"fa fa-angle-down"+eventsHidden}/>
        </div>
        </h5>
        <div className={eventsVisibleClass}><ul className="tag-list">{eventsData}</ul></div>
        </div>;
      }
    }

    //1.3 classpieceDetails - organisations
    let organisationsRow = [];
    let organisationsHidden = "";
    let organisationsVisibleClass = "";
    if(!this.state.organisationsVisible){
      organisationsHidden = " closed";
      organisationsVisibleClass = "hidden";
    }
    if (typeof item.organisations!=="undefined" && item.organisations!==null && item.organisations!=="") {
      if (item.organisations.length>0) {
        let organisationsData = item.organisations.map(eachItem =>{

          let url = "/organisation/"+eachItem.ref._id;
          return <li key={eachItem.ref.label}><Link className="tag-bg tag-item" href={url} to={url}>{eachItem.ref.label}</Link></li>
        })
        organisationsRow = <div key="organisations">
          <h5>Organisations <small>[{item.organisations.length}]</small>
            <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"organisations")}}>
              <i className={"fa fa-angle-down"+organisationsHidden}/>
            </div>
          </h5>
          <div className={organisationsVisibleClass}><ul className="tag-list">{organisationsData}</ul></div>
        </div>;
      }
    }

    //1.4 classpieceDetails - people
    let peopleRow = <TagPeopleSearch
      key ={"classpieceTagPeopleSearch"}
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
