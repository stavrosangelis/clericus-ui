import React, { useState } from 'react';
import { Button, Form, Input, InputGroup, Collapse } from 'reactstrap';
import PropTypes from 'prop-types';
import AdvancedSearchForm from './Advanced.search.form';

import '../scss/search.scss';

function SearchForm(props) {
  // props
  const {
    clearAdvancedSearch,
    clearSearch,
    handleChange,
    searchElements,
    simpleSearch,
    simpleSearchTerm,
    advancedSearchEnable,
    updateAdvancedSearchInputs,
  } = props;

  // state
  const [simpleSearchVisible, setSimpleSearchVisible] = useState(true);
  const [advancedSearchVisible, setAdvancedSearchVisible] = useState(false);

  const toggleSearch = () => {
    if (advancedSearchEnable) {
      setSimpleSearchVisible(!simpleSearchVisible);
      setAdvancedSearchVisible(!advancedSearchVisible);
    } else {
      setSimpleSearchVisible(!simpleSearchVisible);
    }
  };

  let toggleAdvancedSearchElemBtn = null;
  if (advancedSearchEnable) {
    const text = simpleSearchVisible ? (
      <>
        Advanced search <i className="fa fa-chevron-down" />
      </>
    ) : (
      <>
        Simple search <i className="fa fa-chevron-up" />
      </>
    );

    toggleAdvancedSearchElemBtn = (
      <div
        className="toggle-search"
        onClick={() => toggleSearch()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle search"
      >
        {text}
      </div>
    );
  }

  const advancedSearchElem = advancedSearchEnable ? (
    <AdvancedSearchForm
      updateAdvancedSearchInputs={updateAdvancedSearchInputs}
      clearAdvancedSearch={clearAdvancedSearch}
      searchElements={searchElements}
      visible={advancedSearchVisible}
      submit={simpleSearch}
    />
  ) : null;

  const searchBox = (
    <div>
      <Collapse isOpen={simpleSearchVisible}>
        <Form onSubmit={simpleSearch}>
          <InputGroup size="sm" className="search-dropdown-inputgroup">
            <Input
              className="simple-search-input"
              type="text"
              name="simpleSearchTerm"
              onChange={handleChange}
              placeholder="Search..."
              value={simpleSearchTerm}
            />
            <Button
              color="secondary"
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
          </InputGroup>
        </Form>
      </Collapse>
      {advancedSearchElem}
      {toggleAdvancedSearchElemBtn}
    </div>
  );
  return <div className="search-box">{searchBox}</div>;
}

SearchForm.defaultProps = {
  searchElements: [],
  updateAdvancedSearchInputs: () => {},
  advancedSearchEnable: false,
  clearAdvancedSearch: () => {},
  simpleSearch: () => {},
  handleChange: () => {},
  clearSearch: () => {},
  simpleSearchTerm: '',
};
SearchForm.propTypes = {
  searchElements: PropTypes.array,
  updateAdvancedSearchInputs: PropTypes.func,
  advancedSearchEnable: PropTypes.bool,
  clearAdvancedSearch: PropTypes.func,
  simpleSearch: PropTypes.func,
  handleChange: PropTypes.func,
  clearSearch: PropTypes.func,
  simpleSearchTerm: PropTypes.string,
};

export default SearchForm;
