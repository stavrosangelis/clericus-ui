import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';

import {Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getPersonThumbnailURL, updateDocumentTitle, jsonStringToObject, outputDate} from '../helpers';
import defaultThumbnail from '../assets/images/spcc.jpg';
import TagPeopleSearch from '../components/tag-people-search.js';
import Viewer from '../components/image-viewer-resource.js';

class Person extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: null,
      thumbnailVisible: 0,
      viewerVisible: false,
      appellationsVisible: true,
      descriptionVisible: true,
      eventsVisible: true,
      peopleVisible: true,
      classpiecesVisible: true,
      resourcesVisible: true,
      organisationsVisible: true,
      metadataDataVisible: true,
      images: [],
      error: {
        visible: false,
        text: []
      }
    }

    this.load = this.load.bind(this);
    this.toggleTable = this.toggleTable.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderThumbnails = this.renderThumbnails.bind(this);
    this.showThumbnail = this.showThumbnail.bind(this);
    this.renderPersonDetails = this.renderPersonDetails.bind(this);
    this.toggleViewer = this.toggleViewer.bind(this);
  }

  async load() {
    let _id = this.props.match.params._id;
    if (typeof _id==="undefined" || _id===null || _id==="") {
      return false;
    }
    this.setState({
      loading: true
    })
    let params = {
      _id: _id,
    };
    let url = process.env.REACT_APP_APIPATH+'ui-person';
    let person = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
	  });
    if (person.status) {
      this.setState({
        loading: false,
        item: person.data,
        images: getPersonThumbnailURL(person.data)
      });
    }
    else {
      this.setState({
        loading: false,
        error: {
          visible: true,
          text: person.msg
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

  renderPersonDetails(stateData=null) {
    let item = stateData.item;

    //1. PersonDetails
    let meta = [];
    let appellationsRow = [];
    let appellationsHidden = "";
    let appellationsVisibleClass = "";
    if(!this.state.appellationsVisible){
      appellationsHidden = " closed";
      appellationsVisibleClass = "hidden";
    }
    if (typeof item.alternateAppelations!=="undefined" && item.alternateAppelations!==null && item.alternateAppelations!=="" && item.alternateAppelations.length>0) {
      let appellations = item.alternateAppelations.map((a,i)=>{
        let obj = jsonStringToObject(a);
        let label = "";
        let lang = "";
        let note = "";
        if (obj.appelation!=="") {
          label = obj.appelation
        }
        else {
          label = obj.firstName;
          if (obj.middleName!=="") {
            if (label!=="") {
              label += " ";
            }
            label += obj.middleName;
          }
          if (obj.lastName!=="") {
            if (label!=="") {
              label += " ";
            }
            label += obj.lastName;
          }
        }
        if (typeof obj.language!=="undefined" && typeof obj.language.label!=="undefined" && obj.language.label!=="") {
          lang = ` [${obj.language.label}]`;
        }
        if (typeof obj.note!=="undefined" && obj.note!=="") {
          note = <i>{" "+obj.note}</i>;
        }
        let output = <div key={i}>{label}{lang}{note}</div>;
        return output;
      })
      appellationsRow = <div key="appellationsRow">
        <h5>Alternate appellations
          <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"appellations")}}>
            <i className={"fa fa-angle-down"+appellationsHidden}/>
          </div>
        </h5>
        <div className={appellationsVisibleClass}>{appellations}</div>
      </div>;
    }

    let descriptionRow = [];
    let descriptionHidden = "";
    let descriptionVisibleClass = "";
    if(!this.state.descriptionVisible){
      descriptionHidden = " closed";
      descriptionVisibleClass = "hidden";
    }
    if (typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      descriptionRow = <div key="descriptionRow">
        <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"description")}}>
          <i className={"fa fa-angle-down"+descriptionHidden}/>
        </div>
        <div className={descriptionVisibleClass}>{item.description}</div>
      </div>;
    }

    //1.0 PersonDetails - classpieces
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
          classpieces.push(<li key={resource.ref.label}><Link className="tag-bg tag-item" to={url} href={url}>{resource.ref.label}</Link></li>);
        }
        else if (resource.term.label!=="hasRepresentationObject") {
          let url = "/resource/"+resource.ref._id;
          resources.push(<li key={resource.ref.label}><Link className="tag-bg tag-item" href={url} to={url}>{resource.ref.label}</Link></li>)
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

    //1.1 PersonDetails - events
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

    //1.2 PersonDetails - organisations
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

    //1.3 PersonDetails - people
    let peopleRow = <TagPeopleSearch
      key ={"personTagPeopleSearch"}
      name = {"person"}
      peopleItem = {item.people}
    />

    meta.push(appellationsRow);
    meta.push(descriptionRow);
    meta.push(eventsRow);
    meta.push(classpiecesRow);
    meta.push(peopleRow);
    meta.push(organisationsRow);
    meta.push(resourcesRow);

    return meta;
  }

  renderThumbnails(thumbnailURLs, label) {
    let images = thumbnailURLs.thumbnails.map((t,i)=>{
      let visible = " hidden";
      if (i===this.state.thumbnailVisible) {
        visible = "";
      }
      return <img key={i} src={t} className={"people-thumbnail img-fluid img-thumbnail person-thumbnailImage"+visible} alt={label} onClick={()=>this.toggleViewer()}/>
    });
    let navigation = [];
    let prevIndex = this.state.thumbnailVisible-1;
    let nextIndex = this.state.thumbnailVisible+1;
    if (prevIndex<0) {
      prevIndex = thumbnailURLs.thumbnails.length-1;
    }
    if (nextIndex>=thumbnailURLs.thumbnails.length) {
      nextIndex = 0;
    }
    if (thumbnailURLs.thumbnails.length>1) {
      navigation = <div className="item-thumbnails-nav">
        <div className="left" onClick={()=>this.showThumbnail(prevIndex)}>
          <i className="fa fa-chevron-left"/>
        </div>
        <div className="right" onClick={()=>this.showThumbnail(nextIndex)}>
          <i className="fa fa-chevron-right"/>
        </div>
      </div>
    }
    let block = <div className="item-thumbnails" onContextMenu={(e)=>{e.preventDefault();return false;}}>{images}{navigation}</div>
    return block;
  }

  showThumbnail(index) {
    this.setState({
      thumbnailVisible: index
    });
  }

  renderItem(stateData=null) {
    let item = stateData.item;

    //1.1 thumbnailImage
    let label = item.firstName;
    let imgViewer = [];
    let thumbnailImage = <img src={defaultThumbnail} className="people-thumbnail img-fluid img-thumbnail person-thumbnailImage" alt={label} onContextMenu={(e)=>{e.preventDefault();return false;}}/>;
    let thumbnailURLs = this.state.images;
    if (typeof thumbnailURLs.thumbnails!=="undefined" && thumbnailURLs.thumbnails.length>0) {
      thumbnailImage = this.renderThumbnails(thumbnailURLs, label);
      let length = 0;
      let path = "";
      if (typeof this.state.images.fullsize!=="undefined") {
        path = this.state.images.fullsize[this.state.thumbnailVisible];
        length = this.state.images.fullsize.length;
      }
      imgViewer = <Viewer
        visible={this.state.viewerVisible}
        label={label}
        toggle={this.toggleViewer}
        path={path}
        length={length}
        index={this.state.thumbnailVisible}
        setIndex={this.showThumbnail}
      />
    }

    //1.2 label
    if (typeof item.middleName!=="undefined" && item.middleName!==null && item.middleName!=="") {
      label += " "+item.middleName;
    }
    label += " "+item.lastName;
    if (item.honorificPrefix.length>0) {
      let labelHP = item.honorificPrefix.filter(i=>i!=="").join(", ");
      if (labelHP!=="") {
        labelHP = `(${labelHP})`;
      }
      label = `${labelHP} ${label}`;
    }

    //2.1 meta
    let metaTable = this.renderPersonDetails(stateData);
    let output = <div className="person-container">
      <h3>{label}</h3>
      <div className="row person-info-container">
        <div className="col-xs-12 col-sm-6 col-md-5">
          {thumbnailImage}
        </div>
        <div className="col-xs-12 col-sm-6 col-md-7">
          <div className="person-details-container">
            {metaTable}
          </div>
        </div>
      </div>
      {imgViewer}
    </div>
    return output;
  }

  toggleViewer() {
    this.setState({
      viewerVisible: !this.state.viewerVisible
    });
  }

  componentDidMount() {
    this.load();
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
    let breadcrumbsItems = [{label: "People", icon: "pe-7s-users", active: false, path: "/people"}];
    if (!this.state.loading) {
      if (this.state.item!==null) {
        let personCard = this.renderItem(this.state);
        let timelineLink = [];
        if (this.state.item.events.length>0) {
          let timelinkURL = `/item-timeline/person/${this.props.match.params._id}`
          timelineLink = <div className="col-xs-12 col-sm-4">
            <Link href={timelinkURL} to={timelinkURL} className="person-component-link" title="Person graph timeline"><i className="pe-7s-hourglass" /></Link>
            <Link href={timelinkURL} to={timelinkURL} className="person-component-link-label" title="Resource graph timeline"><label>Timeline</label></Link>
          </div>
        }
        let networkGraphLinkURL = `/person-graph/${this.props.match.params._id}`;
        let networkGraphLink = <div className="col-xs-12 col-sm-4">
          <Link href={networkGraphLinkURL} to={networkGraphLinkURL} className="person-component-link" title="Person graph network"><i className="pe-7s-graph1" /></Link>
          <Link href={networkGraphLinkURL} to={networkGraphLinkURL} className="person-component-link-label" title="Resource graph network"><label>Network graph</label></Link>
        </div>
        content = <div>
          <Card>
            <CardBody>
              <div className="row">
                <div className="col-12">
                  {personCard}
                </div>
              </div>
              <div className="row">
                {timelineLink}
                {networkGraphLink}
              </div>
            </CardBody>
          </Card>
        </div>

        label = this.state.item.firstName;
        if (typeof this.state.item.middleName!=="undefined" && this.state.item.middleName!==null && this.state.item.middleName!=="") {
          label += " "+this.state.item.middleName;
        }
        label += " "+this.state.item.lastName;
        breadcrumbsItems.push({label: label, icon: "pe-7s-user", active: true, path: ""});
        let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
        updateDocumentTitle(documentTitle);
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
      </div>
    )

  }
}

export default Person;
