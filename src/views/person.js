import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
  Table
} from 'reactstrap';

import {Breadcrumbs} from '../components/breadcrumbs';
import {getPersonThumbnailURL} from '../helpers/helpers';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: {},
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
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
    let url = process.env.REACT_APP_APIPATH+'person';
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

  renderItem() {
    let item = this.state.item;
    let label = item.firstName;
    if (typeof item.middleName!=="undefined" && item.middleName!==null && item.middleName!=="") {
      label += " "+item.middleName;
    }
    label += " "+item.lastName;
    let thumbnailImage = [];
    let thumbnailURL = getPersonThumbnailURL(item);
    if (thumbnailURL!==null) {
      thumbnailImage = <img src={thumbnailURL} className="people-thumbnail img-fluid img-thumbnail" alt={label} />
    }
    let meta = [];
    let firstNameRow = <tr key={0}><th style={{width: '100px'}}>First name: </th><td>{item.firstName}</td></tr>;
    let middleNameRow = [];
    if (typeof item.middleName!=="undefined" && item.middleName!==null && item.middleName!=="") {
      middleNameRow = <tr key={1}><th>Middle name: </th><td>{item.middleName}</td></tr>;
    }
    let lastNameRow = <tr key={2}><th>Last name: </th><td>{item.lastName}</td></tr>;
    let descriptionRow = [];
    if (typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      descriptionRow = <tr key={3}><th>Description: </th><td>{item.description}</td></tr>;
    }
    meta.push(firstNameRow,middleNameRow,lastNameRow,descriptionRow);
    let metaTable = <Table><tbody>{meta}</tbody></Table>
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

  componentWillMount() {
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
      let personCard = this.renderItem();
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
      {label: "People", icon: "pe-7s-users", active: false, path: "/browse"},
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
