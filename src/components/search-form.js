import React, { Component } from 'react';
import {
  Button,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  Collapse,
} from 'reactstrap';
import PropTypes from 'prop-types';
import AdvancedSearchFormRow from './advanced-search-row';

export default class SearchForm extends Component {
  constructor(props) {
    super(props);
    const {
      searchElements,
      advancedSearchInputsLength,
      advancedSearchInputs,
    } = this.props;
    let advancedSearchElement = null;
    if (searchElements.length > 0) {
      advancedSearchElement = searchElements[0].element;
    }
    let simpleSearchVisible = true;
    let advancedSearchVisible = false;
    let defaultRowInit = [
      {
        _id: 'default',
        select: advancedSearchElement,
        qualifier: 'contains',
        input: '',
        default: true,
        boolean: 'and',
      },
    ];
    if (advancedSearchInputsLength > 0) {
      simpleSearchVisible = false;
      advancedSearchVisible = true;
      if (advancedSearchInputs.length > 0) {
        defaultRowInit = advancedSearchInputs;
      }
    }

    this.state = {
      simpleSearchVisible,
      advancedSearchVisible,
      advancedSearchRows: defaultRowInit,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleAdvancedSearchChange = this.handleAdvancedSearchChange.bind(
      this
    );
    this.updateAdvancedSearchInputContent = this.updateAdvancedSearchInputContent.bind(
      this
    );
    this.toggleSearch = this.toggleSearch.bind(this);
    this.addAdvancedSearchRow = this.addAdvancedSearchRow.bind(this);
    this.removeAdvancedSearchRow = this.removeAdvancedSearchRow.bind(this);
    this.randomString = this.randomString.bind(this);
    this.clearAdvancedSearch = this.clearAdvancedSearch.bind(this);
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  handleAdvancedSearchChange(e, rowId) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const { advancedSearchRows } = this.state;
    const advancedSearchRow = advancedSearchRows.find((el) => el._id === rowId);
    const index = advancedSearchRows.indexOf(advancedSearchRow);
    advancedSearchRow[name] = value;
    advancedSearchRows[index] = advancedSearchRow;
    this.setState({
      advancedSearchRows,
    });
    const { updateAdvancedSearchInputs } = this.props;
    updateAdvancedSearchInputs(advancedSearchRows);
  }

  toggleSearch() {
    const { adadvancedSearchEnable } = this.props;
    const { simpleSearchVisible, advancedSearchVisible } = this.state;
    if (adadvancedSearchEnable) {
      this.setState({
        simpleSearchVisible: !simpleSearchVisible,
        advancedSearchVisible: !advancedSearchVisible,
      });
    } else {
      this.setState({
        simpleSearchVisible: !simpleSearchVisible,
      });
    }
  }

  addAdvancedSearchRow() {
    const { advancedSearchRows: stateAdvancedSearchRows } = this.state;
    const { searchElements, updateAdvancedSearchInputs } = this.props;
    const newId = this.randomString(7);
    const advancedSearchRows = Object.assign([], stateAdvancedSearchRows);
    const defaultRow = advancedSearchRows.find((el) => el._id === 'default');
    const defaultRowIndex = advancedSearchRows.indexOf(defaultRow);
    const newRow = {
      _id: newId,
      select: defaultRow.select,
      qualifier: defaultRow.qualifier,
      input: defaultRow.input,
      default: false,
      boolean: defaultRow.boolean,
    };
    // defaultRow.select = '';
    defaultRow.qualifier = 'contains';
    // defaultRow.input = '';
    defaultRow.boolean = 'and';
    advancedSearchRows[defaultRowIndex] = defaultRow;
    advancedSearchRows.push(newRow);
    // set default values
    let advancedSearchElement = null;
    if (searchElements.length > 0) {
      advancedSearchElement = searchElements[0].element;
    }
    const defaultRowInit = {
      _id: 'default',
      select: advancedSearchElement,
      qualifier: 'contains',
      input: '',
      default: true,
      boolean: 'and',
    };
    advancedSearchRows[defaultRowIndex] = defaultRowInit;
    this.setState({
      advancedSearchRows,
    });
    updateAdvancedSearchInputs(advancedSearchRows);
  }

  randomString(length) {
    const { advancedSearchRows } = this.state;
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const exists = advancedSearchRows.find((el) => el.id === result);
    if (typeof exists === 'undefined') {
      return result;
    }
    this.randomString(length);
    return false;
  }

  removeAdvancedSearchRow(rowId) {
    const { advancedSearchRows: stateAdvancedSearchRows } = this.state;
    const { updateAdvancedSearchInputs } = this.props;
    const advancedSearchRows = Object.assign([], stateAdvancedSearchRows);
    const advancedSearchRowsFiltered = advancedSearchRows.filter(
      (el) => el._id !== rowId
    );
    this.setState({
      advancedSearchRows: advancedSearchRowsFiltered,
    });
    updateAdvancedSearchInputs(advancedSearchRowsFiltered);
  }

  updateAdvancedSearchInputContent(rowId, name, value) {
    const { advancedSearchRows } = this.state;
    const { updateAdvancedSearchInputs } = this.props;
    const advancedSearchRow = advancedSearchRows.find((el) => el._id === rowId);
    const index = advancedSearchRows.indexOf(advancedSearchRow);
    advancedSearchRow[name] = value;
    advancedSearchRows[index] = advancedSearchRow;
    this.setState({
      advancedSearchRows,
    });
    updateAdvancedSearchInputs(advancedSearchRows);
  }

  clearAdvancedSearch() {
    const { advancedSearchRows: stateAdvancedSearchRows } = this.state;
    const { searchElements, clearAdvancedSearch } = this.props;
    let advancedSearchRows = [...stateAdvancedSearchRows];
    const advancedSearchRow = advancedSearchRows.find(
      (el) => el._id === 'default'
    );
    const index = advancedSearchRows.indexOf(advancedSearchRow);

    advancedSearchRows = [advancedSearchRows[index]];

    if (searchElements.length > 0) {
      advancedSearchRows[0].select = searchElements[0].element;
    }
    advancedSearchRows[0].qualifier = 'contains';
    advancedSearchRows[0].input = '';
    advancedSearchRows[0].boolean = 'and';

    this.setState({
      advancedSearchRows,
    });
    clearAdvancedSearch(advancedSearchRows);
  }

  render() {
    const {
      searchElements,
      adadvancedSearchEnable,
      simpleSearch,
      handleChange: propsHandleChange,
      simpleSearchTerm,
      advancedSearch: propsAdvancedSearch,
      clearSearch,
    } = this.props;

    const {
      advancedSearchRows: stateAdvancedSearchRows,
      simpleSearchVisible,
      advancedSearchVisible,
    } = this.state;

    const availableElements = [];
    for (let e = 0; e < searchElements.length; e += 1) {
      const searchElement = searchElements[e];
      availableElements.push(
        <option key={e} value={searchElement.element}>
          {searchElement.label}
        </option>
      );
    }
    const advancedSearchRows = [];
    for (let ar = 0; ar < stateAdvancedSearchRows.length; ar += 1) {
      const advancedSearchRow = stateAdvancedSearchRows[ar];
      const row = (
        <AdvancedSearchFormRow
          key={advancedSearchRow._id}
          default={advancedSearchRow.default}
          availableElements={availableElements}
          rowId={advancedSearchRow._id}
          handleAdvancedSearchChange={this.handleAdvancedSearchChange}
          updateAdvancedSearchInputContent={
            this.updateAdvancedSearchInputContent
          }
          addAdvancedSearchRow={this.addAdvancedSearchRow}
          removeAdvancedSearchRow={this.removeAdvancedSearchRow}
          searchSelect={advancedSearchRow.select}
          searchQualifier={advancedSearchRow.qualifier}
          searchInput={advancedSearchRow.input}
          searchBoolean={advancedSearchRow.boolean}
          searchElements={searchElements}
        />
      );
      advancedSearchRows.push(row);
    }

    let advancedSearch = [];
    if (adadvancedSearchEnable) {
      advancedSearch = (
        <div
          className="toggle-search"
          onClick={() => this.toggleSearch()}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle search"
        >
          Advanced search <i className="fa fa-chevron-down" />
        </div>
      );
    } else {
      advancedSearch = <div className="toggle-search" />;
    }

    const searchBox = (
      <div>
        <Collapse isOpen={simpleSearchVisible}>
          <Form onSubmit={simpleSearch}>
            <InputGroup size="sm" className="search-dropdown-inputgroup">
              <Input
                className="simple-search-input"
                type="text"
                name="simpleSearchTerm"
                onChange={propsHandleChange}
                placeholder="Search..."
                value={simpleSearchTerm}
              />
              <InputGroupAddon addonType="append">
                <Button
                  size="sm"
                  outline
                  type="button"
                  onClick={clearSearch}
                  className="clear-search"
                >
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

        <Collapse isOpen={advancedSearchVisible}>
          <Form onSubmit={propsAdvancedSearch}>
            {advancedSearchRows}

            <div style={{ padding: '15px 0' }}>
              <Button
                type="button"
                size="sm"
                color="secondary"
                outline
                onClick={this.clearAdvancedSearch}
              >
                <i className="fa fa-times-circle" /> Clear
              </Button>{' '}
              <Button
                type="submit"
                size="sm"
                color="secondary"
                className="pull-right"
                onClick={propsAdvancedSearch}
              >
                <i className="fa fa-search" /> Search
              </Button>
            </div>
          </Form>
          <div
            className="toggle-search"
            onClick={() => this.toggleSearch()}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle search"
          >
            Simple search <i className="fa fa-chevron-up" />
          </div>
        </Collapse>
      </div>
    );
    return <div className="search-box">{searchBox}</div>;
  }
}
SearchForm.defaultProps = {
  searchElements: [],
  advancedSearchInputs: [],
  advancedSearchInputsLength: 0,
  updateAdvancedSearchInputs: () => {},
  adadvancedSearchEnable: false,
  clearAdvancedSearch: () => {},
  simpleSearch: () => {},
  handleChange: () => {},
  advancedSearch: () => {},
  clearSearch: () => {},
  simpleSearchTerm: '',
};
SearchForm.propTypes = {
  searchElements: PropTypes.array,
  advancedSearchInputs: PropTypes.array,
  advancedSearchInputsLength: PropTypes.number,
  updateAdvancedSearchInputs: PropTypes.func,
  adadvancedSearchEnable: PropTypes.bool,
  clearAdvancedSearch: PropTypes.func,
  simpleSearch: PropTypes.func,
  handleChange: PropTypes.func,
  advancedSearch: PropTypes.func,
  clearSearch: PropTypes.func,
  simpleSearchTerm: PropTypes.string,
};
