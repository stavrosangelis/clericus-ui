import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';

import {connect} from "react-redux";
import {Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getResourceThumbnailURL, getResourceFullsizeURL} from '../helpers/helpers';
import {parseMetadata} from '../helpers/parse-metadata';
import Viewer from '../components/image-viewer-resource.js';
import TagPeopleSearch from '../components/tag-people-search.js';

const mapStateToProps = state => {
  let loadingResourcesType = state.loadingResourcesType || null;
  let resourcesType = state.resourcesType || null;
  return {
    loadingResourcesType: loadingResourcesType,
    resourcesType: resourcesType,
   };
};

class Resource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: {},
      viewerVisible: false,
      tableVisible: {
        metadataDataVisible: false,
      },
      pageID: null,
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderResourceDetails=this.renderResourceDetails.bind(this);
    this.renderThumbmailMetadata=this.renderThumbmailMetadata.bind(this);

    this.toggleViewer = this.toggleViewer.bind(this);
    this.toggleTable = this.toggleTable.bind(this);
    this.setResourceID = this.setResourceID.bind(this);
    this.getSystemType = this.getSystemType.bind(this);
  }

  async load() {
    let _id = this.props.match.params._id;
    if (this.state.pageID !== null) {
      _id = this.state.pageID;
    }
    
    if (typeof _id==="undefined" || _id===null || _id==="") {
      return false;
    }
    this.setState({
      loading: true,
      pageID: null,
    });
    let params = {
      _id: _id,
    };
    let url = process.env.REACT_APP_APIPATH+'resource';
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
  
  setResourceID(_id) {
    this.setState({
      pageID: _id,
      viewerVisible: false,
    });
    let context = this;
    setTimeout(function() {
      context.load();
    },10);
  }

  componentDidMount() {
    this.load();
  }
  
  getSystemType() {
    for(let i=0;i<this.props.resourcesType.length;i++) {
      if(this.state.item.systemType === this.props.resourcesType[i]._id) {
        return this.props.resourcesType[i].label;
      }
    }
  }

  renderResourceDetails(stateData=null, systemType) {
    let item = stateData.item;

    //1. resourceDetails
    let detailsTableRows = [];

    //1.1 resourceDetails - description
    let descriptionRow = [];
    if (typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      descriptionRow = <tr key={"descriptionRow"}><td colSpan="2"><div className="resource-details-description">{item.description}</div></td></tr>;
    }
    detailsTableRows.push(descriptionRow);

    //1.2 resourceDetails - events
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
    detailsTableRows.push(eventsRow);

    //1.3 resourceDetails - organisations
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
    detailsTableRows.push(organisationsRow);

    //1.4 resourceDetails - people
    let peopleRow = <TagPeopleSearch
      key ={"resourceTagPeopleSearch"}
      name = {"resource"}
      peopleItem = {item.people}
    />
    detailsTableRows.push(peopleRow);

    //1.5 resourceDetails - resourceDetails include description, events, organisations, and people
    let output = null;
    if (systemType === "Classpiece") {
      output = <div className="resource-details-container">
        <table key={"resourceDetails"} className="table table-borderless resource-details-table">
          <tbody>{detailsTableRows}</tbody>
        </table>
      </div>
    }
    else if (systemType === "Thumbnail") {
      output =
        <table key={"resourceDetails"} className="table table-borderless person-info-table">
          <tbody>{detailsTableRows}</tbody>
        </table>
    }
    return output;
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

  renderItem(stateData=null, systemType) {
    let item = stateData.item;
    let label = item.label;

    //1 resourceDetails - resourceDetails include description, events, organisations, and people
    let resourceDetails = this.renderResourceDetails(stateData, systemType);

    //2. thumbnailImage
    let thumbnailImage = [];
    let thumbnailURL = getResourceThumbnailURL(item);
    let personClassType = "";
    if (systemType === "Thumbnail") {
      personClassType = " person-thumbnailImage";
    }
    if (thumbnailURL!==null) {
      thumbnailImage = <div key={"thumbnailImage"} className="show-resource" onClick={()=>this.toggleViewer()}>
        <img src={thumbnailURL} className={"people-thumbnail img-fluid img-thumbnail"+personClassType} alt={label} />
      </div>
    }

    //3. thumbmailMetadata
    let thumbmailMetadata = this.renderThumbmailMetadata(stateData);

    //4 description
    let descriptionRow = []
    if(typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      let descriptionTitle = <h5 key={"descriptionTitle"}>Description:</h5>;
      let descriptionData = <div className="person-des-content" key={"descriptionData"}>{item.description}</div>;
      descriptionRow.push(descriptionTitle,descriptionData);
    }

    let output = null;
    if (systemType === "Classpiece") {
      //All
      output = <div>
        <h3>{label}</h3>
        <div className="row">
          <div className="col-xs-12 col-sm-6 col-md-7">
            {resourceDetails}
          </div>
          <div className="col-xs-12 col-sm-6 col-md-5">
            {thumbnailImage}
            {thumbmailMetadata}
          </div>
        </div>
      </div>
    }
    else if (systemType === "Thumbnail") {
      output = <div className="person-container">
        <div className="row person-info-container">
          <div className="col-xs-12 col-sm-6 col-md-5">
            {thumbnailImage}
            <h5 className="person-label">{label}</h5>
          </div>
          <div className="col-xs-12 col-sm-6 col-md-7">
            {resourceDetails}
          </div>
        </div>
        <div className="person-des-container">
          {descriptionRow}
        </div>
      </div>
    }
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

    if (!this.state.loading && !this.props.loadingResourcesType) {
      let systemType = this.getSystemType();
      let itemCard = this.renderItem(this.state, systemType);
      
      let labelGraph = "resource-graph";
      let _idGraph = this.props.match.params._id;

      let timelineLink = [];
      if (this.state.item.events.length>0) {
        timelineLink = <div className="col-xs-12 col-sm-4">
          <Link href={`/item-timeline/resource/${this.props.match.params._id}`} to={`/item-timeline/resource/${this.props.match.params._id}`} className="person-component-link" title="Resource graph network"><i className="pe-7s-hourglass" /></Link>
        </div>
      }
      
      content = <div>
        <Card>
          <CardBody>
            <div className="row">
              <div className="col-12">
                {itemCard}
              </div>
            </div>
            <div className="row">
              {timelineLink}
              <div className="col-xs-12 col-sm-4">
                <Link href={`/${labelGraph}/${_idGraph}`} to={`/${labelGraph}/${_idGraph}`} className="person-component-link" title="Resource graph network"><i className="pe-7s-graph1" /></Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    }
    let resource = this.state.item;
    let label = resource.label;
    let breadcrumbsItems = [
      {label: "Resources", icon: "pe-7s-photo", active: false, path: "/resources"},
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
        setResourceID={this.setResourceID}
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

export default Resource = connect(mapStateToProps, null)(Resource);;