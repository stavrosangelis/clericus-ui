import React, {Component} from 'react';
import {
  Button,
  Input
} from 'reactstrap';
export default class AdvancedSearchFormRow extends Component {
  constructor(props) {
    super(props);
    let searchSelect = null;
    if (typeof this.props.searchElements!=="undefined") {
      searchSelect = this.props.searchElements[0].element;
    }
    this.state = {
      searchInput: '',
      searchSelect: searchSelect,
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  render() {
    let button = <Button size="sm" color="secondary" outline type="button" onClick={this.props.addAdvancedSearchRow}>
      <i className="fa fa-plus" />
    </Button>
    if (!this.props.default) {
      button = <Button size="sm" color="secondary" outline type="button" onClick={()=>this.props.removeAdvancedSearchRow(this.props.rowId)}>
        <i className="fa fa-minus" />
      </Button>
    }

    return(
      <div className="advanced-search-row">
        <div className="advanced-search-select">
          <Input
            type="select"
            name="select"
            value={this.props.searchSelect}
            onChange={(e)=>this.props.handleAdvancedSearchChange(e,this.props.rowId)}>
            {this.props.availableElements}
          </Input>
        </div>
        <div className="advanced-search-qualifier">
          <Input
            type="select"
            name="qualifier"
            value={this.props.searchQualifier}
            onChange={(e)=>this.props.handleAdvancedSearchChange(e,this.props.rowId)}>
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
          </Input>
        </div>
        <div className="advanced-search-input">
          <Input
            placeholder="Search term..."
            type="text"
            name="input"
            value={this.props.searchInput}
            onChange={(e)=>this.props.handleAdvancedSearchChange(e,this.props.rowId)}
          />
        </div>
        <div className="advanced-search-boolean">
          <Input
            type="select"
            name="boolean"
            value={this.props.searchBoolean}
            onChange={(e)=>this.props.handleAdvancedSearchChange(e,this.props.rowId)}>
            <option value="and">And</option>
            <option value="or">Or</option>
          </Input>
        </div>
        <div className="advanced-search-button">
          {button}
        </div>
      </div>

    );
  }
}
