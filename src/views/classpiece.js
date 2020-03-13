import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getResourceThumbnailURL, getResourceFullsizeURL} from '../helpers/helpers';
import Viewer from '../components/image-viewer.js';

class Classpiece extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: {},
      viewerVisible: false,
      tableVisible: {
        metadataDataVisible: false,
        peopleDataVisible: false,
      }
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.parseMetadata = this.parseMetadata.bind(this);
    this.parseMetadataItems = this.parseMetadataItems.bind(this);
    this.toggleViewer = this.toggleViewer.bind(this);
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

  renderItem(stateData=null) {
    let item = stateData.item;
    let label = item.label;
    
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
      let eventsData = item.events.map(eachItem =>{
        return <li key={eachItem.ref.label}><a className="tag-bg tag-item" href={"/classpieces"}>{eachItem.ref.label}</a></li>
      })
      eventsRow = <tr key={"eventsRow"}><th>Events</th><td><ul className="tag-list">{eventsData}</ul></td></tr>;
    }
    detailsTableRows.push(eventsRow);
    
    //1.3 classpieceDetails - organisations
    let organisationsRow = [];
    if (typeof item.organisations!=="undefined" && item.organisations!==null && item.organisations!=="") {
      let organisationsData = item.organisations.map(eachItem =>{
        return <li key={eachItem.ref.label}><a className="tag-bg tag-item" href={"/classpieces"}>{eachItem.ref.label}</a></li>
      })
      organisationsRow = <tr key={"organisationsRow"}><th>Organisations</th><td><ul className="tag-list">{organisationsData}</ul></td></tr>;
    }
    detailsTableRows.push(organisationsRow);
    
    //1.4 classpieceDetails - people
    let peopleDataHiden = "";
    if(!stateData.tableVisible.peopleDataVisible){
      peopleDataHiden = " closed";
    }
    
    let peopleRow = [];
    if (typeof item.people!=="undefined" && item.people!==null && item.people!=="") {
      let peopleDataExpand = [];
      if(!stateData.tableVisible.peopleDataVisible){
        peopleDataExpand = <li key={"dot"} ><a className="tag-bg tag-item" href="#" onClick={(e)=>{this.toggleTable(e,"peopleData")}}>...</a></li>;
      }
      let peopleData = item.people.map(eachItem=>{
        return <li key={eachItem.ref._id}><a className="tag-bg tag-item" href={"/person/"+eachItem.ref._id}>{eachItem.ref.label}</a></li>
      })
      peopleRow = <tr key={"peopleRow"}>
                    <th>People</th>
                    <td>
                      <div className={"people-info-container"+peopleDataHiden}>
                        <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{this.toggleTable(e,"peopleData")}}>
                          <i className={"fa fa-angle-down"+peopleDataHiden}/>
                        </div>
                        <ul className="tag-list tag-list-people">
                          {peopleDataExpand}{peopleData}
                        </ul>
                      </div>
                    </td>
                  </tr>;
    }
    detailsTableRows.push(peopleRow);
    
    //1.5 classpieceDetails - classpieceDetails include description, events, organisations, and people
    let classpieceDetails = <div className="classpiece-details-container"><table key={"classpieceDetails"} className="table table-borderless classpiece-details-table"><tbody>{detailsTableRows}</tbody></table></div>
    
    //2. thumbnailImage    
    let thumbnailImage = [];
    let thumbnailURL = getResourceThumbnailURL(item);
    if (thumbnailURL!==null) {
      thumbnailImage = <div key={"thumbnailImage"} className="show-classpiece" onClick={()=>this.toggleViewer()}>
        <img src={thumbnailURL} className="people-thumbnail img-fluid img-thumbnail" alt={label} />
      </div>
    }
    
    //3. thumbmailMetadata
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
      metadataData = <div key={"metadataData"}>{this.parseMetadata(item.metadata.image)}</div>;
      metadataRow.push(metadataTitle,metadataData);
    }
    thumbmailMetadata = <div key={"thumbmailMetadata"} className={"metadata-info-container"+metadataDataHiden}>{metadataRow}</div>
    
    //All
    let output = <Card>
      <CardBody>
        <h3>{label}</h3>
        <div className="row">
          <div className="col-xs-12 col-sm-6 col-md-7 pull-left">
            {classpieceDetails}
          </div>
          <div className="col-xs-12 col-sm-6 col-md-5 pull-right">
            {thumbnailImage}
            {thumbmailMetadata}
          </div>
        </div>
      </CardBody>
    </Card>
    return output;
  }

  parseMetadata(metadata) {
    if (metadata===null) {
      return false;
    }
    let metadataOutput = [];
    let i = 0;
    for (let key in metadata) {
      let metaItems = metadata[key];
      let metadataOutputItems = [];
      if (metaItems!==null && typeof metaItems.length==="undefined") {
        metadataOutputItems = this.parseMetadataItems(metaItems);
      }
      else {
        if (metaItems!==null) {
          let newItems = this.parseMetadata(metaItems[0]);
          metadataOutputItems.push(newItems)
        }
      }
      metadataOutputItems = <div className="list-items">{metadataOutputItems}</div>;
      let metaRow = <div key={i}>
        <div className="metadata-title">{key}</div>
        {metadataOutputItems}
        </div>
      metadataOutput.push(metaRow);
      i++;
    }
    return metadataOutput;
  }

  parseMetadataItems(metaItems) {
    let i=0;
    let items = [];
    for (let metaKey in metaItems) {
      let value = metaItems[metaKey];
      let newRow = [];
      if (typeof value!=="object") {
        newRow = <div key={i}><label>{metaKey}</label> : {metaItems[metaKey]}</div>
      }
      else {
        let newRows = <div className="list-items">{this.parseMetadataItems(value)}</div>;
        newRow = <div key={i}><div className="metadata-title">{metaKey}</div>{newRows}</div>
      }
      items.push(newRow);
      i++
    }
    return items;
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
