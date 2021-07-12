import React, { Component } from 'react';
import { Button, Input } from 'reactstrap';
import PropTypes from 'prop-types';

export default class AdvancedSearchFormRow extends Component {
  constructor(props) {
    super(props);

    this.handleSearchSelectChange = this.handleSearchSelectChange.bind(this);
    this.renderSearchTerm = this.renderSearchTerm.bind(this);
  }

  handleSearchSelectChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const {
      handleAdvancedSearchChange,
      rowId,
      searchElements,
      updateAdvancedSearchInputContent,
    } = this.props;
    handleAdvancedSearchChange(e, rowId);

    const searchTermRow = searchElements.find((el) => el.element === value);
    const searchTermRowIndex = searchElements.indexOf(searchTermRow);
    let inputValue = '';
    if (searchElements[searchTermRowIndex].inputType === 'select') {
      inputValue = searchElements[searchTermRowIndex].inputData[0].value;
    }

    updateAdvancedSearchInputContent(rowId, 'input', inputValue);
  }

  renderSearchTerm() {
    const {
      searchSelect,
      searchElements,
      searchInput,
      handleAdvancedSearchChange,
      rowId,
    } = this.props;
    const selectItem = searchSelect;
    const searchTermRow = searchElements.find(
      (el) => el.element === selectItem
    );
    const searchTermRowIndex = searchElements.indexOf(searchTermRow);
    let optionData = null;
    if (searchElements[searchTermRowIndex].inputData !== null) {
      optionData = searchElements[searchTermRowIndex].inputData.map(
        (dataItem) => (
          <option key={dataItem.value} value={dataItem.value}>
            {dataItem.label}
          </option>
        )
      );
    }

    let classNameType = '';
    const inputValue = searchInput;
    if (searchElements[searchTermRowIndex].inputType === 'text') {
      classNameType = 'advanced-search-input';
    } else if (searchElements[searchTermRowIndex].inputType === 'select') {
      classNameType = 'advanced-search-select';
      // inputValue = stateData.input;
    }
    return (
      <div className={classNameType}>
        <Input
          placeholder="Search term..."
          type={searchElements[searchTermRowIndex].inputType}
          name="input"
          value={inputValue}
          onChange={(e) => handleAdvancedSearchChange(e, rowId)}
        >
          {optionData}
        </Input>
      </div>
    );
  }

  render() {
    const {
      addAdvancedSearchRow,
      default: defaultRow,
      removeAdvancedSearchRow,
      rowId,
      searchSelect,
      availableElements,
      searchQualifier,
      handleAdvancedSearchChange,
      searchBoolean,
    } = this.props;
    let button = (
      <Button
        size="sm"
        color="secondary"
        outline
        type="button"
        onClick={addAdvancedSearchRow}
      >
        <i className="fa fa-plus" />
      </Button>
    );
    if (!defaultRow) {
      button = (
        <Button
          size="sm"
          color="secondary"
          outline
          type="button"
          onClick={() => removeAdvancedSearchRow(rowId)}
        >
          <i className="fa fa-minus" />
        </Button>
      );
    }

    const searchTerm = this.renderSearchTerm();

    return (
      <div className="advanced-search-row">
        <div className="advanced-search-select">
          <Input
            type="select"
            name="select"
            value={searchSelect}
            onChange={(e) => this.handleSearchSelectChange(e, rowId)}
          >
            {availableElements}
          </Input>
        </div>
        <div className="advanced-search-qualifier">
          <Input
            type="select"
            name="qualifier"
            value={searchQualifier}
            onChange={(e) => handleAdvancedSearchChange(e, rowId)}
          >
            <option value="contains">Contains</option>
            <option value="equals">Is exact</option>
            <option value="not_equals">Not equal to</option>
            <option value="not_contains">Doesn&apos;t contain</option>
          </Input>
        </div>

        {searchTerm}

        <div className="advanced-search-boolean">
          <Input
            type="select"
            name="boolean"
            value={searchBoolean}
            onChange={(e) => handleAdvancedSearchChange(e, rowId)}
          >
            <option value="and">And</option>
            {/* <option value="or">Or</option> */}
          </Input>
        </div>
        <div className="advanced-search-button">{button}</div>
      </div>
    );
  }
}
AdvancedSearchFormRow.defaultProps = {
  handleAdvancedSearchChange: () => {},
  rowId: '',
  searchElements: [],
  updateAdvancedSearchInputContent: () => {},
  searchSelect: '',
  searchInput: '',
  addAdvancedSearchRow: () => {},
  removeAdvancedSearchRow: () => {},
  default: false,
  availableElements: [],
  searchQualifier: '',
  searchBoolean: 'AND',
};
AdvancedSearchFormRow.propTypes = {
  handleAdvancedSearchChange: PropTypes.func,
  rowId: PropTypes.string,
  searchElements: PropTypes.array,
  updateAdvancedSearchInputContent: PropTypes.func,
  searchSelect: PropTypes.string,
  searchInput: PropTypes.string,
  addAdvancedSearchRow: PropTypes.func,
  removeAdvancedSearchRow: PropTypes.func,
  default: PropTypes.bool,
  availableElements: PropTypes.array,
  searchQualifier: PropTypes.string,
  searchBoolean: PropTypes.string,
};
