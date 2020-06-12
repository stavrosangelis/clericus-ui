import React from 'react';
import {connect} from "react-redux";
import {
  updateFilters
} from "../redux/actions";
import Filter from "./filter";
import FilterNew from "./filter-new";
import FilterTemporal from "./filter-temporal";
import FilterSpatial from "./filter-spatial";
import FilterDataTypes from "./filter-data-types";
import PropTypes from 'prop-types';

const mapStateToProps = state => {
  return {
    loadingOrganisationsType: state.loadingOrganisationsType,
    organisationsType: state.organisationsType,

    loadingOrganisations: state.loadingOrganisations,
    organisations: state.organisations,

    loadingEventsType: state.loadingEventsType,
    eventsType: state.eventsType,

    loadingEvents: state.loadingEvents,
    events: state.events,

    //loadingPeople: state.loadingPeople,
    //people: state.people,

    //loadingClasspieces: state.loadingClasspieces,
    //classpieces: state.classpieces,

    loadingTemporals: state.loadingTemporals,
    temporals: state.temporals,

    loadingSpatials: state.loadingSpatials,
    spatials: state.spatials,
    
    loadingResourcesType: state.loadingResourcesType,
    resourcesType: state.resourcesType,
    
    loadingPeopleRelationship: state.loadingPeopleRelationship,
    loadingClasspiecesRelationship: state.loadingClasspiecesRelationship,
    loadingEventsRelationship: state.loadingEventsRelationship,
    loadingOrganisationsRelationship: state.loadingOrganisationsRelationship,
    loadingResourcesRelationship: state.loadingResourcesRelationship,
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

    this.updateFilters = this.updateFilters.bind(this);
    this.clearAllFilters = this.clearAllFilters.bind(this);
  }
  updateFilters(name, values, dataRefresh=true) {
    let props = this.props;
    let payload = {
      [name]: values,
    }
    props.updateFilters(props.name,payload);
    if(dataRefresh === true) {
      let context = this;
      setTimeout(function() {
        context.props.updatedata();
      },10);
    }
  }

  clearAllFilters(e) {
    let payload = null;
    if(this.name === "people") {
      payload = {
        events: [],
        organisations: [],
        temporals: {
          startDate: "",
          endDate: "",
          dateType: "exact",
        },
        //spatials: [],
      }
    }
    else if (this.name === "classpieces") {
      payload = {
        events: [],
        organisations: [],
        temporals: {
          startDate: null,
          endDate: null,
          eventType: [],
          eventID: [],
        },
        //spatials: [],
      }
    }
    else if (this.name === "events") {
      payload = {
        events: [],
      }
    }
    else if (this.name === "organisations") {
      payload = {
        organisations: [],
      }
    }
    else if (this.name === "resources") {
      payload = {
        resources: [],
      }
    }
    else if (this.name === "temporals") {
      payload = {
        temporals: {
          startDate: null,
          endDate: null,
          eventType: [],
          eventID: [],
        },
      }
    }
    let context = this;
    this.props.updateFilters(this.name,payload);
    
    if((this.name === "people") || (this.name === "classpieces")){
      this.eventFuncComRef();
      this.temporalFuncComRef();
    }else if((this.name === "events") || (this.name === "organisations")
      || (this.name === "resources")){
      this.dataTypesFuncComRef();
    }else if(this.name === "temporals") {
      this.temporalFuncComRef();
    }
    
    setTimeout(function() {
      context.props.updatedata();
    },10);
  }

  render() {
    let props = this.props;
    let classpieces = [];
    let events = [];
    let organisations = [];
    let people = [];
    let temporals = [];
    let spatials = [];
    let dataTypes = [];
    
    let loadingRelationship = null;
    if(props.name === "people") {
      loadingRelationship = props.loadingPeopleRelationship;
    }
    else if(props.name === "classpieces") {
      loadingRelationship = props.loadingClasspiecesRelationship;
    }
    else if(props.name === "events") {
      loadingRelationship = props.loadingEventsRelationship;
    }
    else if(props.name === "organisations") {
      loadingRelationship = props.loadingOrganisationsRelationship;
    }
    else if(props.name === "resources") {
      loadingRelationship = props.loadingResourcesRelationship;
    }
    
    for (let i=0;i<props.filterType.length;i++) {
      if(props.filterType[i].name === "Classpieces") {
        if (!props.loadingClasspieces) {
          classpieces = <Filter
            key={this.name+"_classpieces"}
            filtersSet={props.filtersSet.classpieces}
            filtersType="classpieces"
            items={props.classpieces}
            label="Classpieces"
            updateFilters={this.updateFilters}
          />
        }
      }
      else if(props.filterType[i].name === "events") {
        events = <FilterNew
          key={this.name+"events"}
          resetStateForwardRef={c => { this.eventFuncComRef = c }}
          loading={props.loadingEventsType}
          relationshipSet={props.relationshipSet.events}
          filtersSet={props.filtersSet.events}
          filtersType="events"
          items={props.eventsType}
          label="Events Types"
          updateFilters={this.updateFilters}
        />
      }
      else if(props.filterType[i].name === "People") {
        if (!props.loadingPeople) {
          people = <Filter
            key={this.name+"_people"}
            filtersSet={props.filtersSet.people}
            filtersType={"people"}
            items={props.people}
            label="People"
            updateFilters={this.updateFilters}
          />
        }
      }
      else if(props.filterType[i].name === "organisations") {
        //if ((!props.loadingOrganisations) && (props.decidingFilteringSet)) {
          organisations = <Filter
            key={this.name+"_organisations"}
            loading={loadingRelationship}
            filtersSet={props.filtersSet.organisations}
            relationshipSet={props.relationshipSet.organisations}
            filtersType={props.filterType[i]}
            items={props.organisations}
            itemsType={props.organisationsType}
            label="Organisations"
            updateFilters={this.updateFilters}
          />
        //}
      }
      else if(props.filterType[i].name === "temporals") {
        //if ((!props.loadingTemporals) && (props.decidingFilteringSet)) {
          temporals = <FilterTemporal
            resetStateForwardRef={c => { this.temporalFuncComRef = c }}
            key={this.name+"_temporals"}
            filtersSet={props.filtersSet.temporals}
            relationshipSet={props.relationshipSet.events}
            filtersType={props.filterType[i]}
            items={props.temporals}
            itemsType={props.eventsType}
            label="Temporals"
            updateFilters={this.updateFilters}
          />
        //}
      }
      else if(props.filterType[i].name === "spatials") {
        //if ((!props.loadingSpatials) && (props.decidingFilteringSet)) {
          spatials = <FilterSpatial
            key={this.name+"_spatials"}
            filtersSet={props.filtersSet.spatials}
            relationshipSet={props.relationshipSet.spatials}
            filtersType={props.filterType[i]}
            items={props.spatials}
            label="Spatials"
            updateFilters={this.updateFilters}
          />
        //}
      }
      else if(props.filterType[i].name === "dataTypes") {
        let filtersSet = null;
        let itemsType = null;
        let label = "";
        let loadingType = null;
        if(props.name === "events") {
          filtersSet = props.filtersSet.events;
          itemsType = props.eventsType;
          label="Event Types";
          loadingType = props.loadingEventsType;
        }
        else if(props.name === "organisations") {
          filtersSet = props.filtersSet.organisations;
          itemsType = props.organisationsType;
          label="Organisation Types";
          loadingType = props.loadingOrganisationsType;
        }
        else if(props.name === "resources") {
          filtersSet = props.filtersSet.resources;
          itemsType = props.resourcesType;
          label="Resource Types";
          loadingType = props.loadingResourcesType;
        }
        dataTypes = <FilterDataTypes
          key={this.name+"dataTypes"}
          resetStateForwardRef={c => { this.dataTypesFuncComRef = c }}
          name={props.name}
          loading={loadingRelationship}
          loadingType={loadingType}
          filtersSet={filtersSet}
          filtersType={props.filterType[i]}
          items={props.items}
          itemsType={itemsType}
          label={label}
          updateFilters={this.updateFilters}
        />
      }
    }

    return(
      <div>
        <h4>Filters
          <small className="pull-right clear-filters" onClick={()=>{this.clearAllFilters()}}>clear all <i className="fa fa-times-circle"/></small>
        </h4>
        {classpieces}
        {events}
        {organisations}
        {people}
        {temporals}
        {spatials}
        {dataTypes}
      </div>
    )
  }
}

Filters.propTypes = {
  filterType: PropTypes.array,
  filtersSet: PropTypes.object,
  filtersClasspieceType: PropTypes.string,
  relationshipSet: PropTypes.object,
  //decidingFilteringSet: PropTypes.bool,
  updatedata: PropTypes.func,
  items: PropTypes.array,
}

export default Filters = connect(mapStateToProps, mapDispatchToProps)(Filters);
