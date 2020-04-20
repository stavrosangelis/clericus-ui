import React from 'react';
import {
  Spinner,
  FormGroup, Label, Input,
  Card, CardBody
} from 'reactstrap';

import {connect} from "react-redux";
import {
  updateFilters
} from "../redux/actions";

const mapStateToProps = state => {
  return {
    loadingOrganisations: state.loadingOrganisations,
    organisations: state.organisations,

    loadingEvents: state.loadingEvents,
    events: state.events,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    updateFilters: (type,params) => dispatch(updateFilters(type,params))
  }
}

class Filters extends React.Component {
  constructor(props) {
    super(props);
    this.name = this.props.name;
    this.organisationsFilters = this.organisationsFilters.bind(this);
    this.eventsFilters = this.eventsFilters.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.clearAllFilters = this.clearAllFilters.bind(this);
  }

  organisationsFilters(relatedOrganisations=null) {
    let output = [];
    let disabled = "", checked = "";
    let preFilterSet = this.props.filtersSet;
    for (let i=0;i<this.props.organisations.length; i++) {
      disabled = "";
      checked="";
      let organisation = this.props.organisations[i];
      let hidden = "";
      if(relatedOrganisations!==null) {
        if(relatedOrganisations.indexOf(organisation._id) === -1) {
          disabled = "disabled";
          hidden = "hidden";
        }
      }
      if(preFilterSet!==null){
        if(preFilterSet.organisations.indexOf(organisation._id) !== -1) {
          checked = "defaultChecked";
        }
      }
      let filterItem = <FormGroup key={organisation._id}>
            <Label className={hidden}>
              <Input type="checkbox" name="organisations" id={organisation._id} onClick={this.toggleFilter} onChange={()=>{}} disabled={disabled} checked={checked}/>{' '}
              <span>{organisation.label}</span>
            </Label>
          </FormGroup>
      output.push(filterItem);
    }
    return output;
  }

  eventsFilters(relatedEvents=null) {
    let output = [];
    let disabled = "", checked = "";
    let preFilterSet = this.props.filtersSet;
    for (let i=0;i<this.props.events.length; i++) {
      disabled = "";
      checked="";
      let eventItem = this.props.events[i];
      let hidden = "";
      if(relatedEvents!==null) {
        if(relatedEvents.indexOf(eventItem._id) === -1) {
          disabled = "disabled";
          hidden = "hidden";
        }
      }
      if(preFilterSet!==null){
        if(preFilterSet.events.indexOf(eventItem._id) !== -1) {
          checked = "defaultChecked";
        }
      }
      let filterItem = <FormGroup key={eventItem._id}>
            <Label className={hidden}>
              <Input type="checkbox" name="events" id={eventItem._id} onClick={this.toggleFilter} onChange={()=>{}} disabled={disabled} checked={checked}/>{' '}
              <span>{eventItem.label}</span>
            </Label>
          </FormGroup>
      output.push(filterItem);
    }
    return output;
  }

  toggleFilter(e) {
    let target = e.target;
    let name = target.name;
    let _id = target.id;

    let allFilters = Object.assign({}, this.props.filtersSet);

    if (allFilters[name].indexOf(_id)===-1) {
      allFilters[name].push(_id);
    }
    else{
      allFilters[name].splice(allFilters[name].indexOf(_id), 1);
    }

    let payload = {
      events:allFilters.events,
      organisations: allFilters.organisations,
    }
    this.props.updateFilters(this.name,payload);
    this.props.updatedata();
  }

  clearFilters(e, filterType=null) {
    let payload = Object.assign({}, this.props.filtersSet, {[filterType]: []});
    let context = this;
    this.props.updateFilters(this.name,payload);
    setTimeout(function() {
      context.props.updatedata();
    },10)
  }

  clearAllFilters(e) {
    let payload = {
      events: [],
      organisations: [],
    }
    let context = this;
    this.props.updateFilters(this.name,payload);
    setTimeout(function() {
      context.props.updatedata();
    },10)
  }

  render() {
    let organisationItems=this.organisationsFilters(this.props.relationshipSet.organisations);
    let organisations = <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>;

    if (!this.props.loadingOrganisations) {
      organisations = <Card>
        <CardBody>
          <h4>Organisations
            <small className="pull-right clear-filters" onClick={(e)=>{this.clearFilters(e,"organisations")}}>clear <i className="fa fa-times-circle"/></small>
          </h4>
          <div className="filter-body">
            {organisationItems}
          </div>
        </CardBody>
      </Card>;
    }

    let eventsItems=this.eventsFilters(this.props.relationshipSet.events);
    let events = <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>;

    if (!this.props.loadingEvents) {
      events = <Card>
        <CardBody>
          <h4>Events
            <small className="pull-right clear-filters" onClick={(e)=>{this.clearFilters(e,"events")}}>clear <i className="fa fa-times-circle"/></small>
          </h4>
          <div className="filter-body">
            {eventsItems}
          </div>
        </CardBody>
      </Card>;
    }

    return(
      <div>
        <h4>Filters
          <small className="pull-right clear-filters" onClick={(e)=>{this.clearAllFilters(e)}}>clear all <i className="fa fa-times-circle"/></small>
        </h4>
        {organisations}
        {events}
      </div>
    )
  }
}
export default Filters = connect(mapStateToProps, mapDispatchToProps)(Filters);
