import React, { useState } from 'react';
import { Button, Form, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Pagination from '../pagination';
import { outputRelationTypes } from '../../helpers';

const Block = (props) => {
  // state
  const [searchVisible, setSearchVisible] = useState(false);
  const [simpleSearchSet, setSimpleSearchSet] = useState('');
  const [simpleSearchTerm, setSimpleSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 100;
  const pageIndex = page - 1;
  const firstIndex = pageIndex * limit - 1;
  const lastIndex = firstIndex + limit;

  // props
  const {
    organisations: propsOrganisations,
    toggleTable,
    hidden,
    visible,
  } = props;

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

  let organisationsRow = [];
  if (propsOrganisations.length > 0) {
    const organisations = propsOrganisations.filter((p) =>
      p.ref.label.toLowerCase().includes(simpleSearchSet.toLowerCase())
    );
    const organisationsData = [];
    const { length: oLength } = organisations;
    for (let i = 0; i < oLength; i += 1) {
      if (i > firstIndex) {
        if (i > lastIndex) {
          break;
        }
        const organisation = organisations[i];
        const url = `/organisation/${organisation.ref._id}`;
        const termLabel = outputRelationTypes(organisation.term.label);
        const organisationType =
          organisation.ref.organisationType !== ''
            ? ` [${organisation.ref.organisationType}]`
            : '';
        const role =
          typeof organisation.term?.role !== 'undefined' &&
          organisation.term?.role !== '' ? (
            <i>as {organisation.term?.role}</i>
          ) : (
            ''
          );
        const roleSpace = role !== '' ? ' ' : '';
        const oKey = `${i}-${organisation.ref.label}`;
        organisationsData.push(
          <li key={oKey}>
            <Link className="tag-bg tag-item" href={url} to={url}>
              <i>{termLabel}</i> {organisation.ref.label}
              {organisationType}
              {roleSpace}
              {role}
            </Link>
          </li>
        );
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

    let totalPages = Math.ceil(organisations.length / limit);
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

    organisationsRow = (
      <div key="organisations">
        <h5>
          Organisations <small>[{propsOrganisations.length}]</small>
          <div
            className="btn btn-default btn-xs pull-right toggle-info-btn pull-icon-middle"
            onClick={(e) => {
              toggleTable(e, 'organisations');
            }}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle organisations visibility"
          >
            <i className={`fa fa-angle-down${hidden}`} />
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
        <div className={visible}>
          {searchBar}
          <ul className="tag-list">{organisationsData}</ul>
          {pagination}
        </div>
      </div>
    );
  }

  return organisationsRow;
};

Block.defaultProps = {
  hidden: '',
  visible: '',
  organisations: [],
  toggleTable: () => {},
};
Block.propTypes = {
  hidden: PropTypes.string,
  visible: PropTypes.string,
  organisations: PropTypes.array,
  toggleTable: PropTypes.func,
};

export default Block;
