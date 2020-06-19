import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';

import {Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {updateDocumentTitle} from '../helpers/helpers';
//import {getEventThumbnailURL} from '../helpers/helpers';
//import TagPeopleSearch from '../components/tag-people-search.js';

class Temporal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: {},
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderTemporalDetails = this.renderTemporalDetails.bind(this);
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
    let url = process.env.REACT_APP_APIPATH+'temporal';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data;
      let temporaldata = responseData.data;
      context.setState({
        loading: false,
        item: temporaldata
      });
	  })
	  .catch(function (error) {
	  });
  }

  renderTemporalDetails(stateData=null) {
    let item = stateData.item;

    //1. TemporalDetails
    let meta = [];
    let dateOrder = {
      name:  ["startDate","endDate"],
      label: ["Start Date","End Date"]
    }

    //1.0 TemporalDetails - events
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

    //1.1 TemporalDetails - dateOrder
    for(let i=0;i<dateOrder.name.length;i++) {
      let dataRow = [];
      let dataItem = item[`${dateOrder.name[i]}`];
      if (typeof dataItem!=="undefined" && dataItem!==null && dataItem!=="") {
        dataRow = <tr key={dateOrder.name[i]}><th>{dateOrder.label[i]}</th><td>{dataItem}</td></tr>;
      }
      meta.push(dataRow);
    }

    //1.5 TemporalDetails - TemporalDetails include all elements of the dateOrder
    return <table key={"TemporalDetails"} className="table table-borderless spatial-content-table">
          <tbody>{meta}</tbody>
        </table>
  }

  renderItem(stateData=null) {
    let item = stateData.item;

    //1.1 Temporal label
    let label = item.label;

    //2.1 meta
    //let metaTable = <Table><tbody>{meta}</tbody></Table>
    let metaTable = this.renderTemporalDetails(stateData);

    //2.2 thumbnailImage
    let thumbnailImage = [];
    /*
    let thumbnailURL = null;//getEventThumbnailURL(item);
    if (thumbnailURL!==null) {
      thumbnailImage = <div key={"thumbnailImage"} className="show-classpiece" onClick={()=>this.toggleViewer()}>
        <img src={thumbnailURL} className="people-thumbnail img-fluid img-thumbnail" alt={label} />
      </div>
    }
    */

    //2.3 description
    let descriptionRow = []
    /*
    if(typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      let descriptionTitle = <h6 key={"descriptionTitle"} className="item-content-des-title">Description:</h6>;
      let descriptionData = <div className="person-des-content" key={"descriptionData"}>{item.description}</div>;
      descriptionRow.push(descriptionTitle,descriptionData);
    }
    */

    let relationshipGraph = null;
    if (typeof this.state.item.status !== "undefined") {
      if (this.state.item.status !== "private") {
        let labelGraph = "temporal-graph";
        let _idGraph = this.props.match.params._id;
        relationshipGraph = <div className="row">
          <div className="col-xs-12 col-md-4">
            <Link href={`/${labelGraph}/${_idGraph}`} to={`/${labelGraph}/${_idGraph}`} className="person-component-link" title="Temporal graph network"><i className="pe-7s-graph1" /></Link>
          </div>
        </div>
      }
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
          {relationshipGraph}
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
      let temporalCard = this.renderItem(this.state);
      content = <div>
        <div className="row">
          <div className="col-12">
            {temporalCard}
          </div>
        </div>
      </div>
    }

    let label = this.state.item.label;
    let breadcrumbsItems = [
      {label: "Temporals", icon: "pe-7s-date", active: false, path: "/temporals"},
      {label: label, icon: "pe-7s-date", active: true, path: ""},
    ];
    let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
    updateDocumentTitle(documentTitle);
    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
      </div>
    )

  }
}

export default Temporal;
