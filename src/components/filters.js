import React from 'react';
import {connect} from "react-redux";
import {
  updateFilters
} from "../redux/actions";
import Filter from "./filter";
import FilterNew from "./filter-new";
import FilterTemporal from "./filter-temporal";
import FilterSpatial from "./filter-spatial";
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
        organisations:  {
          type: {},
          data: {},
          dataName: {},
        },
        temporals: {
          startDate: "",
          endDate: ""
        },
        spatials: {
          eventID: [],
        },
      }
    }
    else if (this.name === "classpieces") {
      payload = {
        /*
        events: {
          type: {},
          data: {},
          dataName: {},
        },
        */
        organisations:  {
          type: {},
          data: {},
          dataName: {},
        },
        temporals: {
          startDate: null,
          endDate: null,
          eventType: [],
          eventID: [],
        },
        spatials: {
          eventID: [],
        },
      }
    }
    else if (this.name === "events") {
      payload = {
        events: {
          type: {},
          data: {},
          dataName: {},
        },
      }
    }
    else if (this.name === "organisations") {
      payload = {
        organisations: {
          type: {},
          data: {},
          dataName: {},
        },
      }
    }
    let context = this;
    this.props.updateFilters(this.name,payload);
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
    for (let i=0;i<props.filterType.length;i++) {
      if(props.filterType[i].name === "Classpieces") {
        if (!props.loadingClasspieces) {
          classpieces = <Filter
            key={this.name+"classpieces"}
            filtersSet={props.filtersSet.classpieces}
            filtersType={"classpieces"}
            items={props.classpieces}
            label="Classpieces"
            updateFilters={this.updateFilters}
          />
        }
      }
      else if(props.filterType[i].name === "events") {
        events = <FilterNew
          key={this.name+"events"}
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
            key={this.name+"people"}
            filtersSet={props.filtersSet.people}
            filtersType={"people"}
            items={props.people}
            label="People"
            updateFilters={this.updateFilters}
          />
        }
      }
      else if(props.filterType[i].name === "organisations") {
        if ((!props.loadingOrganisations) && (props.decidingFilteringSet)) {
          organisations = <Filter
            key={this.name+"organisations"}
            filtersSet={props.filtersSet.organisations}
            relationshipSet={props.relationshipSet.organisations}
            filtersType={props.filterType[i]}
            items={props.organisations}
            itemsType={props.organisationsType}
            label="Organisations"
            updateFilters={this.updateFilters}
          />
        }
      }
      else if(props.filterType[i].name === "temporals") {
        //if ((!props.loadingTemporals) && (props.decidingFilteringSet)) {
          temporals = <FilterTemporal
            key={this.name+"temporals"}
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
        if ((!props.loadingSpatials) && (props.decidingFilteringSet)) {
          spatials = <FilterSpatial
            key={this.name+"spatials"}
            filtersSet={props.filtersSet.spatials}
            relationshipSet={props.relationshipSet.events}
            filtersType={props.filterType[i]}
            items={props.spatials}
            label="Spatials"
            updateFilters={this.updateFilters}
          />
        }
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
      </div>
    )
  }
}

Filters.propTypes = {
  filterType: PropTypes.array,
  filtersSet: PropTypes.object,
  filtersClasspieceType: PropTypes.string,
  relationshipSet: PropTypes.object,
  decidingFilteringSet: PropTypes.bool,
  updatedata: PropTypes.func,
}

export default Filters = connect(mapStateToProps, mapDispatchToProps)(Filters);
