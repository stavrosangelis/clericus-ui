import React, { useState, useRef } from 'react';
import { Button, Form, Input, InputGroup } from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { outputDate, outputRelationTypes } from '../../helpers';
import Pagination from '../Pagination';

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
  const { _id, items } = props;
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

  let eventsRow = null;
  if (length > 0) {
    const events = items.filter((p) =>
      p.ref.label.toLowerCase().includes(simpleSearchSet.toLowerCase())
    );
    const eventsData = [];
    const eventsWithDate = events.filter(
      (e) => typeof e.temporal !== 'undefined' && e.temporal.length > 0
    );
    const { length: eLength } = eventsWithDate;
    for (let i = 0; i < eLength; i += 1) {
      if (i > firstIndex) {
        if (i > lastIndex) {
          break;
        }
        const event = eventsWithDate[i];
        const {
          term = null,
          people = [],
          ref,
          organisations = [],
          temporal = [],
          spatial = [],
        } = event;
        const termLabel = term !== null ? outputRelationTypes(term.label) : '';
        const br = people.length > 0 ? <span>,</span> : [];
        const { role: termRole = '' } = term;
        const role = termRole !== '' ? <i>as {termRole}</i> : '';
        const roleSpace = role !== '' ? ' ' : '';
        const { label: rLabel = '' } = ref;
        const refLabel = rLabel.trim();
        const label = [
          <div key="label" className="event-label">
            <span>
              <i key="type">{termLabel}</i>{' '}
              <b>
                {refLabel}
                {roleSpace}
                {role}
              </b>
            </span>
            {br}
          </div>,
        ];
        if (people.length > 0) {
          let index = 0;
          const peopleLabels = people.map((o) => {
            const { ref: oRef = null, term: oTerm = null } = o;
            if (oRef !== null) {
              if (oRef._id === _id) {
                index -= 1;
              }
              const personTermLabel =
                term !== null ? outputRelationTypes(oTerm.label) : '';
              const pbr =
                index > 0 ? (
                  <span>
                    ,
                    <br />
                  </span>
                ) : (
                  []
                );
              const output =
                oRef._id !== _id ? (
                  <span key={o._id}>
                    {pbr}
                    <i>{personTermLabel}</i> <b>{oRef.label}</b>
                  </span>
                ) : (
                  []
                );
              index += 1;
              return output;
            }
            return null;
          });
          if (peopleLabels.length > 0) {
            label.push(
              <div key="people" className="event-related-people">
                {peopleLabels}
              </div>
            );
          }
        }
        if (organisations.length > 0) {
          const organisationLabels = organisations.map((o) => {
            const { term: oTerm = null, ref: oRef = null } = o;
            const orgTermLabel =
              oTerm !== null ? outputRelationTypes(oTerm.label) : '';
            const organisationType =
              oRef.organisationType !== '' ? ` [${oRef.organisationType}]` : '';
            return (
              <span key={o._id}>
                <i>{orgTermLabel}</i> <b>{oRef.label}</b>
                {organisationType}
              </span>
            );
          });
          if (organisationLabels.length > 0) {
            label.push(<div key="organisations">{organisationLabels}</div>);
          }
        }
        if (temporal.length > 0) {
          const temporalLabels = temporal.map((t) => {
            const { ref: temp = null } = t;
            let tLabel = '';
            if (
              typeof temp.startDate !== 'undefined' &&
              temp.startDate !== ''
            ) {
              tLabel = outputDate(temp.startDate);
            }
            if (
              typeof temp.endDate !== 'undefined' &&
              temp.endDate !== '' &&
              temp.endDate !== temp.startDate
            ) {
              tLabel += ` - ${outputDate(temp.endDate)}`;
            }
            return tLabel;
          });
          if (temporalLabels.length > 0) {
            const temporalLabel = temporalLabels.join(' | ');
            label.push(
              <div key="temp">
                <i className="fa fa-calendar-o" />{' '}
                <span key="dates">{temporalLabel}</span>
              </div>
            );
          }
        }
        if (spatial.length > 0) {
          const spatialLabels = spatial.map((s) => {
            const { ref: spat = null } = s;
            if (ref !== null) {
              return spat.label;
            }
            return null;
          });
          if (spatialLabels.length > 0) {
            const spatialLabel = spatialLabels.join(' | ');
            label.push(
              <div key="spatial">
                <i className="fa fa-map" /> {spatialLabel}
              </div>
            );
          }
        }
        const url = `/event/${ref._id}`;
        eventsData.push(
          <li key={event.ref._id}>
            <Link className="tag-bg tag-item" href={url} to={url}>
              {label}
            </Link>
          </li>
        );
      }
    }

    ///
    const eventsWithoutDate = events.filter(
      (e) => typeof e.temporal === 'undefined' || e.temporal.length === 0
    );
    const { length: eWDLength } = eventsWithoutDate;
    if (eWDLength > 0) {
      eventsData.push(
        <h6 className="events-divider" key="undated">
          <span>Undated Events</span>
        </h6>
      );
    }
    for (let i = 0; i < eWDLength; i += 1) {
      if (i > firstIndex) {
        if (i > lastIndex) {
          break;
        }
        const event = eventsWithoutDate[i];
        const {
          term = null,
          people = [],
          ref,
          organisations = [],
          temporal = [],
          spatial = [],
        } = event;
        const termLabel = term !== null ? outputRelationTypes(term.label) : '';
        const br = people.length > 0 ? <span>,</span> : [];
        const { role: termRole = '' } = term;
        const role = termRole !== '' ? <i>as {termRole}</i> : '';
        const roleSpace = role !== '' ? ' ' : '';
        const { label: rLabel = '' } = ref;
        const refLabel = rLabel.trim();
        const label = [
          <div key="label" className="event-label">
            <span>
              <i key="type">{termLabel}</i>{' '}
              <b>
                {refLabel}
                {roleSpace}
                {role}
              </b>
            </span>
            {br}
          </div>,
        ];
        if (people.length > 0) {
          let index = 0;
          const peopleLabels = people.map((o) => {
            const { ref: oRef = null, term: oTerm = null } = o;
            if (oRef !== null) {
              if (oRef._id === _id) {
                index -= 1;
              }
              const personTermLabel =
                term !== null ? outputRelationTypes(oTerm.label) : '';
              const pbr =
                index > 0 ? (
                  <span>
                    ,
                    <br />
                  </span>
                ) : (
                  []
                );
              const output =
                oRef._id !== _id ? (
                  <span key={o._id}>
                    {pbr}
                    <i>{personTermLabel}</i> <b>{oRef.label}</b>
                  </span>
                ) : (
                  []
                );
              index += 1;
              return output;
            }
            return null;
          });
          if (peopleLabels.length > 0) {
            label.push(
              <div key="people" className="event-related-people">
                {peopleLabels}
              </div>
            );
          }
        }
        if (organisations.length > 0) {
          const organisationLabels = organisations.map((o) => {
            const { term: oTerm = null, ref: oRef = null } = o;
            const orgTermLabel =
              oTerm !== null ? outputRelationTypes(oTerm.label) : '';
            const organisationType =
              oRef.organisationType !== '' ? ` [${oRef.organisationType}]` : '';
            return (
              <span key={o._id}>
                <i>{orgTermLabel}</i> <b>{oRef.label}</b>
                {organisationType}
              </span>
            );
          });
          if (organisationLabels.length > 0) {
            label.push(<div key="organisations">{organisationLabels}</div>);
          }
        }
        if (temporal.length > 0) {
          const temporalLabels = temporal.map((t) => {
            const { ref: temp = null } = t;
            let tLabel = '';
            if (
              typeof temp.startDate !== 'undefined' &&
              temp.startDate !== ''
            ) {
              tLabel = outputDate(temp.startDate);
            }
            if (
              typeof temp.endDate !== 'undefined' &&
              temp.endDate !== '' &&
              temp.endDate !== temp.startDate
            ) {
              tLabel += ` - ${outputDate(temp.endDate)}`;
            }
            return tLabel;
          });
          if (temporalLabels.length > 0) {
            const temporalLabel = temporalLabels.join(' | ');
            label.push(
              <div key="temp">
                <i className="fa fa-calendar-o" />{' '}
                <span key="dates">{temporalLabel}</span>
              </div>
            );
          }
        }
        if (spatial.length > 0) {
          const spatialLabels = spatial.map((s) => {
            const { ref: spat = null } = s;
            if (ref !== null) {
              return spat.label;
            }
            return null;
          });
          if (spatialLabels.length > 0) {
            const spatialLabel = spatialLabels.join(' | ');
            label.push(
              <div key="spatial">
                <i className="fa fa-map" /> {spatialLabel}
              </div>
            );
          }
        }
        const url = `/event/${ref._id}`;
        eventsData.push(
          <li key={event.ref._id}>
            <Link className="tag-bg tag-item" href={url} to={url}>
              {label}
            </Link>
          </li>
        );
      }
    }
    ///
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

    let totalPages = Math.ceil(eLength / limit);
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

    eventsRow = (
      <>
        <h5 className="item-block-heading">
          <span>
            Events <small>[{length}]</small>
          </span>
          <div
            className="btn btn-default btn-xs pull-icon-middle toggle-info-btn pull-icon-middle"
            onClick={toggleVisible}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle events table visibility"
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
          <ul className="tag-list">{eventsData}</ul>
          {pagination}
        </div>
      </>
    );
  }
  return eventsRow;
};

Block.defaultProps = {
  _id: '',
  items: [],
};
Block.propTypes = {
  _id: PropTypes.string,
  items: PropTypes.array,
};
export default Block;
