import React, { useState } from 'react';
import { Button, Collapse, Form } from 'reactstrap';
import PropTypes from 'prop-types';
import AdvancedSearchFormRow from './Advanced.search.row';

import '../scss/advanced.search.scss';

function AdvancedSearchForm(props) {
  // props
  const {
    clearAdvancedSearch,
    searchElements,
    submit,
    updateAdvancedSearchInputs,
    visible,
  } = props;

  // state
  const { length: seLength = 0 } = searchElements;
  const defaultSearchElement =
    seLength === 0 ? null : searchElements[0].element;
  const defaultRowInit = [
    {
      _id: 'default',
      select: defaultSearchElement,
      qualifier: 'contains',
      input: '',
      default: true,
      boolean: 'and',
    },
  ];
  const [advancedSearchRows, setAdvancedSearchRows] = useState(defaultRowInit);

  const handleAdvancedSearchChange = (e, rowId) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const copy = [...advancedSearchRows];
    const advancedSearchRow = copy.find((el) => el._id === rowId);
    const index = copy.indexOf(advancedSearchRow);
    advancedSearchRow[name] = value;
    copy[index] = advancedSearchRow;
    setAdvancedSearchRows(copy);
    updateAdvancedSearchInputs(copy);
  };

  const randomString = (length) => {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const exists = advancedSearchRows.find((el) => el.id === result) || null;
    if (exists === null) {
      return result;
    }
    randomString(length);
    return false;
  };

  const addAdvancedSearchRow = () => {
    const newId = randomString(7);
    const copy = [...advancedSearchRows];
    const defaultRow = defaultRowInit[0];
    const { select, qualifier, input, boolean } = defaultRow;
    const idx = copy.find((el) => el._id === 'default');
    const newRow = {
      _id: newId,
      select,
      qualifier,
      input,
      default: false,
      boolean,
    };
    defaultRow.qualifier = 'contains';
    defaultRow.boolean = 'and';
    copy[idx] = defaultRow;
    copy.push(newRow);
    setAdvancedSearchRows(copy);
    updateAdvancedSearchInputs(copy);
  };

  const removeAdvancedSearchRow = (rowId) => {
    const copy = [...advancedSearchRows];
    const filtered = copy.filter((el) => el._id !== rowId);
    setAdvancedSearchRows(filtered);
    updateAdvancedSearchInputs(filtered);
  };

  const updateAdvancedSearchInputContent = (rowId, name, value) => {
    const copy = [...advancedSearchRows];
    const advancedSearchRow = advancedSearchRows.find((el) => el._id === rowId);
    const index = copy.indexOf(advancedSearchRow);
    copy[name] = value;
    copy[index] = advancedSearchRow;
    setAdvancedSearchRows(copy);
    updateAdvancedSearchInputs(advancedSearchRows);
  };

  const clearAdvancedSearchFn = () => {
    setAdvancedSearchRows(defaultRowInit);
    clearAdvancedSearch(advancedSearchRows);
  };

  const availableElements = [];
  for (let e = 0; e < seLength; e += 1) {
    const { element, label } = searchElements[e];
    availableElements.push(
      <option key={e} value={element}>
        {label}
      </option>
    );
  }

  const advancedSearchRowsOutput = [];
  const { length: asrLength } = advancedSearchRows;
  for (let ar = 0; ar < asrLength; ar += 1) {
    const {
      boolean,
      default: isDefault,
      _id,
      input,
      qualifier,
      select,
    } = advancedSearchRows[ar];
    const row = (
      <AdvancedSearchFormRow
        key={_id}
        default={isDefault}
        availableElements={availableElements}
        rowId={_id}
        handleAdvancedSearchChange={handleAdvancedSearchChange}
        updateAdvancedSearchInputContent={updateAdvancedSearchInputContent}
        addAdvancedSearchRow={addAdvancedSearchRow}
        removeAdvancedSearchRow={removeAdvancedSearchRow}
        searchSelect={select}
        searchQualifier={qualifier}
        searchInput={input}
        searchBoolean={boolean}
        searchElements={searchElements}
      />
    );
    advancedSearchRowsOutput.push(row);
  }

  return (
    <Collapse isOpen={visible}>
      <Form onSubmit={submit}>
        {advancedSearchRowsOutput}

        <div style={{ padding: '15px 0' }}>
          <Button
            type="button"
            size="sm"
            color="secondary"
            outline
            onClick={clearAdvancedSearchFn}
          >
            <i className="fa fa-times-circle" /> Clear
          </Button>{' '}
          <Button
            type="submit"
            size="sm"
            color="secondary"
            className="pull-right"
            onClick={submit}
          >
            <i className="fa fa-search" /> Search
          </Button>
        </div>
      </Form>
    </Collapse>
  );
}

AdvancedSearchForm.defaultProps = {
  clearAdvancedSearch: () => {},
  searchElements: [],
  submit: () => {},
  updateAdvancedSearchInputs: () => {},
  visible: false,
};
AdvancedSearchForm.propTypes = {
  clearAdvancedSearch: PropTypes.func,
  searchElements: PropTypes.array,
  submit: PropTypes.func,
  updateAdvancedSearchInputs: PropTypes.func,
  visible: PropTypes.bool,
};
export default AdvancedSearchForm;
