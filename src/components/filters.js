import React from 'react';
import {
  Spinner,
  ListGroup, ListGroupItem,
  FormGroup, Label, Input
} from 'reactstrap';

import {connect} from "react-redux";
import {
  loadOrganisations
} from "../redux/actions";

const mapStateToProps = state => {
  return {
    loadingOrganisations: state.loadingOrganisations,
    organisations: state.organisations,
   };
};

class Filters extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingOrganisations: true,
      organisations: [],

      loadingClasspieces: true,
      classpieces: [],

      loadingEvents: true,
      events: [],

      loadingSpatial: true,
      spatial: [],

      loadingTemporal: true,
      temporal: []
    };

    this.organisationsFilters = this.organisationsFilters.bind(this);
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

  render() {
    let organisationItems = this.organisationsFilters();
    let organisations = <div>
      <h4>Organisations</h4>
      <div className="filter-body">
        {organisationItems}
      </div>
    </div>
    return(
      <div>{organisations}</div>
    )
  }
}
export default Filters = connect(mapStateToProps, null)(Filters);
