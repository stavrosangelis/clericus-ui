import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';

import {Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getEventThumbnailURL} from '../helpers/helpers';
import TagPeopleSearch from '../components/tag-people-search.js';

class Event extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: {},
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderEventDetails = this.renderEventDetails.bind(this);
  }

  load() {
    let _id = this.props.match.params._id;
    if (typeof _id==="undefined" || _id===null || _id==="") {
      return false;
    }
    this.setState({
      loading: true
    })
    let context = this;
    let params = {
      _id: _id,
    };
    let url = process.env.REACT_APP_APIPATH+'ui-event';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data;
      let eventdata = responseData.data;
      context.setState({
        loading: false,
        item: eventdata
      });
	  })
	  .catch(function (error) {
	  });
  }

  renderEventDetails(stateData=null) {
    let item = stateData.item;

    //1. EventDetails
    let meta = [];

    //1.0 EventDetails - classpieces
    let classpiecesRow = [];
    if (typeof item.resources!=="undefined" && item.resources!==null && item.resources!=="") {
      let classpiecesData = item.resources.map(eachItem =>{
        if(eachItem.term.label==="hasRepresentationObject"){
          return <li key={eachItem.ref.label}><a className="tag-bg tag-item" href={"/classpiece/"+eachItem.ref._id}>{eachItem.ref.label}</a></li>
        }
        else {
          return null;
        }
      })
      classpiecesRow = <tr key={"classpiecesRow"}><th>Classpieces</th><td><ul className="tag-list">{classpiecesData}</ul></td></tr>;
    }
    meta.push(classpiecesRow);

    //1.1 EventDetails - events
    let eventsRow = [];
    if (typeof item.events!=="undefined" && item.events!==null && item.events!=="") {
      //item.events = []
      if(Object.keys(item.events).length === 0){
        eventsRow = <tr key={"eventsRow"}><th>Events</th><td/></tr>;
      }
      //item.events = {...}
      else {
        let eventsData = item.events.map(eachItem =>{
          return <li key={eachItem.ref.label}><a className="tag-bg tag-item" href={"/event/"+eachItem.ref._id}>{eachItem.ref.label}</a></li>
        })
        eventsRow = <tr key={"eventsRow"}><th>Events</th><td><ul className="tag-list">{eventsData}</ul></td></tr>;
      }
    }
    meta.push(eventsRow);

    //1.2 EventDetails - organisations
    let organisationsRow = [];
    if (typeof item.organisations!=="undefined" && item.organisations!==null && item.organisations!=="") {
      //item.organisations = []
      if(Object.keys(item.organisations).length === 0){
        organisationsRow = <tr key={"organisationsRow"}><th>Organisations</th><td/></tr>;
      }
      //item.organisations = {...}
      else {
        let organisationsData = item.organisations.map(eachItem =>{
          return <li key={eachItem.ref.label}><a className="tag-bg tag-item" href={"/organisation/"+eachItem.ref._id}>{eachItem.ref.label}</a></li>
        })
        organisationsRow = <tr key={"organisationsRow"}><th>Organisations</th><td><ul className="tag-list">{organisationsData}</ul></td></tr>;
      }
    }
    meta.push(organisationsRow);

    //1.3 EventDetails - people
    let peopleRow = <TagPeopleSearch
      key ={"eventTagPeopleSearch"}
      name = {"event"}
      peopleItem = {item.people}
    />
    meta.push(peopleRow);

    //1.5 EventDetails - EventDetails include classpieces, events, organisations, and people
    return <table key={"EventDetails"} className="table table-borderless item-content-table">
          <tbody>{meta}</tbody>
        </table>
  }

  renderItem(stateData=null) {
    let item = stateData.item;

    //1.1 Event label
    let label = item.label;

    //2.1 meta
    //let metaTable = <Table><tbody>{meta}</tbody></Table>
    let metaTable = this.renderEventDetails(stateData);

    //2.2 thumbnailImage
    let thumbnailImage = [];
    let thumbnailURL = getEventThumbnailURL(item);
    if (thumbnailURL!==null) {
      thumbnailImage = <div key={"thumbnailImage"} className="show-classpiece" onClick={()=>this.toggleViewer()}>
        <img src={thumbnailURL} className="people-thumbnail img-fluid img-thumbnail" alt={label} />
      </div>
    }

    //2.3 description
    let descriptionRow = []
    if(typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      let descriptionTitle = <h6 key={"descriptionTitle"} className="item-content-des-title">Description:</h6>;
      let descriptionData = <div className="person-des-content" key={"descriptionData"}>{item.description}</div>;
      descriptionRow.push(descriptionTitle,descriptionData);
    }
    
    let labelGraph = "event-graph";
    let _idGraph = this.props.match.params._id;
    
    let timelineLink = [];
    if (this.state.item.events.length>0) {
      timelineLink = <div className="col-xs-12 col-sm-4">
        <Link href={`/item-timeline/event/${this.props.match.params._id}`} to={`/item-timeline/event/${this.props.match.params._id}`} className="person-component-link" title="Event graph timeline"><i className="pe-7s-hourglass" /></Link>
      </div>
    }

    let output = <Card>
      <CardBody>
        <div className="item-container">
          <div className="item-title-container">
            <h4 className="item-label">{label}</h4>
          </div>
          <div className="row item-content-container">
            <div className="col-xs-12 col-sm-6 col-md-8">
              <div className="item-content-des">
                {descriptionRow}
              </div>
              {metaTable}
            </div>
            <div className="col-xs-12 col-sm-6 col-md-4">
              {thumbnailImage}
            </div>
          </div>
          <div className="row">
            {timelineLink}
            <div className="col-xs-12 col-md-4">
              <Link href={`/${labelGraph}/${_idGraph}`} to={`/${labelGraph}/${_idGraph}`} className="person-component-link" title="Event graph network"><i className="pe-7s-graph1" /></Link>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
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

    if (!this.state.loading) {
      let eventCard = this.renderItem(this.state);
      content = <div>
        <div className="row">
          <div className="col-12">
            {eventCard}
          </div>
        </div>
      </div>
    }

    let label = this.state.item.label;
    let breadcrumbsItems = [
      {label: "Events", icon: "pe-7s-date", active: false, path: "/events"},
      {label: label, icon: "pe-7s-date", active: true, path: ""},
    ];
    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
      </div>
    )

  }
}

export default Event;
