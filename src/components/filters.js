import React, {lazy, Suspense} from 'react';
import {connect} from "react-redux";
import { updateFilters,clearFilters } from "../redux/actions";
//import FilterSpatial from "./filter-spatial";
import PropTypes from 'prop-types';
import {renderLoader} from '../helpers';
const Filter = lazy(() => import("./filter"));
const FilterTemporal = lazy(() => import("./filter-temporal"));

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
    updateFilters: (type,params) => dispatch(updateFilters(type,params)),
    clearFilters: (type) => dispatch(clearFilters(type))
  }
}

class Filters extends React.Component {
  constructor(props) {
    super(props);

    this.updateFilters = this.updateFilters.bind(this);
    this.clearAllFilters = this.clearAllFilters.bind(this);
  }

  updateFilters(name, values, dataRefresh=true) {
    let props = this.props;
    let payload = {
      [name]: values,
    }
    props.updateFilters(props.name,payload);

    if(dataRefresh) {
      let context = this;
      setTimeout(function() {
        context.props.updatedata();
      },20);
    }
  }

  clearAllFilters() {
    this.props.clearFilters(this.props.name);
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

    for (let i=0;i<props.filterType.length;i++) {
      let filterType = props.filterType[i];
      if(filterType === "events") {
        events = <Suspense fallback={renderLoader()} key="events">
          <Filter
            loading={props.loadingEventsType}
            relationshipSet={props.relationshipSet.events}
            filtersSet={props.filtersSet.events}
            filtersType="events"
            items={props.eventsType}
            label="Events Types"
            updateFilters={this.updateFilters}
          />
        </Suspense>
      }
      if(filterType === "organisations") {
        organisations = <Suspense fallback={renderLoader()} key="organisations">
          <Filter
            loading={props.loadingOrganisationsType}
            relationshipSet={props.relationshipSet.organisations}
            filtersSet={props.filtersSet.organisations}
            filtersType="organisations"
            items={props.organisations}
            itemsType={props.organisationsType}
            label="Organisations"
            updateFilters={this.updateFilters}
          />
        </Suspense>
      }
      if(filterType === "organisationType") {
        organisations = <Suspense fallback={renderLoader()} key="organisationType">
          <Filter
            loading={props.loadingOrganisationsType}
            relationshipSet={[]}
            filtersSet={props.filtersSet}
            filtersType="organisationType"
            itemsType={props.organisationsType}
            items={[]}
            label="Organisation type"
            updateFilters={this.updateFilters}
            updateType={props.updateType}
          />
        </Suspense>
      }
      if(filterType === "eventType") {
        organisations = <Suspense fallback={renderLoader()} key="eventType">
          <Filter
            loading={props.loadingEventsType}
            relationshipSet={[]}
            filtersSet={props.filtersSet}
            filtersType="eventType"
            itemsType={props.eventsType}
            items={[]}
            label="Event type"
            updateFilters={this.updateFilters}
            updateType={props.updateType}
          />
        </Suspense>
      }
      if (filterType === "temporals") {
        temporals = <Suspense fallback={renderLoader()} key="temporals">
          <FilterTemporal
            filtersSet={props.filtersSet.temporals}
            relationshipSet={props.relationshipSet.events}
            filtersType="temporals"
            items={props.temporals}
            itemsType={props.eventsType}
            label="Dates"
            updateFilters={this.updateFilters}
          />
        </Suspense>
      }
      /*else if(props.filterType[i].name === "spatials") {
        //if ((!props.loadingSpatials)) {
          spatials = <FilterSpatial
            key={this.props.name+"_spatials"}
            filtersSet={props.filtersSet.spatials}
            relationshipSet={props.relationshipSet.spatials}
            filtersType={props.filterType[i]}
            items={props.spatials}
            label="Spatials"
            updateFilters={this.updateFilters}
          />
        //}
      }*/
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
  updatedata: PropTypes.func,
  items: PropTypes.array,
}

export default Filters = connect(mapStateToProps, mapDispatchToProps)(Filters);
