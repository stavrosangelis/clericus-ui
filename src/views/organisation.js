import React, { Component } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';

import {Link} from 'react-router-dom';
import {Breadcrumbs} from '../components/breadcrumbs';
import {updateDocumentTitle} from '../helpers';
import DescriptionBlock from '../components/item-blocks/description';
import ResourcesBlock from '../components/item-blocks/resources';
import EventsBlock from '../components/item-blocks/events';
import OrganisationsBlock from '../components/item-blocks/organisations';
import PeopleBlock from '../components/item-blocks/people';

class Organisation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: null,
      descriptionVisible: true,
      eventsVisible: true,
      peopleVisible: true,
      classpiecesVisible: true,
      resourcesVisible: true,
      organisationsVisible: true,
      error: {
        visible: false,
        text: ""
      }
    }

    this.load = this.load.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderOrganisationDetails = this.renderOrganisationDetails.bind(this);
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
    let url = process.env.REACT_APP_APIPATH+'ui-organisation';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
      console.log(error);
	  });
    if (responseData.status) {
      this.setState({
        loading: false,
        item: responseData.data
      });
    }
    else {
      this.setState({
        loading: false,
        error: {
          visible: true,
          text: responseData.msg
        }
      });
    }
  }

  toggleTable(e, dataType=null) {
    let payload = {
      [dataType+"Visible"]:!this.state[dataType+"Visible"]
    }
    this.setState(payload);
  }

  renderOrganisationDetails(stateData=null) {
    let item = stateData.item;

    //1. OrganisationDetails
    let meta = [];

    // description
    let descriptionRow = [];
    let descriptionHidden = "";
    let descriptionVisibleClass = "";
    if(!this.state.descriptionVisible){
      descriptionHidden = " closed";
      descriptionVisibleClass = "hidden";
    }
    if (typeof item.description!=="undefined" && item.description!==null && item.description!=="") {
      descriptionRow = <DescriptionBlock key="descriptionRow" toggleTable={this.toggleTable} hidden={descriptionHidden} visible={descriptionVisibleClass} description={item.description}/>
    }

    // resources
    let resourcesRow = [];
    let classpiecesHidden = "";
    let classpiecesVisibleClass = "";
    if(!this.state.classpiecesVisible){
      classpiecesHidden = " closed";
      classpiecesVisibleClass = "hidden";
    }
    let resourcesHidden = "";
    let resourcesVisibleClass = "";
    if(!this.state.resourcesVisible){
      resourcesHidden = " closed";
      resourcesVisibleClass = "hidden";
    }
    if (typeof item.resources!=="undefined" && item.resources!==null && item.resources!=="") {
      resourcesRow = <ResourcesBlock key="resourcesRow" toggleTable={this.toggleTable} classpiecesHidden={classpiecesHidden} classpiecesVisible={classpiecesVisibleClass} resourcesHidden={resourcesHidden} resourcesVisible={resourcesVisibleClass} resources={item.resources} />
    }

    // events
    let eventsRow = [];
    let eventsHidden = "";
    let eventsVisibleClass = "";
    if(!this.state.eventsVisible){
      eventsHidden = " closed";
      eventsVisibleClass = "hidden";
    }
    if (typeof item.events!=="undefined" && item.events!==null && item.events!=="") {
      eventsRow = <EventsBlock key="eventsRow" toggleTable={this.toggleTable} hidden={eventsHidden} visible={eventsVisibleClass} events={item.events} />
    }

    // organisations
    let organisationsRow = [];
    let organisationsHidden = "";
    let organisationsVisibleClass = "";
    if(!this.state.organisationsVisible){
      organisationsHidden = " closed";
      organisationsVisibleClass = "hidden";
    }
    if (typeof item.organisations!=="undefined" && item.organisations!==null && item.organisations!=="") {
      organisationsRow = <OrganisationsBlock key="organisationsRow" toggleTable={this.toggleTable} hidden={organisationsHidden} visible={organisationsVisibleClass} organisations={item.organisations} />
    }

    //1.3 OrganisationDetails - people
    let peopleRow = <PeopleBlock
      key ={"organisationTagPeople"}
      name = {"organisation"}
      peopleItem = {item.people}
    />

    meta.push(descriptionRow);
    meta.push(eventsRow);
    meta.push(peopleRow);
    meta.push(organisationsRow);
    meta.push(resourcesRow);

    return meta;
  }

  renderItem(stateData=null) {
    let item = stateData.item;

    //1.1 Organisation label
    let label = `${item.label} [${item.organisationType}]`;

    //2.1 meta
    //let metaTable = <Table><tbody>{meta}</tbody></Table>
    let metaTable = this.renderOrganisationDetails(stateData);

    //2.2 thumbnailImage
    let thumbnailImage = [];
    let thumbnailColClass = "col-0";
    let contentColClass = "col-12";
    let thumbnailURL = null;
    if (thumbnailURL!==null) {
      thumbnailImage = <div key={"thumbnailImage"} className="show-classpiece" onClick={()=>this.toggleViewer()}>
        <img src={thumbnailURL} className="people-thumbnail img-fluid img-thumbnail" alt={label} />
      </div>
      thumbnailColClass = "col-xs-12 col-sm-6 col-md-5";
      contentColClass = "col-xs-12 col-sm-6 col-md-7";
    }

    let output = <div>
      <h3>{label}</h3>
      <div className="row item-info-container">
        <div className={thumbnailColClass}>
          {thumbnailImage}
        </div>
        <div className={contentColClass}>
          <div className="item-details-container">
            {metaTable}
          </div>
        </div>
      </div>
    </div>

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

    let label = "";
    let breadcrumbsItems = [
      {label: "Organisations", icon: "pe-7s-culture", active: false, path: "/organisations"},
    ];
    if (!this.state.loading) {
      if (this.state.item!==null) {
        let organisationCard = this.renderItem(this.state);

        let timelineLink = [];
        if (this.state.item.events.length>0) {
          let timelinkURL = `/item-timeline/organisation/${this.props.match.params._id}`;
          timelineLink = <div className="col-xs-12 col-sm-4">
            <Link href={timelinkURL} to={timelinkURL} className="person-component-link" title="Organisation graph timeline"><i className="pe-7s-hourglass" /></Link>
            <Link href={timelinkURL} to={timelinkURL} className="person-component-link-label" title="Organisation graph timeline"><label>Timeline</label></Link>
          </div>
        }
        let networkGraphLinkURL = `/organisation-graph/${this.props.match.params._id}`;
        let networkGraphLink = <div className="col-xs-12 col-sm-4">
          <Link href={networkGraphLinkURL} to={networkGraphLinkURL} className="person-component-link" title="Organisation graph network"><i className="pe-7s-graph1" /></Link>
          <Link href={networkGraphLinkURL} to={networkGraphLinkURL} className="person-component-link-label" title="Organisation graph network"><label>Network graph</label></Link>
        </div>;
        content = <div>
          <Card>
            <CardBody>
              <div className="row">
                <div className="col-12">
                  {organisationCard}
                </div>
              </div>
              <div className="row">
                {timelineLink}
                {networkGraphLink}
              </div>
            </CardBody>
          </Card>
        </div>

        label = this.state.item.label;
        breadcrumbsItems.push({label: label, icon: "pe-7s-culture", active: true, path: ""});
        let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
        updateDocumentTitle(documentTitle);
      }
      else if (this.state.error.visible){
        breadcrumbsItems.push({label: this.state.error.text, icon: "fa fa-times", active: true, path: ""});
        let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
        updateDocumentTitle(documentTitle);
        content = <div>
          <Card>
            <CardBody>
              <div className="row">
                <div className="col-12">
                  <h3>Error</h3>
                  <p>{this.state.error.text}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      }
    }
    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
      </div>
    )

  }
}

export default Organisation;
