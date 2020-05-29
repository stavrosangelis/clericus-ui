import React, {Component} from 'react';
import {
  Button,
  Input
} from 'reactstrap';
export default class AdvancedSearchFormRow extends Component {
  constructor(props) {
    super(props);
    
    this.handleSearchSelectChange = this.handleSearchSelectChange.bind(this);
    this.renderSearchTerm = this.renderSearchTerm.bind(this);
  }

  handleSearchSelectChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    
    this.props.handleAdvancedSearchChange(e,this.props.rowId);
    
    let searchTermRow = this.props.searchElements.find(el=>el.element===value);
    let searchTermRowIndex = this.props.searchElements.indexOf(searchTermRow);
    let inputValue = ""
    if(this.props.searchElements[searchTermRowIndex].inputType==="select") {
      inputValue = this.props.searchElements[searchTermRowIndex].inputData[0].value;
    }

    this.props.updateAdvancedSearchInputContent(this.props.rowId, "input", inputValue);
  }
  
  renderSearchTerm() {
    let selectItem = this.props.searchSelect;
    let searchTermRow = this.props.searchElements.find(el=>el.element===selectItem);
    let searchTermRowIndex = this.props.searchElements.indexOf(searchTermRow);
    let optionData = null
    if(this.props.searchElements[searchTermRowIndex].inputData !== null) {
      optionData = this.props.searchElements[searchTermRowIndex].inputData.map(dataItem=>{
        return <option key={dataItem.value} value={dataItem.value}>{dataItem.label}</option>
      })
    }
    
    let classNameType = "";
    let inputValue = this.props.searchInput;
    if(this.props.searchElements[searchTermRowIndex].inputType==="text") {
      classNameType = "advanced-search-input";
    }else if(this.props.searchElements[searchTermRowIndex].inputType==="select") {
      classNameType = "advanced-search-select";
      //inputValue = stateData.input;
    }
    
    return <div className={classNameType}>
      <Input
        placeholder="Search term..."
        type={this.props.searchElements[searchTermRowIndex].inputType}
        name="input"
        value={inputValue}
        onChange={(e)=>this.props.handleAdvancedSearchChange(e,this.props.rowId)}>
      {optionData}
      </Input>
    </div>
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

    let searchTerm = this.renderSearchTerm();

    return(
      <div className="advanced-search-row">
        <div className="advanced-search-select">
          <Input
            type="select"
            name="select"
            value={this.props.searchSelect}
            onChange={(e)=>this.handleSearchSelectChange(e,this.props.rowId)}>
            {this.props.availableElements}
          </Input>
        </div>
        <div className="advanced-search-qualifier">
          <Input
            type="select"
            name="qualifier"
            value={this.props.searchQualifier}
            onChange={(e)=>this.props.handleAdvancedSearchChange(e,this.props.rowId)}>
            <option value="contains">Contains</option>
            {/*<option value="equals">Equals</option>*/}
          </Input>
        </div>
        
        {searchTerm}
        
        <div className="advanced-search-boolean">
          <Input
            type="select"
            name="boolean"
            value={this.props.searchBoolean}
            onChange={(e)=>this.props.handleAdvancedSearchChange(e,this.props.rowId)}>
            <option value="and">And</option>
            {/*<option value="or">Or</option>*/}
          </Input>
        </div>
        <div className="advanced-search-button">
          {button}
        </div>
      </div>

    );
  }
}
