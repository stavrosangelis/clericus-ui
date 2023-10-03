import React, { useState, useRef } from 'react';
import { Button, Form, Input, InputGroup } from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Pagination from '../Pagination';
import { outputRelationTypes } from '../../helpers';

const Block = (props) => {
  // state
  const [visible, setVisible] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [simpleSearchSet, setSimpleSearchSet] = useState('');
  const [simpleSearchTerm, setSimpleSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 100;
  const pageIndex = page - 1;
  const firstIndex = pageIndex * limit - 1;
  const lastIndex = firstIndex + limit;

  // props
  const { items } = props;
  const { length } = items;

  const searchInputRef = useRef(null);

  const toggleVisible = () => {
    if (visible && searchVisible) {
      setSearchVisible(false);
    }
    setVisible(!visible);
  };

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
    if (!searchVisible) {
      searchInputRef.current.focus();
    }
    setSearchVisible(!searchVisible);
  };

  const updatePage = (e) => {
    if (e > 0 && e !== page) {
      setPage(e);
    }
  };

  let organisationsRow = null;
  if (length > 0) {
    const organisations = items.filter((p) =>
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
        const { ref = null, term = null } = organisation;
        if (ref !== null) {
          const {
            _id: rId = '',
            label: rLabel = '',
            organisationType: tOrganisationType = '',
          } = ref;
          const { label: tLabel = '', role: tRole = '' } = term;
          const url = `/organisation/${rId}`;
          const termLabel = outputRelationTypes(tLabel);
          const organisationType =
            tOrganisationType !== ''
              ? ` [${organisation.ref.organisationType}]`
              : '';
          const role = tRole !== '' ? <i>as {tRole}</i> : '';
          const roleSpace = role !== '' ? ' ' : '';
          const refLabel = rLabel.trim();
          organisationsData.push(
            <li key={`${i}-${refLabel}`}>
              <Link className="tag-bg tag-item" href={url} to={url}>
                <i>{termLabel}</i> {refLabel}
                {organisationType}
                {roleSpace}
                {role}
              </Link>
            </li>
          );
        }
      }
    }
    const searchVisibleClass = searchVisible ? 'visible' : '';
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
              innerRef={searchInputRef}
            />
            <Button
              size="sm"
              outline
              type="button"
              onClick={clearSearch}
              className="clear-search"
            >
              <i className="fa fa-times-circle" />
            </Button>
          </InputGroup>
        </Form>
      </div>
    );

    let totalPages = Math.ceil(oLength / limit);
    let newPage = page;
    if (totalPages < newPage) {
      if (totalPages === 0) {
        totalPages = 1;
      }
      newPage = totalPages;
    }
    const pagination =
      totalPages > 1 ? (
        <div className="tag-list-pagination">
          <Pagination
            limit={limit}
            currentPage={newPage}
            totalPages={totalPages}
            paginationFn={updatePage}
            className="mini people-tags-pagination"
          />
          <span>of {totalPages}</span>
        </div>
      ) : null;

    let visibleClass = '';
    let visibleIcon = '';
    if (!visible) {
      visibleClass = ' item-hidden';
      visibleIcon = ' closed';
    }

    organisationsRow = (
      <>
        <h5 className="item-block-heading">
          <span>
            Organisations <small>[{length}]</small>
          </span>
          <div
            className="btn btn-default btn-xs pull-icon-middle toggle-info-btn pull-icon-middle"
            onClick={toggleVisible}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle organisations visibility"
          >
            <i className={`fa fa-angle-down${visibleIcon}`} />
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
        <div className={`item-block ${visibleClass}`}>
          {searchBar}
          <ul className="tag-list">{organisationsData}</ul>
          {pagination}
        </div>
      </>
    );
  }

  return organisationsRow;
};

Block.defaultProps = {
  items: [],
};
Block.propTypes = {
  items: PropTypes.array,
};

export default Block;
