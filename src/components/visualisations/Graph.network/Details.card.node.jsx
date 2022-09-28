import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Label, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import LazyList from '../../Lazylist';
import {
  outputEventSmall,
  outputOrganisationSmall,
  outputPersonSmall,
  outputResourceSmall,
} from '../../../helpers';

export default function DetailsCard(props) {
  const {
    clickNode,
    loadingNode,
    nodeLink,
    relatedNodesItems,
    toggleDetailsCard,
  } = props;

  const {
    classpieces = [],
    events = [],
    organisations = [],
    people = [],
    resources = [],
  } = relatedNodesItems;

  const [tabs, setTabs] = useState({
    classpieces: '',
    events: '',
    organisations: '',
    people: '',
    resources: '',
  });

  const prevNodes = useRef(null);

  const toggleTabs = useCallback(
    (tab) => {
      const copy = { ...tabs };
      // eslint-disable-next-line no-restricted-syntax
      for (const [key] of Object.entries(copy)) {
        copy[key] = '';
      }
      copy[tab] = ' active';
      setTabs(copy);
    },
    [tabs]
  );

  useEffect(() => {
    if (
      prevNodes.current === null &&
      (classpieces.length > 0 ||
        events.length > 0 ||
        organisations.length > 0 ||
        people.length > 0 ||
        resources.length > 0)
    ) {
      prevNodes.current = relatedNodesItems;

      if (classpieces.length > 0) {
        toggleTabs('classpieces');
      } else if (events.length > 0) {
        toggleTabs('events');
      } else if (organisations.length > 0) {
        toggleTabs('organisations');
      } else if (people.length > 0) {
        toggleTabs('people');
      } else if (resources.length > 0) {
        toggleTabs('resources');
      }
    }
  }, [
    relatedNodesItems,
    toggleTabs,
    classpieces,
    events,
    organisations,
    people,
    resources,
  ]);

  const renderRelatedNodeHTMLItem = useCallback(
    (item) => {
      if (typeof item === 'undefined' || item === null) {
        return null;
      }
      const { type: itemType, _id, label } = item;
      let outputLabel;
      switch (itemType) {
        case 'Classpiece':
          outputLabel = outputResourceSmall(item);
          break;
        case 'Event':
          outputLabel = outputEventSmall(item);
          break;
        case 'Organisation':
          outputLabel = outputOrganisationSmall(item);
          break;
        case 'Person':
          outputLabel = outputPersonSmall(item);
          break;
        case 'Resource':
          outputLabel = outputResourceSmall(item);
          break;
        default:
          outputLabel = label;
          break;
      }

      return (
        <div className="details" key={_id}>
          <div className="label">{outputLabel}</div>
          <div className="actions">
            <Button
              color="secondary"
              outline
              size="sm"
              onClick={() => clickNode(_id)}
            >
              Go to <i className="fa fa-chevron-right" />
            </Button>{' '}
            <Link
              to={`/${itemType}/${_id}`}
              target="_blank"
              className="btn btn-outline-secondary btn-sm"
            >
              Details <i className="fa fa-external-link-alt" />
            </Link>
          </div>
        </div>
      );
    },
    [clickNode]
  );

  const detailsLoader = loadingNode ? (
    <Spinner className="node-details-loader" color="info" size="sm" />
  ) : null;

  let detailsCardContent = null;
  if (!loadingNode) {
    const {
      classpieces: tab1 = '',
      events: tab2 = '',
      organisations: tab3 = '',
      people: tab4 = '',
      resources: tab5 = '',
    } = tabs;
    const { length: cLength } = classpieces;
    const { length: eLength } = events;
    const { length: oLength } = organisations;
    const { length: pLength } = people;
    const { length: rLength } = resources;
    const tabHeader = [];
    const tabContent = [];
    const total = cLength + eLength + oLength + pLength + rLength;
    if (cLength > 0) {
      tabHeader.push(
        <div
          key="classpieces"
          className={`tab-header${tab1}`}
          onClick={() => toggleTabs('classpieces')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle classpieces tab"
        >
          Classpieces <small>({cLength})</small>
        </div>
      );
      tabContent.push(
        <div key="classpieces" className={`tab-content${tab1}`}>
          <LazyList
            limit={30}
            range={15}
            items={classpieces}
            containerClass="node-relations-list"
            listClass="entries-list"
            renderItem={renderRelatedNodeHTMLItem}
          />
        </div>
      );
    }
    if (eLength > 0) {
      tabHeader.push(
        <div
          key="events"
          className={`tab-header${tab2}`}
          onClick={() => toggleTabs('events')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle events tab"
        >
          Events <small>({eLength})</small>
        </div>
      );
      tabContent.push(
        <div key="events" className={`tab-content${tab2}`}>
          <LazyList
            limit={30}
            range={15}
            items={events}
            containerClass="node-relations-list"
            listClass="entries-list"
            renderItem={renderRelatedNodeHTMLItem}
          />
        </div>
      );
    }
    if (oLength > 0) {
      tabHeader.push(
        <div
          key="organisations"
          className={`tab-header${tab3}`}
          onClick={() => toggleTabs('organisations')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle organisations tab"
        >
          Organisations <small>({oLength})</small>
        </div>
      );
      tabContent.push(
        <div key="organisations" className={`tab-content${tab3}`}>
          <LazyList
            limit={30}
            range={15}
            items={organisations}
            containerClass="node-relations-list"
            listClass="entries-list"
            renderItem={renderRelatedNodeHTMLItem}
          />
        </div>
      );
    }
    if (pLength > 0) {
      tabHeader.push(
        <div
          key="people"
          className={`tab-header${tab4}`}
          onClick={() => toggleTabs('people')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle people tab"
        >
          People <small>({pLength})</small>
        </div>
      );
      tabContent.push(
        <div key="people" className={`tab-content${tab4}`}>
          <LazyList
            limit={30}
            range={15}
            items={people}
            containerClass="node-relations-list"
            listClass="entries-list"
            renderItem={renderRelatedNodeHTMLItem}
          />
        </div>
      );
    }
    if (rLength > 0) {
      tabHeader.push(
        <div
          key="resources"
          className={`tab-header${tab5}`}
          onClick={() => toggleTabs('resources')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle resources tab"
        >
          Resources <small>({rLength})</small>
        </div>
      );
      tabContent.push(
        <div key="resources" className={`tab-content${tab5}`}>
          <LazyList
            limit={30}
            range={15}
            items={resources}
            containerClass="node-relations-list"
            listClass="entries-list"
            renderItem={renderRelatedNodeHTMLItem}
          />
        </div>
      );
    }
    detailsCardContent = (
      <>
        <div className="card-title">
          <h4>Node details {detailsLoader}</h4>
        </div>
        <div className="card-body">
          <div className="card-content">
            <div className="node-relations-title">
              <div>
                <Label>Entity: </Label> {nodeLink}
              </div>
            </div>
            <div>
              <Label>
                Related nodes [<b>{total}</b>]
              </Label>
              <div className="tabs-header small">{tabHeader}</div>
              {tabContent}
            </div>
          </div>
          <div className="card-footer">
            <button
              type="button"
              className="btn btn-xs btn-outline btn-secondary"
              onClick={() => toggleDetailsCard()}
            >
              Close
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="card graph-details-card">
      <div
        className="graph-details-card-close"
        onClick={() => toggleDetailsCard()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle details"
      >
        <i className="fa fa-times" />
      </div>
      {detailsCardContent}
    </div>
  );
}

DetailsCard.defaultProps = {
  nodeLink: null,
};

DetailsCard.propTypes = {
  clickNode: PropTypes.func.isRequired,
  loadingNode: PropTypes.bool.isRequired,
  nodeLink: PropTypes.object,
  relatedNodesItems: PropTypes.shape({
    classpieces: PropTypes.array,
    events: PropTypes.array,
    organisations: PropTypes.array,
    people: PropTypes.array,
    resources: PropTypes.array,
  }).isRequired,
  toggleDetailsCard: PropTypes.func.isRequired,
};
