import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import {updateDocumentTitle, outputDate,renderLoader} from '../helpers';
const EventsBlock = lazy(() => import('../components/item-blocks/events'));

class Temporal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: null,
      eventsVisible: true,
      error: {
        visible: false,
        text: ""
      }
    }

    this.load = this.load.bind(this);
    this.toggleTable = this.toggleTable.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderTemporalDetails = this.renderTemporalDetails.bind(this);

    const cancelToken = axios.CancelToken;
    this.cancelSource = cancelToken.source();
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
    let url = process.env.REACT_APP_APIPATH+'ui-temporal';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params,
      cancelToken: this.cancelSource.token
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
	  });
    if (typeof responseData!=="undefined") {
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
  }

  toggleTable(e, dataType=null) {
    let payload = {
      [dataType+"Visible"]:!this.state[dataType+"Visible"]
    }
    this.setState(payload);
  }

  renderTemporalDetails(stateData=null) {
    let item = stateData.item;

    //1. TemporalDetails
    let meta = [];
    let eventsRow = [];
    let eventsHidden = "";
    let eventsVisibleClass = "";
    if(!this.state.eventsVisible){
      eventsHidden = " closed";
      eventsVisibleClass = "hidden";
    }
    if (typeof item.events!=="undefined" && item.events!==null && item.events!=="") {
      eventsRow = <Suspense fallback={renderLoader()} key="events">
        <EventsBlock toggleTable={this.toggleTable} hidden={eventsHidden} visible={eventsVisibleClass} events={item.events} />
      </Suspense>
    }

    // dates
    let datesRow = [];
    if (typeof item.startDate!=="undefined" && item.startDate!=="") {
      let endDate = "";
      if (typeof item.endDate!=="undefined" && item.endDate!=="" && item.endDate!==item.startDate) {
        endDate = " - "+outputDate(item.endDate, false);
      }
      datesRow = <div key="datesRow">
        <h5>Dates</h5>
        <div style={{paddingBottom: "10px"}}><span className="tag-bg tag-item">{outputDate(item.startDate, false)}{endDate}</span>
        </div>
      </div>;
    }

    meta.push(datesRow);
    meta.push(eventsRow);

    return meta;
  }

  renderItem(stateData=null) {
    let item = stateData.item;

    let label = item.label;

    let metaTable = this.renderTemporalDetails(stateData);

    let output = <div className="item-container">
      <h3>{label}</h3>
      <div className="row">
        <div className="col-12">
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
  
  componentWillUnmount() {
    this.cancelSource.cancel('api request cancelled');
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
    let breadcrumbsItems = [{label: "Dates", icon: "pe-7s-date", active: false, path: "/temporals"}];
    if (!this.state.loading) {
      if (this.state.item!==null) {
        let temporalCard = this.renderItem(this.state);
        content = <div>
          <Card>
            <CardBody>
              <div className="row">
                <div className="col-12">
                  {temporalCard}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        label = this.state.item.label;
        breadcrumbsItems.push({label: label, icon: "pe-7s-date", active: true, path: ""});
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

export default Temporal;
