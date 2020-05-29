import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';

import {Breadcrumbs} from '../components/breadcrumbs';
import {getOrganisationThumbnailURL} from '../helpers/helpers';
import TagPeopleSearch from '../components/tag-people-search.js';

class Organisation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: {},
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderOrganisationDetails = this.renderOrganisationDetails.bind(this);
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
    let url = process.env.REACT_APP_APIPATH+'ui-organisation';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data;
      let organisationdata = responseData.data;
      context.setState({
        loading: false,
        item: organisationdata
      });
	  })
	  .catch(function (error) {
	  });
  }

  renderOrganisationDetails(stateData=null) {
    let item = stateData.item;
    
    //1. OrganisationDetails
    let meta = [];
    
    //1.0 OrganisationDetails - classpieces
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
        
    //1.1 OrganisationDetails - events
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
    
    //1.2 OrganisationDetails - organisations
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
    
    //1.3 OrganisationDetails - people   
    let peopleRow = <TagPeopleSearch
      key ={"organisationTagPeopleSearch"}
      name = {"organisation"}
      peopleItem = {item.people}
    />
    meta.push(peopleRow);

    //1.5 OrganisationDetails - OrganisationDetails include classpieces, events, organisations, and people
    return <table key={"OrganisationDetails"} className="table table-borderless item-content-table">
          <tbody>{meta}</tbody>
        </table>
  }

  renderItem(stateData=null) {
    let item = stateData.item;
    
    //1.1 Organisation label
    let label = item.label;
    
    //2.1 meta
    //let metaTable = <Table><tbody>{meta}</tbody></Table>
    let metaTable = this.renderOrganisationDetails(stateData);
    
    //2.2 thumbnailImage
    let thumbnailImage = [];
    let thumbnailURL = getOrganisationThumbnailURL(item);
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
      let organisationCard = this.renderItem(this.state);
      content = <div>
        <div className="row">
          <div className="col-12">
            {organisationCard}
          </div>
        </div>
      </div>
    }

    let label = this.state.item.label;
    let breadcrumbsItems = [
      {label: "Organisations", icon: "pe-7s-culture", active: false, path: "/organisations"},
      {label: label, active: true, path: ""},
    ];
    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
      </div>
    )

  }
}

export default Organisation;
