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
    
    loadingPeople: state.loadingPeople,
    people: state.people,
    
    loadingClasspieces: state.loadingClasspieces,
    classpieces: state.classpieces,
    
    loadingTemporals: state.loadingTemporals,
    temporals: state.temporals,
    
    loadingSpatials: state.loadingSpatials,
    spatials: state.spatials,
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
    
    this.classpiecesFilters = this.classpiecesFilters.bind(this);
    this.eventsFilters = this.eventsFilters.bind(this);
    this.organisationsFilters = this.organisationsFilters.bind(this);
    this.peopleFilters = this.peopleFilters.bind(this);
    this.temporalsFilters = this.temporalsFilters.bind(this);
    this.spatialsFilters = this.spatialsFilters.bind(this);

    this.toggleFilter = this.toggleFilter.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.clearAllFilters = this.clearAllFilters.bind(this);
  }

  classpiecesFilters(relatedClasspieces=null) {
    if(this.props.filtersClasspieceType!==null) {
      let output = [];
      let disabled = "", checked = "";
      let preFilterSet = this.props.filtersSet;//this.getFiltersSet(this.name);
      for (let i=0;i<this.props.classpieces.length; i++) {
        disabled = "";
        checked="";
        let eventItem = this.props.classpieces[i];
        let hidden = "";
        if(relatedClasspieces!==null) {
          if(relatedClasspieces.indexOf(eventItem._id) === -1) {
            disabled = "disabled";
            hidden = "hidden";
          }
        }
        if(preFilterSet!==null){
          if(preFilterSet.classpieces.indexOf(eventItem._id) !== -1) {
            checked = "defaultChecked";
          }
        }
        let filterItem = <FormGroup key={eventItem._id}>
              <Label className={hidden}>
                <Input type="checkbox" name="classpieces" id={eventItem._id} onClick={this.toggleFilter} onChange={()=>{}} disabled={disabled} checked={checked}/>{' '}
                <span>{eventItem.label}</span>
              </Label>
            </FormGroup>
        output.push(filterItem);
      }
      return output;
    }
    return null;
  }
  
  eventsFilters(relatedEvents=null) {
    let output = [];
    let disabled = "", checked = "";
    let preFilterSet = this.props.filtersSet;//this.getFiltersSet(this.name);
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
  
  organisationsFilters(relatedOrganisations=null) {
    let output = [];
    let disabled = "", checked = "";
    let preFilterSet = this.props.filtersSet;
    for (let i=0;i<this.props.organisations.length; i++) {
      disabled = "";
      checked="";
      let organisationItem = this.props.organisations[i];
      let hidden = "";
      if(relatedOrganisations!==null) {
        if(relatedOrganisations.indexOf(organisationItem._id) === -1) {
          disabled = "disabled";
          hidden = "hidden";
        }
      }
      if(preFilterSet!==null){
        if(preFilterSet.organisations.indexOf(organisationItem._id) !== -1) {
          checked = "defaultChecked";
        }
      }
      let filterItem = <FormGroup key={organisationItem._id}>
            <Label className={hidden}>
              <Input type="checkbox" name="organisations" id={organisationItem._id} onClick={this.toggleFilter} onChange={()=>{}} disabled={disabled} checked={checked}/>{' '}
              <span>{organisationItem.label}</span>
            </Label>
          </FormGroup>
      output.push(filterItem);
    }
    return output;
  }
  
  peopleFilters(relatedPeople=null) {
    let output = [];
    let disabled = "", checked = "";
    let preFilterSet = this.props.filtersSet;
    for (let i=0;i<this.props.people.length; i++) {
      disabled = "";
      checked="";
      let personItem = this.props.people[i];
      let hidden = "";
      if(relatedPeople!==null) {
        if(relatedPeople.indexOf(personItem._id) === -1) {
          disabled = "disabled";
          hidden = "hidden";
        }
      }
      if(preFilterSet!==null){
        if(preFilterSet.people.indexOf(personItem._id) !== -1) {
          checked = "defaultChecked";
        }
      }
      let filterItem = <FormGroup key={personItem._id}>
            <Label className={hidden}>
              <Input type="checkbox" name="people" id={personItem._id} onClick={this.toggleFilter} onChange={()=>{}} disabled={disabled} checked={checked}/>{' '}
              <span>{personItem.label}</span>
            </Label>
          </FormGroup>
      output.push(filterItem);
    }
    return output;
  }
  
  temporalsFilters(relatedTemporals=null) {
    let output = [];
    let disabled = "", checked = "";
    let preFilterSet = this.props.filtersSet;
    for (let i=0;i<this.props.temporals.length; i++) {
      disabled = "";
      checked="";
      let temporalItem = this.props.temporals[i];
      let hidden = "";
      if(relatedTemporals!==null) {
        if(relatedTemporals.indexOf(temporalItem._id) === -1) {
          disabled = "disabled";
          hidden = "hidden";
        }
      }
      if(preFilterSet!==null){
        if(preFilterSet.temporals.indexOf(temporalItem._id) !== -1) {
          checked = "defaultChecked";
        }
      }
      let filterItem = <FormGroup key={temporalItem._id}>
            <Label className={hidden}>
              <Input type="checkbox" name="temporals" id={temporalItem._id} onClick={this.toggleFilter} onChange={()=>{}} disabled={disabled} checked={checked}/>{' '}
              <span>{temporalItem.label}</span>
            </Label>
          </FormGroup>
      output.push(filterItem);
    }
    return output;
  }
  
  spatialsFilters(relatedSpatials=null) {
    let output = [];
    let disabled = "", checked = "";
    let preFilterSet = this.props.filtersSet;
    for (let i=0;i<this.props.spatials.length; i++) {
      disabled = "";
      checked="";
      let spatialItem = this.props.spatials[i];
      let hidden = "";
      if(relatedSpatials!==null) {
        if(relatedSpatials.indexOf(spatialItem._id) === -1) {
          disabled = "disabled";
          hidden = "hidden";
        }
      }
      if(preFilterSet!==null){
        if(preFilterSet.spatials.indexOf(spatialItem._id) !== -1) {
          checked = "defaultChecked";
        }
      }
      let filterItem = <FormGroup key={spatialItem._id}>
            <Label className={hidden}>
              <Input type="checkbox" name="spatials" id={spatialItem._id} onClick={this.toggleFilter} onChange={()=>{}} disabled={disabled} checked={checked}/>{' '}
              <span>{spatialItem.label}</span>
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
      people: allFilters.people,
      classpieces: allFilters.classpieces,
      temporals: allFilters.temporals,
      spatials: allFilters.spatials,
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
      classpieces: [],
      events: [],
      organisations: [],
      people: [],
      temporals: [],
      spatials: [],
    }
    let context = this;
    this.props.updateFilters(this.name,payload);
    setTimeout(function() {
      context.props.updatedata();
    },10)
  }

  render() {
    let classpieces = null;
    if(this.props.filterType.includes("Classpieces")) {
      if(this.props.filtersClasspieceType!==null){
        let classpiecesItems=this.classpiecesFilters(this.props.relationshipSet.classpieces);
        classpieces = <div className="row">
            <div className="col-12">
              <div style={{padding: '40pt',textAlign: 'center'}}>
                <Spinner type="grow" color="info" /> <i>loading...</i>
              </div>
            </div>
          </div>;

        if (!this.props.loadingClasspieces) {
          classpieces = <Card>
            <CardBody>
              <h4>Classpieces
                <small className="pull-right clear-filters" onClick={(e)=>{this.clearFilters(e,"classpieces")}}>clear <i className="fa fa-times-circle"/></small>
              </h4>
              <div className="filter-body">
                {classpiecesItems}
              </div>
            </CardBody>
          </Card>;
        }
      }
    }
    
    let events = null;
    if(this.props.filterType.includes("Events")) {
      let eventsItems=this.eventsFilters(this.props.relationshipSet.events);
      events = <div className="row">
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
    }
    
    let organisations = null;
    if(this.props.filterType.includes("Organisations")) {
      let organisationItems=this.organisationsFilters(this.props.relationshipSet.organisations);
      organisations = <div className="row">
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
    }

    let people = null;
    if(this.props.filterType.includes("People")) {
      let peopleItems=this.peopleFilters(this.props.relationshipSet.people);
      people = <div className="row">
          <div className="col-12">
            <div style={{padding: '40pt',textAlign: 'center'}}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>;

      if (!this.props.loadingPeople) {
        people = <Card>
          <CardBody>
            <h4>People
              <small className="pull-right clear-filters" onClick={(e)=>{this.clearFilters(e,"people")}}>clear <i className="fa fa-times-circle"/></small>
            </h4>
            <div className="filter-body">
              {peopleItems}
            </div>
          </CardBody>
        </Card>;
      }
    }
    
    let temporals = null;
    if(this.props.filterType.includes("Temporals")) {
      let temporalsItems=this.temporalsFilters(this.props.relationshipSet.temporals);
      temporals = <div className="row">
          <div className="col-12">
            <div style={{padding: '40pt',textAlign: 'center'}}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>;

      if (!this.props.loadingTemporals) {
        temporals = <Card>
          <CardBody>
            <h4>Temporals
              <small className="pull-right clear-filters" onClick={(e)=>{this.clearFilters(e,"temporals")}}>clear <i className="fa fa-times-circle"/></small>
            </h4>
            <div className="filter-body">
              {temporalsItems}
            </div>
          </CardBody>
        </Card>;
      }
    }
    
    let spatials = null;
    if(this.props.filterType.includes("Spatials")) {
      let spatialsItems=this.spatialsFilters(this.props.relationshipSet.spatials);
      spatials = <div className="row">
          <div className="col-12">
            <div style={{padding: '40pt',textAlign: 'center'}}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>;

      if (!this.props.loadingSpatials) {
        spatials = <Card>
          <CardBody>
            <h4>Spatials
              <small className="pull-right clear-filters" onClick={(e)=>{this.clearFilters(e,"spatials")}}>clear <i className="fa fa-times-circle"/></small>
            </h4>
            <div className="filter-body">
              {spatialsItems}
            </div>
          </CardBody>
        </Card>;
      }
    }
    
    return(
      <div>
        <h4>Filters
          <small className="pull-right clear-filters" onClick={(e)=>{this.clearAllFilters(e)}}>clear all <i className="fa fa-times-circle"/></small>
        </h4>
        {classpieces}
        {events}
        {organisations}
        {people}
        {temporals}
        {spatials}
      </div>
    )
  }
}
export default Filters = connect(mapStateToProps, mapDispatchToProps)(Filters);
