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
    classpiecesFilters: state.classpiecesFilters,
    
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
    this.organisationsFilters = this.organisationsFilters.bind(this);
    this.eventsFilters = this.eventsFilters.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
  }

  organisationsFilters() {
    let output = [];
    for (let i=0;i<this.props.organisations.length; i++) {
      let organisation = this.props.organisations[i];
      let filterItem = <FormGroup key={organisation._id}>
            <Label>
              <Input type="checkbox" name="organisations" id={organisation._id} onClick={this.toggleFilter} />{' '}
              <span>{organisation.label}</span>
            </Label>
          </FormGroup>
      output.push(filterItem);
    }
    return output;
  }
	
  eventsFilters() {
    let output = [];
    for (let i=0;i<this.props.events.length; i++) {
      let eventItem = this.props.events[i];
      let filterItem = <FormGroup key={eventItem._id}>
            <Label>
              <Input type="checkbox" name="events" id={eventItem._id} onClick={this.toggleFilter}/>{' '}
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

    let allFilters = Object.assign({}, this.props.classpiecesFilters);;
    
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
    this.props.updateFilters("resources",payload);
    this.props.updateClasspieces();
  }

  render() {
    let organisationItems = this.organisationsFilters();
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
          <h4>Organisations</h4>
          <div className="filter-body">
            {organisationItems}
          </div>
        </CardBody>
      </Card>;
    }
		
    let eventsItems = this.eventsFilters();
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
          <h4>Events</h4>
          <div className="filter-body">
            {eventsItems}
          </div>
        </CardBody>
      </Card>;
    }
		
    return(
      <div>
        <h4>Filters</h4>
        {organisations}
        {events}
      </div>
    )
  }
}
export default Filters = connect(mapStateToProps, mapDispatchToProps)(Filters);
