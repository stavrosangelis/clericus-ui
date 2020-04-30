import React from 'react';
import {connect} from "react-redux";
import {
  updateFilters
} from "../redux/actions";
import Filter from "./filter";
import PropTypes from 'prop-types';

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

    this.updateFilters = this.updateFilters.bind(this);
    this.clearAllFilters = this.clearAllFilters.bind(this);
  }

  updateFilters(name, values) {
    let props = this.props;
    let allFilters = props.filtersSet;
    let payload = {
      events:allFilters.events,
      organisations: allFilters.organisations,
      people: allFilters.people,
      classpieces: allFilters.classpieces,
      temporals: allFilters.temporals,
      spatials: allFilters.spatials,
    }
    payload[name] = values;
    props.updateFilters(props.name,payload);
    let context = this;
    setTimeout(function() {
      context.props.updatedata();
    },10);
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
    if(props.filterType.includes("Classpieces")) {
      if (!props.loadingClasspieces) {
        classpieces = <Filter
          filtersSet={props.filtersSet.classpieces}
          filtersType={"classpieces"}
          items={props.classpieces}
          label="Classpieces"
          updateFilters={this.updateFilters}
        />
      }
    }

    if(props.filterType.includes("Events")) {
      if (!props.loadingEvents) {
        events = <Filter
          filtersSet={props.filtersSet.events}
          filtersType={"events"}
          items={props.events}
          label="Events"
          updateFilters={this.updateFilters}
        />
      }
    }

    if(props.filterType.includes("People")) {
      if (!props.loadingPeople) {
        people = <Filter
          filtersSet={props.filtersSet.people}
          filtersType={"people"}
          items={props.people}
          label="People"
          updateFilters={this.updateFilters}
        />
      }
    }

    if(props.filterType.includes("People")) {
      if (!props.loadingPeople) {
        people = <Filter
          filtersSet={props.filtersSet.people}
          filtersType={"people"}
          items={props.people}
          label="People"
          updateFilters={this.updateFilters}
        />
      }
    }

    if(props.filterType.includes("Organisations")) {
      if (!props.loadingOrganisations) {
        organisations = <Filter
          filtersSet={props.filtersSet.organisations}
          filtersType={"organisations"}
          items={props.organisations}
          label="Organisations"
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
      </div>
    )
  }
}

Filters.propTypes = {
  filterType: PropTypes.array,
  filtersSet: PropTypes.object,
  filtersClasspieceType: PropTypes.string,
  relationshipSet: PropTypes.object,
  updatedata: PropTypes.func,
}

export default Filters = connect(mapStateToProps, mapDispatchToProps)(Filters);
