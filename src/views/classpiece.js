import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
  Button,
  Form, Input, InputGroup, InputGroupAddon,
  Collapse,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import {getResourceThumbnailURL, getResourceFullsizeURL} from '../helpers/helpers';
import {parseMetadata} from '../helpers/parse-metadata';
import Viewer from '../components/image-viewer.js';

class Classpiece extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: {},
      viewerVisible: false,
      searchVisible: false,
      tableVisible: {
        metadataDataVisible: false,
        peopleDataVisible: false,
      },
      simpleSearchSet: '',
      simpleSearchTerm: '',
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.toggleViewer = this.toggleViewer.bind(this);
    this.handleChange=this.handleChange.bind(this);
    this.simpleSearch=this.simpleSearch.bind(this);
    this.clearSearch=this.clearSearch.bind(this);
    
    this.renderClasspieceDetails=this.renderClasspieceDetails.bind(this);
    this.renderThumbmailMetadata=this.renderThumbmailMetadata.bind(this);
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

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }
  
  simpleSearch(e) {
    e.preventDefault();
    document.getElementById("simpleSearchTerm").blur();
    this.setState({
      simpleSearchSet: this.state.simpleSearchTerm
    });
  }
  
  clearSearch(e) {
    this.setState({
      simpleSearchSet: '',
      simpleSearchTerm: ''
      
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
  
  toggleSearch() {
    this.setState({
      searchVisible: !this.state.searchVisible
    })
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
    let peopleDataHiden_container = "";
    let peopleDataHiden_icon = "";
    if(!stateData.tableVisible.peopleDataVisible){
      peopleDataHiden_container = " closed";
      peopleDataHiden_icon = " closed";
      if(stateData.searchVisible){
        peopleDataHiden_container = " closedWithSearch";
      }
    }
    
    let peopleRow = [];
    if (typeof item.people!=="undefined" && item.people!==null && item.people!=="") {
      let peopleDataExpand = [];
      if(!stateData.tableVisible.peopleDataVisible){
        peopleDataExpand = <li key={"dot"} ><i className="tag-bg tag-item" onClick={(e)=>{this.toggleTable(e,"peopleData")}}>...</i></li>;
      }
      
      let peopleData = item.people.map(eachItem=>{
        if(!eachItem.ref.label.includes(stateData.simpleSearchSet)){
          return null;
        }
        return <li key={eachItem.ref._id} ><a className="tag-bg tag-item" href={"/person/"+eachItem.ref._id}>{eachItem.ref.label}</a></li>
      })
      
      peopleRow = <tr key={"peopleRow"}>
                    <th>People</th>
                    <td>
                      <div className={"people-info-container"+peopleDataHiden_container}>
                        <div className="btn btn-default btn-xs pull-right toggle-info-btn pull-icon-middle" onClick={(e)=>{this.toggleTable(e,"peopleData")}}>
                          <i className={"fa fa-angle-down"+peopleDataHiden_icon}/>
                        </div>
                        
                        <div className="tool-box pull-right classpiece-search">
                          <div className="action-trigger" onClick={()=>this.toggleSearch()} id="search-tooltip">
                            <i className="fa fa-search" />
                          </div>
                        </div>
                        
                        <Collapse isOpen={stateData.searchVisible}>
                          <Form>
                            <InputGroup size="sm" className="search-dropdown-inputgroup classpiece-people-search-input">
                                <Input className="simple-search-input" list="data" type="text" id="simpleSearchTerm" name="simpleSearchTerm" onChange={this.handleChange} placeholder="Search..." value={this.state.simpleSearchTerm}/>
                                  <datalist id="data">
                                    {this.state.item.people.map((item, key) =>
                                      <option key={key} value={item.ref.label} />
                                    )}
                                  </datalist>
                                
                                <InputGroupAddon addonType="append">
                                  <Button size="sm" outline type="button" onClick={this.clearSearch} className="clear-search">
                                    <i className="fa fa-times-circle" />
                                  </Button>
                                  <Button size="sm" type="submit" onClick={this.simpleSearch}>
                                    <i className="fa fa-search" />
                                  </Button>
                              </InputGroupAddon>
                            </InputGroup>
                          </Form>
                        </Collapse>
                        
                        <ul className="tag-list tag-list-people">
                          {peopleDataExpand}{peopleData}
                        </ul>
                      </div>
                    </td>
                  </tr>;
    }
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
