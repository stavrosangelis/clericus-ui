import React, { useState } from 'react';
import { Button, Form, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { outputRelationTypes } from '../../helpers';

import Pagination from '../pagination';

const Block = (props) => {
  // state
  const [searchVisible, setSearchVisible] = useState(false);
  const [peopleDataVisible, setPeopleDataVisible] = useState(true);
  const [simpleSearchSet, setSimpleSearchSet] = useState('');
  const [simpleSearchTerm, setSimpleSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 100;
  const pageIndex = page - 1;
  const firstIndex = pageIndex * limit - 1;
  const lastIndex = firstIndex + limit;

  // props
  const { peopleItem } = props;

  const handleSearchTermChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setSimpleSearchTerm(value);
    setSimpleSearchSet(value);
  };

  const simpleSearch = (e) => {
    if (typeof e !== 'undefined') {
      e.preventDefault();
    }
    setSimpleSearchSet(simpleSearchTerm);
  };

  const clearSearch = () => {
    setSimpleSearchTerm('');
    setSimpleSearchSet('');
  };

  const toggleTable = (e, dataType = null) => {
    if (dataType === 'peopleData') {
      setPeopleDataVisible(!peopleDataVisible);
    }
  };

  const toggleSearch = () => {
    if (searchVisible) {
      setSearchVisible(!searchVisible);
    } else {
      setSearchVisible(!searchVisible);
    }
  };

  const updatePage = (e) => {
    if (e > 0 && e !== page) {
      setPage(e);
    }
  };

  let peopleRow = [];
  if (peopleItem !== null) {
    let peopleDataHiddenContainer = '';
    let peopleDataHiddenIcon = '';
    if (!peopleDataVisible) {
      peopleDataHiddenContainer = ' closed';
      peopleDataHiddenIcon = ' closed';
      if (searchVisible) {
        peopleDataHiddenContainer = ' closedWithSearch';
      }
    }
    const peopleData = [];
    const people = peopleItem.filter((p) =>
      p.ref.label.toLowerCase().includes(simpleSearchSet.toLowerCase())
    );
    const { length: pLength } = people;
    for (let i = 0; i < pLength; i += 1) {
      if (i > firstIndex) {
        if (i > lastIndex) {
          break;
        }
        const person = people[i];
        if (
          person.ref.label.toLowerCase().includes(simpleSearchSet.toLowerCase())
        ) {
          const url = `/person/${person.ref._id}`;
          const termLabel = outputRelationTypes(person.term.label);
          const role =
            typeof person.term?.role !== 'undefined' &&
            person.term?.role !== '' ? (
              <i>as {person.term?.role}</i>
            ) : (
              ''
            );
          const roleSpace = role !== '' ? ' ' : '';
          peopleData.push(
            <li key={`${i}-${person.ref._id}`}>
              <Link className="tag-bg tag-item" href={url} to={url}>
                <i>{termLabel}</i> {person.ref.label}
                {roleSpace}
                {role}
              </Link>
            </li>
          );
        }
      }
    }
    let searchVisibleClass = '';
    if (searchVisible) {
      searchVisibleClass = 'visible';
    }
    const searchBar = (
      <div className={`tags-search-container ${searchVisibleClass}`}>
        <Form onSubmit={(e) => simpleSearch(e)}>
          <InputGroup
            size="sm"
            className="search-dropdown-inputgroup classpiece-people-search-input"
          >
            <Input
              className="simple-search-input"
              type="text"
              name="simpleSearchTerm"
              onChange={handleSearchTermChange}
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
            </InputGroupAddon>
          </InputGroup>
        </Form>
      </div>
    );

    let totalPages = Math.ceil(people.length / limit);
    let newPage = page;
    if (totalPages < newPage) {
      if (totalPages === 0) {
        totalPages = 1;
      }
      newPage = totalPages;
    }
    let pagination = [];
    if (totalPages > 1) {
      pagination = (
        <div className="tag-list-pagination">
          <Pagination
            limit={limit}
            current_page={newPage}
            total_pages={totalPages}
            pagination_function={updatePage}
            className="mini people-tags-pagination"
          />
          <span>of {totalPages}</span>
        </div>
      );
    }

    peopleRow = (
      <div key="people">
        <h5>
          People <small>[{peopleItem.length}]</small>
          <div
            className="btn btn-default btn-xs pull-right toggle-info-btn pull-icon-middle"
            onClick={(e) => {
              toggleTable(e, 'peopleData');
            }}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle people visibility"
          >
            <i className={`fa fa-angle-down${peopleDataHiddenIcon}`} />
          </div>
          <div className="tool-box pull-right classpiece-search">
            <div
              className="action-trigger"
              onClick={() => toggleSearch()}
              id="search-tooltip"
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="toggle search"
            >
              <i className="fa fa-search" />
            </div>
          </div>
        </h5>
        <div className={`people-info-container${peopleDataHiddenContainer}`}>
          {searchBar}
          <ul className="tag-list tag-list-people">{peopleData}</ul>
          {pagination}
        </div>
      </div>
    );
  }
  return peopleRow;
};

Block.defaultProps = {
  peopleItem: [],
};
Block.propTypes = {
  peopleItem: PropTypes.array,
};

export default Block;
