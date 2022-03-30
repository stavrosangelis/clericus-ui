import React, { useState } from 'react';
import { Button, Form, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { outputDate, outputRelationTypes } from '../../helpers';
import Pagination from '../pagination';

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
  const { _id, events: propsEvents, toggleTable, hidden, visible } = props;

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

  let eventsRow = [];
  if (propsEvents.length > 0) {
    const events = propsEvents.filter((p) =>
      p.ref.label.toLowerCase().includes(simpleSearchSet.toLowerCase())
    );
    const eventsData = [];
    const { length: eLength } = events;
    for (let i = 0; i < eLength; i += 1) {
      if (i > firstIndex) {
        if (i > lastIndex) {
          break;
        }
        const event = events[i];
        const termLabel = outputRelationTypes(event.term.label);
        const br = event.people?.length > 0 ? <span>,</span> : [];
        const role =
          typeof event.term?.role !== 'undefined' && event.term?.role !== '' ? (
            <i>as {event.term?.role}</i>
          ) : (
            ''
          );
        const roleSpace = role !== '' ? ' ' : '';
        const label = [
          <div key="label" className="event-label">
            <span>
              <i key="type">{termLabel}</i>{' '}
              <b>
                {event.ref.label}
                {roleSpace}
                {role}
              </b>
            </span>
            {br}
          </div>,
        ];
        if (typeof event.people !== 'undefined' && event.people.length > 0) {
          let index = 0;
          const peopleLabels = event.people.map((o) => {
            if (o.ref._id === _id) {
              index -= 1;
            }
            const personTermLabel = outputRelationTypes(o.term.label);
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
              o.ref._id !== _id ? (
                <span key={o._id}>
                  {pbr}
                  <i>{personTermLabel}</i> <b>{o.ref.label}</b>
                </span>
              ) : (
                []
              );
            index += 1;
            return output;
          });
          if (peopleLabels.length > 0) {
            label.push(
              <div key="people" className="event-related-people">
                {peopleLabels}
              </div>
            );
          }
        }
        if (
          typeof event.organisations !== 'undefined' &&
          event.organisations.length > 0
        ) {
          const organisationLabels = event.organisations.map((o) => {
            const orgTermLabel = outputRelationTypes(o.term.label);
            const organisationType =
              o.ref.organisationType !== ''
                ? ` [${o.ref.organisationType}]`
                : '';
            return (
              <span key={o._id}>
                <i>{orgTermLabel}</i> <b>{o.ref.label}</b>
                {organisationType}
              </span>
            );
          });
          if (organisationLabels.length > 0) {
            label.push(<div key="organisations">{organisationLabels}</div>);
          }
        }
        if (
          typeof event.temporal !== 'undefined' &&
          event.temporal.length > 0
        ) {
          const temporalLabels = event.temporal.map((t) => {
            const temp = t.ref;
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
        if (typeof event.spatial !== 'undefined' && event.spatial.length > 0) {
          const spatialLabels = event.spatial.map((s) => {
            const spatial = s.ref;
            return spatial.label;
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
        const url = `/event/${event.ref._id}`;
        eventsData.push(
          <li key={event.ref._id}>
            <Link className="tag-bg tag-item" href={url} to={url}>
              {label}
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

    let totalPages = Math.ceil(events.length / limit);
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

    eventsRow = (
      <div key="events">
        <h5>
          Events <small>[{propsEvents.length}]</small>
          <div
            className="btn btn-default btn-xs pull-right toggle-info-btn pull-icon-middle"
            onClick={(e) => {
              toggleTable(e, 'events');
            }}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle events table visibility"
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
          <ul className="tag-list">{eventsData}</ul>
          {pagination}
        </div>
      </div>
    );
  }
  return eventsRow;
};
Block.defaultProps = {
  _id: null,
  hidden: '',
  visible: '',
  events: [],
  toggleTable: () => {},
};
Block.propTypes = {
  _id: PropTypes.string,
  hidden: PropTypes.string,
  visible: PropTypes.string,
  events: PropTypes.array,
  toggleTable: PropTypes.func,
};
export default Block;
