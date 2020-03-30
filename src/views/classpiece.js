import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getResourceThumbnailURL, getResourceFullsizeURL} from '../helpers/helpers';
import {parseMetadata} from '../helpers/parse-metadata';
import Viewer from '../components/image-viewer.js';
import TagPeopleSearch from '../components/tag-people-search.js';

class Classpiece extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: {},
      viewerVisible: false,
      tableVisible: {
        metadataDataVisible: false,
      },
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderClasspieceDetails=this.renderClasspieceDetails.bind(this);
    this.renderThumbmailMetadata=this.renderThumbmailMetadata.bind(this);
    
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
      return response.data.data;
	  })
	  .catch(function (error) {
	  });

    this.setState({
      loading: false,
      item: responseData
    });
  }

  toggleTable(e, dataType=null) {
    let newState = Object.assign({}, this.state);    
    if(dataType === "metadataData") {
      newState.tableVisible.metadataDataVisible = !this.state.tableVisible.metadataDataVisible;
    }else if(dataType === "peopleData") {
      newState.tableVisible.peopleDataVisible = !this.state.tableVisible.peopleDataVisible;
    }
    this.setState(newState);
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
    let detailsTableRows = [];
    
    //1.1 classpieceDetails - description
    let descriptionRow = [];
    if (typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      descriptionRow = <tr key={"descriptionRow"}><td colSpan="2"><div className="classpiece-details-description">{item.description}</div></td></tr>;
    }
    detailsTableRows.push(descriptionRow);
    
    //1.2 classpieceDetails - events
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
    detailsTableRows.push(eventsRow);
    
    //1.3 classpieceDetails - organisations
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
    detailsTableRows.push(organisationsRow);
    
    //1.4 classpieceDetails - people
    let peopleRow = <TagPeopleSearch
      key ={"classpieceTagPeopleSearch"}
      name = {"classpiece"}
      peopleItem = {item.people}
    />
    detailsTableRows.push(peopleRow);
    
    //1.5 classpieceDetails - classpieceDetails include description, events, organisations, and people
    return <div className="classpiece-details-container">
            <table key={"classpieceDetails"} className="table table-borderless classpiece-details-table">
              <tbody>{detailsTableRows}</tbody>
            </table>
          </div>
  }
  
  renderThumbmailMetadata(stateData=null) {
    let item = stateData.item;
    
    let thumbmailMetadata = [];
    let metadataRow = [];
    let metadataTitle = [];
    let metadataData = [];
    
    let metadataDataHiden = "";
    if(!stateData.tableVisible.metadataDataVisible){
      metadataDataHiden = " closed";
    }
    
    if(Object.keys(item.metadata).length>0) {
      metadataTitle = <h5 key={"metadataTitle"}>Metadata: 
        <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"metadataData")}}>
          <i className={"fa fa-angle-down"+metadataDataHiden}/>
        </div>
      </h5>;
      metadataData = <div key={"metadataData"}>{parseMetadata(item.metadata.image)}</div>;
      metadataRow.push(metadataTitle,metadataData);
    }
    
    thumbmailMetadata = <div key={"thumbmailMetadata"} className={"metadata-info-container"+metadataDataHiden}>{metadataRow}</div>
    
    return thumbmailMetadata;
    
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
      thumbnailImage = <div key={"thumbnailImage"} className="show-classpiece" onClick={()=>this.toggleViewer()}>
        <img src={thumbnailURL} className="people-thumbnail img-fluid img-thumbnail" alt={label} />
      </div>
    }
    
    //3. thumbmailMetadata
    let thumbmailMetadata = this.renderThumbmailMetadata(stateData);
    
    //All
    let output = <Card>
      <CardBody>
        <h3>{label}</h3>
        <div className="row">
          <div className="col-xs-12 col-sm-6 col-md-7">
            {classpieceDetails}
          </div>
          <div className="col-xs-12 col-sm-6 col-md-5">
            {thumbnailImage}
            {thumbmailMetadata}
          </div>
        </div>
      </CardBody>
    </Card>
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

    if (!this.state.loading) {
      let itemCard = this.renderItem(this.state);
      content = <div>
        <div className="row">
          <div className="col-12">
            {itemCard}
          </div>
        </div>
      </div>
    }
    let resource = this.state.item;
    let label = resource.label;
    let breadcrumbsItems = [
      {label: "Classpieces", icon: "pe-7s-photo", active: false, path: "/classpieces"},
      {label: label, icon: "pe-7s-photo", active: true, path: ""},
    ];
    let imgViewer = [];
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
