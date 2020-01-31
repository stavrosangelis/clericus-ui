import React from 'react';
import {
  Spinner,
  FormGroup, Label, Input,
  Card, CardBody
} from 'reactstrap';

import {connect} from "react-redux";
const mapStateToProps = state => {
  return {
    loadingOrganisations: state.loadingOrganisations,
    organisations: state.organisations,
		
    loadingEvents: state.loadingEvents,
    events: state.events,
   };
};

class Filters extends React.Component {
  constructor(props) {
    super(props);
    this.organisationsFilters = this.organisationsFilters.bind(this);
    this.eventsFilters = this.eventsFilters.bind(this);
  }

  organisationsFilters() {
    let output = [];
    for (let i=0;i<this.props.organisations.length; i++) {
      let organisation = this.props.organisations[i];
      let filterItem = <FormGroup key={organisation._id}>
            <Label>
              <Input type="checkbox" name={organisation._id} />{' '}
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
              <Input type="checkbox" name={eventItem._id} />{' '}
              <span>{eventItem.label}</span>
            </Label>
          </FormGroup>
      output.push(filterItem);
    }
		console.log(output)
    return output;
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
export default Filters = connect(mapStateToProps, null)(Filters);
