import React from 'react';
import { Button, Input } from 'reactstrap';
import PropTypes from 'prop-types';

function AdvancedSearchFormRow(props) {
  // props
  const {
    addAdvancedSearchRow,
    availableElements,
    default: defaultRow,
    handleAdvancedSearchChange,
    removeAdvancedSearchRow,
    rowId,
    searchBoolean,
    searchElements,
    searchInput,
    searchSelect,
    searchQualifier,
    updateAdvancedSearchInputContent,
  } = props;

  const handleSearchSelectChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    handleAdvancedSearchChange(e, rowId);

    const searchTermRow = searchElements.find((el) => el.element === value);
    const searchTermRowIndex = searchElements.indexOf(searchTermRow);
    let inputValue = '';
    if (searchElements[searchTermRowIndex].inputType === 'select') {
      inputValue = searchElements[searchTermRowIndex].inputData[0].value;
    }
    updateAdvancedSearchInputContent(rowId, 'input', inputValue);
  };

  const renderSearchTerm = () => {
    const searchTermRow = searchElements.find(
      (el) => el.element === searchSelect
    );
    const searchTermRowIndex = searchElements.indexOf(searchTermRow);
    let optionData = null;
    const elem = searchElements[searchTermRowIndex];
    const { inputData = null, inputType = '' } = elem;
    if (inputData !== null) {
      optionData = inputData.map((dataItem) => (
        <option key={dataItem.value} value={dataItem.value}>
          {dataItem.label}
        </option>
      ));
    }
    let classNameType = '';
    if (inputType === 'text') {
      classNameType = 'advanced-search-input';
    } else if (inputType === 'select') {
      classNameType = 'advanced-search-select';
    }
    return (
      <div className={classNameType}>
        <Input
          placeholder="Search term..."
          type={inputType}
          name="input"
          value={searchInput}
          onChange={(e) => handleAdvancedSearchChange(e, rowId)}
        >
          {optionData}
        </Input>
      </div>
    );
  };

  const button = defaultRow ? (
    <Button
      size="sm"
      color="secondary"
      outline
      type="button"
      onClick={addAdvancedSearchRow}
    >
      <i className="fa fa-plus" />
    </Button>
  ) : (
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

  const searchTerm = renderSearchTerm();

  return (
    <div className="advanced-search-row">
      <div className="advanced-search-select">
        <Input
          type="select"
          name="select"
          value={searchSelect}
          onChange={(e) => handleSearchSelectChange(e, rowId)}
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
        </Input>
      </div>
      <div className="advanced-search-button">{button}</div>
    </div>
  );
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
export default AdvancedSearchFormRow;
