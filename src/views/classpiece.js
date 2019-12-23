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
      viewerVisible: false
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

  renderItem() {
    let item = this.state.item;
    let label = item.label;
    let thumbnailImage = [];
    let thumbnailURL = getResourceThumbnailURL(item);
    if (thumbnailURL!==null) {
      thumbnailImage = <div className="show-classpiece" onClick={()=>this.toggleViewer()}>
        <img src={thumbnailURL} className="people-thumbnail img-fluid img-thumbnail" alt={label} />
      </div>
    }
    let meta = [];
    let descriptionRow = [];
    if (typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      descriptionRow = <tr key={0}><th>Description: </th><td>{item.description}</td></tr>;
    }
    let metadataRow = [];
    if(Object.keys(item.metadata).length>0) {
      metadataRow = <tr key={1}><th>Metadata: </th><td>{this.parseMetadata(item.metadata.image)}</td></tr>;
    }
    meta.push(descriptionRow,metadataRow);
    let metaTable = <table className="table table-borderless"><tbody>{meta}</tbody></table>
    let output = <Card>
      <CardBody>
        <h3>{label}</h3>
        <div className="row">
          <div className="col-xs-12 col-sm-6 col-md-4">
            {thumbnailImage}
          </div>
          <div className="col-xs-12 col-sm-6 col-md-8">
            {metaTable}
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
      let itemCard = this.renderItem();
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
