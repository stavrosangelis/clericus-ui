import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';

import {Breadcrumbs} from '../components/breadcrumbs';
import {getPersonThumbnailURL} from '../helpers/helpers';
import TagPeopleSearch from '../components/tag-people-search.js';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: {},
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderPersonDetails = this.renderPersonDetails.bind(this);
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
    let url = process.env.REACT_APP_APIPATH+'ui-person';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data;
      let person = responseData.data;
      context.setState({
        loading: false,
        item: person
      });
	  })
	  .catch(function (error) {
	  });
  }

  renderPersonDetails(stateData=null) {
    let item = stateData.item;
    
    //1. PersonDetails
    let meta = [];
        
    //1.1 PersonDetails - events
    let eventsRow = [];
    if (typeof item.events!=="undefined" && item.events!==null && item.events!=="") {
      //item.events = []
      if(Object.keys(item.events).length === 0){
        eventsRow = <tr key={"eventsRow"}><th>Events</th><td/></tr>;
      }
      //item.events = {...} 
      else {
        let eventsData = item.events.map(eachItem =>{
          return <li key={eachItem.ref.label}><a className="tag-bg tag-item" href={"/classpieces"}>{eachItem.ref.label}</a></li>
        })
        eventsRow = <tr key={"eventsRow"}><th>Events</th><td><ul className="tag-list">{eventsData}</ul></td></tr>;
      }
    }
    meta.push(eventsRow);
    
    //1.2 PersonDetails - organisations
    let organisationsRow = [];
    if (typeof item.organisations!=="undefined" && item.organisations!==null && item.organisations!=="") {
      //item.organisations = []
      if(Object.keys(item.organisations).length === 0){
        organisationsRow = <tr key={"organisationsRow"}><th>Organisations</th><td/></tr>;
      }
      //item.organisations = {...} 
      else {
        let organisationsData = item.organisations.map(eachItem =>{
          return <li key={eachItem.ref.label}><a className="tag-bg tag-item" href={"/classpieces"}>{eachItem.ref.label}</a></li>
        })
        organisationsRow = <tr key={"organisationsRow"}><th>Organisations</th><td><ul className="tag-list">{organisationsData}</ul></td></tr>;
      }
    }
    meta.push(organisationsRow);
    
    //1.3 PersonDetails - people   
    let peopleRow = <TagPeopleSearch
      key ={"personTagPeopleSearch"}
      name = {"person"}
      peopleItem = {item.people}
    />
    meta.push(peopleRow);

    //1.5 PersonDetails - PersonDetails include events, organisations, and people
    return <table key={"PersonDetails"} className="table table-borderless person-info-table">
          <tbody>{meta}</tbody>
        </table>
  }

  renderItem(stateData=null) {
    let item = stateData.item;
    
    //1.1 thumbnailImage
    let label = item.firstName;
    let thumbnailImage = [];
    let thumbnailURL = getPersonThumbnailURL(item);
    if (thumbnailURL!==null) {
      thumbnailImage = <img src={thumbnailURL} className="people-thumbnail img-fluid img-thumbnail person-thumbnailImage" alt={label} />
    }
    
    //1.2 label
    if (typeof item.middleName!=="undefined" && item.middleName!==null && item.middleName!=="") {
      label += " "+item.middleName;
    }
    label += " "+item.lastName;
    
    //2.1 meta
    //let metaTable = <Table><tbody>{meta}</tbody></Table>
    let metaTable = this.renderPersonDetails(stateData);
    
    //3 description
    let descriptionRow = []
    if(typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      let descriptionTitle = <h5 key={"descriptionTitle"}>Description:</h5>;
      let descriptionData = <div className="person-des-content" key={"descriptionData"}>{item.description}</div>;
      descriptionRow.push(descriptionTitle,descriptionData);
    }
    
    let output = <Card>
      <CardBody>
        <div className="person-container">
          <div className="row person-info-container">
            <div className="col-xs-12 col-sm-6 col-md-5">
              {thumbnailImage}
              <h5 className="person-label">{label}</h5>
            </div>
            <div className="col-xs-12 col-sm-6 col-md-7">
              {metaTable}
            </div>
          </div>
          <div className="person-des-container">
            {descriptionRow}
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
      let personCard = this.renderItem(this.state);
      content = <div>
        <div className="row">
          <div className="col-12">
            {personCard}
          </div>
        </div>
      </div>
    }

    let label = this.state.item.firstName;
    if (typeof this.state.item.middleName!=="undefined" && this.state.item.middleName!==null && this.state.item.middleName!=="") {
      label += " "+this.state.item.middleName;
    }
    label += " "+this.state.item.lastName;
    let breadcrumbsItems = [
      {label: "People", icon: "pe-7s-users", active: false, path: "/people"},
      {label: label, icon: "pe-7s-user", active: true, path: ""},
    ];
    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
      </div>
    )

  }
}

export default Home;
