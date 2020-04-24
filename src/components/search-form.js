import React, {Component} from 'react';
import {
  Button,
  Form, Input, InputGroup, InputGroupAddon,
  Collapse
} from 'reactstrap';
import AdvancedSearchFormRow from './advanced-search-row.js';

export default class SearchForm extends Component {
  constructor(props) {
    super(props);
    let advancedSearchElement = null;
    if (typeof this.props.searchElements!=="undefined" && this.props.searchElements.length>0) {
      advancedSearchElement = this.props.searchElements[0].element;
    }
    this.state = {
      simpleSearchVisible: true,
      advancedSearchVisible: false,
      advancedSearchRows: [
        {_id: 'default', select: advancedSearchElement, qualifier: 'contains', input: '', default: true, boolean: 'and'},
      ],
      advancedSearchElement: advancedSearchElement,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleAdvancedSearchChange = this.handleAdvancedSearchChange.bind(this);
    this.updateAdvancedSearchInputContent = this.updateAdvancedSearchInputContent.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.addAdvancedSearchRow = this.addAdvancedSearchRow.bind(this);
    this.removeAdvancedSearchRow = this.removeAdvancedSearchRow.bind(this);
    this.randomString = this.randomString.bind(this);
    this.clearAdvancedSearch = this.clearAdvancedSearch.bind(this);
  }

  toggleSearch() {
    if(this.props.adadvancedSearchEnable===true) {
      this.setState({
        simpleSearchVisible: !this.state.simpleSearchVisible,
        advancedSearchVisible: !this.state.advancedSearchVisible,
      })
    }else {
      this.setState({
        simpleSearchVisible: !this.state.simpleSearchVisible,
      })
    }
  }

  addAdvancedSearchRow() {
    let newId = this.randomString(7);
    let advancedSearchRows = this.state.advancedSearchRows;
    let defaultRow = advancedSearchRows.find(el=>el._id==='default');
    let defaultRowIndex = advancedSearchRows.indexOf(defaultRow);
    let newRow = {_id: newId, select: defaultRow.select, qualifier:defaultRow.qualifier, input: defaultRow.input, default: false, boolean: defaultRow.boolean};
    //defaultRow.select = '';
    defaultRow.qualifier = 'contains';
    //defaultRow.input = '';
    defaultRow.boolean = 'and';
    advancedSearchRows[defaultRowIndex] = defaultRow;
    advancedSearchRows.push(newRow);
    this.setState({
      advancedSearchRows: advancedSearchRows
    });
    this.props.updateAdvancedSearchInputs(advancedSearchRows);
  }

  randomString(length) {
    let result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (let i=0;i<length;i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    let exists = this.state.advancedSearchRows.find(el=>el.id===result);
    if (typeof exists==="undefined") {
      return result;
    }
    else this.randomString(length);
  }

  removeAdvancedSearchRow(rowId) {
    let advancedSearchRows = this.state.advancedSearchRows;
    let advancedSearchRowsFiltered = advancedSearchRows.filter((el)=> {
      return el._id!==rowId;
    });
    this.setState({
      advancedSearchRows: advancedSearchRowsFiltered
    })
    this.props.updateAdvancedSearchInputs(advancedSearchRows)
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleAdvancedSearchChange(e, rowId) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let advancedSearchRows = this.state.advancedSearchRows;
    let advancedSearchRow = advancedSearchRows.find(el=>el._id===rowId);
    let index = advancedSearchRows.indexOf(advancedSearchRow);
    advancedSearchRow[name] = value;
    advancedSearchRows[index] = advancedSearchRow;
    this.setState({
      advancedSearchRows: advancedSearchRows
    });
    this.props.updateAdvancedSearchInputs(advancedSearchRows)
  }
  
  updateAdvancedSearchInputContent(rowId, name, value) {
    let advancedSearchRows = this.state.advancedSearchRows;
    let advancedSearchRow = advancedSearchRows.find(el=>el._id===rowId);
    let index = advancedSearchRows.indexOf(advancedSearchRow);
    advancedSearchRow[name] = value;
    advancedSearchRows[index] = advancedSearchRow;
    this.setState({
      advancedSearchRows: advancedSearchRows
    });
    this.props.updateAdvancedSearchInputs(advancedSearchRows)
  }

  clearAdvancedSearch() {
    let advancedSearchRows = this.state.advancedSearchRows;
    let advancedSearchRow = advancedSearchRows.find(el=>el._id==="default");
    let index = advancedSearchRows.indexOf(advancedSearchRow);

    advancedSearchRows = [
      advancedSearchRows[index],
    ];
    this.setState({
      advancedSearchRows: advancedSearchRows,
    })
    this.props.clearAdvancedSearch(advancedSearchRows);
  }

  render() {
    let availableElements = [];
    for (let e=0;e<this.props.searchElements.length;e++) {
      let searchElement = this.props.searchElements[e];
      availableElements.push(<option key={e} value={searchElement.element}>{searchElement.label}</option>);
    }
    let advancedSearchRows = [];
    for (let ar=0;ar<this.state.advancedSearchRows.length;ar++) {
      let advancedSearchRow = this.state.advancedSearchRows[ar];
      let row = <AdvancedSearchFormRow
        key={advancedSearchRow._id}
        default={advancedSearchRow.default}
        availableElements={availableElements}
        rowId={advancedSearchRow._id}
        handleAdvancedSearchChange={this.handleAdvancedSearchChange}
        updateAdvancedSearchInputContent={this.updateAdvancedSearchInputContent}
        addAdvancedSearchRow={this.addAdvancedSearchRow}
        removeAdvancedSearchRow={this.removeAdvancedSearchRow}
        searchSelect={advancedSearchRow.select}
        searchQualifier={advancedSearchRow.qualifier}
        searchInput={advancedSearchRow.input}
        searchBoolean={advancedSearchRow.boolean}
        searchElements={this.props.searchElements}
      />;
      advancedSearchRows.push(row);
    }

    let advancedSearch = []
    if(this.props.adadvancedSearchEnable === true) {
      advancedSearch = <div className="toggle-search" onClick={()=>this.toggleSearch()}>Advanced search <i className="fa fa-chevron-down" /></div>
    }else {
      advancedSearch = <div className="toggle-search"></div>
    }

    let searchBox = <div>
      <Collapse isOpen={this.state.simpleSearchVisible}>
        <Form onSubmit={this.props.simpleSearch}>
          <InputGroup size="sm" className="search-dropdown-inputgroup">
              <Input className="simple-search-input" type="text" name="simpleSearchTerm" onChange={this.props.handleChange} placeholder="Search..." value={this.props.simpleSearchTerm}/>
              <InputGroupAddon addonType="append">
                <Button size="sm" outline type="button" onClick={this.props.clearSearch} className="clear-search">
                  <i className="fa fa-times-circle" />
                </Button>
                <Button size="sm" type="submit">
                  <i className="fa fa-search" />
                </Button>
            </InputGroupAddon>
          </InputGroup>
        </Form>
        {advancedSearch}
      </Collapse>

      <Collapse isOpen={this.state.advancedSearchVisible}>
        <Form onSubmit={this.props.advancedSearch}>

          {advancedSearchRows}

          <div style={{padding: '15px 0'}}>
            <Button type="button" size="sm" color="secondary" outline onClick={this.clearAdvancedSearch}>
              <i className="fa fa-times-circle" /> Clear
            </Button>{' '}
            <Button
              type="submit"
              size="sm"
              color="secondary"
              className="pull-right"
              onClick={this.props.advancedSearch}
            >
              <i className="fa fa-search" /> Search
            </Button>
          </div>
        </Form>
        <div className="toggle-search" onClick={()=>this.toggleSearch()}>Simple search <i className="fa fa-chevron-up" /></div>
      </Collapse>
    </div>

    return (
      <div className="search-box">
        {searchBox}
      </div>

    )
  }

}
