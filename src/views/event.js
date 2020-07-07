import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';

import {Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import TagPeopleSearch from '../components/tag-people-search.js';
import {updateDocumentTitle,outputDate} from '../helpers';

class Event extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: null,
      descriptionVisible: true,
      eventsVisible: true,
      peopleVisible: true,
      classpiecesVisible: true,
      resourcesVisible: true,
      organisationsVisible: true,
      datesVisible: true,
      error: {
        visible: false,
        text: ""
      }
    }

    this.load = this.load.bind(this);
    this.toggleTable = this.toggleTable.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderEventDetails = this.renderEventDetails.bind(this);
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
    let url = process.env.REACT_APP_APIPATH+'ui-event';
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
      console.log(error)
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

  renderEventDetails(stateData=null) {
    let item = stateData.item;

    //1. OrganisationDetails
    let meta = [];

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

    //1.0 OrganisationDetails - classpieces
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

    //1.1 OrganisationDetails - events
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


    //1.2 OrganisationDetails - organisations
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

    //1.3 OrganisationDetails - people
    let peopleRow = <TagPeopleSearch
      key ={"organisationTagPeopleSearch"}
      name = {"organisation"}
      peopleItem = {item.people}
    />

    let datesRow = [];
    let datesHidden = "";
    let datesVisibleClass = "";
    if(!this.state.datesVisible){
      datesHidden = " closed";
      datesVisibleClass = "hidden";
    }
    if (typeof item.temporal!=="undefined" && item.temporal!==null && item.temporal.length>0) {
      let temporalData = item.temporal.map(eachItem =>{
        let temp = eachItem.ref;
        console.log(temp)
        let tempLabel = [<span key="label">{temp.label}</span>];
        let tLabel = "";
        if (typeof temp.startDate!=="undefined" && temp.startDate!=="") {
          tLabel = outputDate(temp.startDate)
        }
        if (typeof temp.endDate!=="undefined" && temp.endDate!=="") {
          tLabel += " - "+outputDate(temp.endDate);
        }
        tempLabel.push(<span key="dates">[{tLabel}]</span>);
        let url = "/temporal/"+temp._id;
        return <li key={temp._id}><Link className="tag-bg tag-item" href={url} to={url}>{tempLabel}</Link></li>
      })
      datesRow = <div key="dates">
        <h5>Dates <small>[{item.temporal.length}]</small>
          <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"dates")}}>
            <i className={"fa fa-angle-down"+datesHidden}/>
          </div>
        </h5>
        <div className={datesVisibleClass}><ul className="tag-list">{temporalData}</ul></div>
      </div>;
    }

    let locationsRow = [];

    meta.push(peopleRow);
    meta.push(organisationsRow);
    meta.push(classpiecesRow);
    meta.push(resourcesRow);
    meta.push(eventsRow);
    meta.push(datesRow);
    meta.push(locationsRow);
    meta.push(descriptionRow);

    return meta;
  }

  renderItem(stateData=null) {
    let item = stateData.item;

    //1.1 Event label
    let label = item.label;
    let eventType = <h6 className="event-type"><i>{item.eventType.inverseLabel}</i></h6>;
    //2.1 meta
    //let metaTable = <Table><tbody>{meta}</tbody></Table>
    let metaTable = this.renderEventDetails(stateData);

    //2.2 thumbnailImage
    let thumbnailImage = [];
    let thumbnailColClass = "col-0";
    let contentColClass = "col-12";
    let thumbnailURL = null;
    if (thumbnailURL!==null) {
      thumbnailImage = <div key={"thumbnailImage"} className="show-classpiece" onClick={()=>this.toggleViewer()}>
        <img src={thumbnailURL} className="people-thumbnail img-fluid img-thumbnail" alt={label} />
      </div>
      thumbnailColClass = "col-xs-12 col-sm-6 col-md-5";
      contentColClass = "col-xs-12 col-sm-6 col-md-7";
    }

    let output = <div className="item-container">
      <h3>{label}</h3>
      {eventType}
      <div className="row item-info-container">
        <div className={thumbnailColClass}>
          {thumbnailImage}
        </div>
        <div className={contentColClass}>
          <div className="item-details-container">
            {metaTable}
          </div>
        </div>
      </div>
    </div>

    return output;
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
    let breadcrumbsItems = [{label: "Events", icon: "pe-7s-date", active: false, path: "/events"}];
    if (!this.state.loading) {
      if (this.state.item!==null) {
        let eventCard = this.renderItem(this.state);

        let networkGraphLinkURL = `/event-graph/${this.props.match.params._id}`;
        let networkGraphLink = <div className="col-xs-12 col-sm-4">
          <Link href={networkGraphLinkURL} to={networkGraphLinkURL} className="person-component-link" title="Event graph network"><i className="pe-7s-graph1" /></Link>
          <Link href={networkGraphLinkURL} to={networkGraphLinkURL} className="person-component-link-label" title="Event graph network"><label>Network graph</label></Link>
        </div>;
        content = <div>
          <Card>
            <CardBody>
              <div className="row">
                <div className="col-12">
                  {eventCard}
                </div>
              </div>
              <div className="row">
                {networkGraphLink}
              </div>
            </CardBody>
          </Card>
        </div>

        label = this.state.item.label;
        breadcrumbsItems.push({label: label, icon: "pe-7s-date", active: true, path: ""});
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

export default Event;
