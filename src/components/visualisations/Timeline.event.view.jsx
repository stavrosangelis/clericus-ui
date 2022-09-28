import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Badge, Collapse, Spinner } from 'reactstrap';
import { outputDate, getResourceThumbnailURL } from '../../helpers';

function TimelineEventView(props) {
  const { relatedOpen, selectedEvent, toggle, toggleRelated, visible } = props;

  let output = null;
  const visibleClass = visible ? '' : ' hidden';
  if (selectedEvent === null && visible) {
    output = (
      <div style={{ padding: '40pt', textAlign: 'center' }}>
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>
    );
  }
  if (selectedEvent !== null) {
    const { description = '' } = selectedEvent;

    const {
      events: rEventsOpen,
      organisations: rOrganisationsOpen,
      people: rPeopleOpen,
      resources: rResourcesOpen,
      classpieces: rClasspiecesOpen,
    } = relatedOpen;

    const {
      label = '',
      temporal = [],
      events = [],
      organisations = [],
      people = [],
      resources = [],
      classpieces = [],
    } = selectedEvent;

    let dateLabel = null;
    if (temporal.length > 0) {
      let date = null;
      const { ref } = selectedEvent.temporal[0];
      const { startDate = '', endDate = '' } = ref;
      date = outputDate(startDate);
      if (endDate !== '' && endDate !== startDate) {
        date += ` - ${outputDate(endDate)}`;
      }
      if (date !== null) {
        dateLabel = (
          <>
            , <small> [{date}]</small>
          </>
        );
      }
    }

    const eventDescription =
      description !== '' ? (
        <div className="event-details-description">{description}</div>
      ) : null;
    let eventDetails = null;
    const eventsOpen = !rEventsOpen ? '' : ' active';
    if (events.length > 0) {
      const relatedEvents = events.map((e) => {
        const { _id = '', label: eLabel = '' } = e.ref;
        return (
          <Link href={`/event/${_id}`} to={`/event/${_id}`} key={_id}>
            <Badge className="related-event badge-event" color="warning">
              {eLabel}
            </Badge>
          </Link>
        );
      });
      eventDetails = (
        <div className="event-details-related">
          <div
            className={`toggle-event-details-related ${eventsOpen}`}
            onClick={() => toggleRelated('events')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle related events"
          >
            Events <small>[{relatedEvents.length}]</small>:{' '}
            <i className="fa fa-angle-down" />
          </div>
          <Collapse isOpen={rEventsOpen}>{relatedEvents}</Collapse>
        </div>
      );
    }

    let organisationDetails = null;
    const organisationsOpen = !rOrganisationsOpen ? '' : ' active';
    if (organisations.length > 0) {
      const relatedOrganisations = organisations.map((e) => {
        const { _id = '', label: oLabel = '' } = e.ref;
        return (
          <Link
            href={`/organisation/${_id}`}
            to={`/organisation/${_id}`}
            key={_id}
          >
            <Badge className="related-organisation badge-organisation">
              {oLabel}
            </Badge>
          </Link>
        );
      });
      organisationDetails = (
        <div className="event-details-related">
          <div
            className={`toggle-event-details-related ${organisationsOpen}`}
            onClick={() => toggleRelated('organisations')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle related organisations"
          >
            Organisations <small>[{relatedOrganisations.length}]</small>:{' '}
            <i className="fa fa-angle-down" />
          </div>
          <Collapse isOpen={rOrganisationsOpen}>
            {relatedOrganisations}
          </Collapse>
        </div>
      );
    }

    let peopleDetails = null;
    const peopleOpen = !rPeopleOpen ? '' : ' active';
    if (people.length > 0) {
      const relatedPeople = people.map((e) => {
        const { _id = '', label: pLabel = '' } = e.ref;
        return (
          <Link href={`/person/${_id}`} to={`/person/${_id}`} key={_id}>
            <Badge className="related-person">{pLabel}</Badge>
          </Link>
        );
      });
      peopleDetails = (
        <div className="event-details-related">
          <div
            className={`toggle-event-details-related ${peopleOpen}`}
            onClick={() => toggleRelated('people')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle related people"
          >
            People <small>[{relatedPeople.length}]</small>:{' '}
            <i className="fa fa-angle-down" />
          </div>
          <Collapse isOpen={rPeopleOpen}>{relatedPeople}</Collapse>
        </div>
      );
    }

    let resourcesDetails = null;
    const resourcesOpen = !rResourcesOpen ? '' : ' active';
    if (resources.length > 0) {
      const relatedResources = resources.map((e) => {
        const { ref = null } = e;
        if (ref !== null) {
          const { label: rLabel = '', _id = '' } = ref;
          const thumbnailPath = getResourceThumbnailURL(ref);
          const thumbnailImage =
            thumbnailPath !== null ? (
              <img src={thumbnailPath} alt={rLabel} />
            ) : null;
          return (
            <Link href={`/resource/${_id}`} to={`/resource/${_id}`} key={_id}>
              <Badge className="related-resource badge-resource">
                {thumbnailImage}
                {rLabel}
              </Badge>
            </Link>
          );
        }
        return null;
      });
      resourcesDetails = (
        <div className="event-details-related">
          <div
            className={`toggle-event-details-related ${resourcesOpen}`}
            onClick={() => toggleRelated('resources')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle related resources"
          >
            Resources <small>[{relatedResources.length}]</small>:{' '}
            <i className="fa fa-angle-down" />
          </div>
          <Collapse isOpen={rResourcesOpen}>{relatedResources}</Collapse>
        </div>
      );
    }

    let classpiecesDetails = null;
    const classpiecesOpen = !rClasspiecesOpen ? '' : ' active';
    if (classpieces.length > 0) {
      const relatedClasspieces = classpieces.map((e) => {
        const { ref = null } = e;
        if (ref !== null) {
          const { label: cLabel = '', _id = '' } = ref;
          const thumbnailPath = getResourceThumbnailURL(ref);
          const thumbnailImage =
            thumbnailPath !== null ? (
              <img src={thumbnailPath} alt={cLabel} />
            ) : null;
          return (
            <Link
              href={`/classpiece/${_id}`}
              to={`/classpiece/${_id}`}
              key={_id}
            >
              <Badge className="related-classpiece badge-resource">
                {thumbnailImage}
                {cLabel}
              </Badge>
            </Link>
          );
        }
        return null;
      });
      classpiecesDetails = (
        <div className="event-details-related">
          <div
            className={`toggle-event-details-related ${classpiecesOpen}`}
            onClick={() => toggleRelated('classpieces')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle related classpieces"
          >
            Classpieces <small>[{relatedClasspieces.length}]</small>:{' '}
            <i className="fa fa-angle-down" />
          </div>
          <Collapse isOpen={rClasspiecesOpen}>{relatedClasspieces}</Collapse>
        </div>
      );
    }

    output = (
      <div className={`event-details${visibleClass}`}>
        <h4>
          <div className="event-details-back">
            <i
              className="fa fa-chevron-left"
              onClick={() => toggle()}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="toggle selected event"
            />
          </div>
          <span>{label}</span> {dateLabel}
        </h4>
        <div className="event-details-body">
          {eventDescription}
          {eventDetails}
          {organisationDetails}
          {peopleDetails}
          {resourcesDetails}
          {classpiecesDetails}
        </div>
      </div>
    );
  }
  return output;
}

TimelineEventView.defaultProps = {
  selectedEvent: null,
};
TimelineEventView.propTypes = {
  selectedEvent: PropTypes.object,
  toggle: PropTypes.func.isRequired,
  toggleRelated: PropTypes.func.isRequired,
  relatedOpen: PropTypes.shape({
    events: PropTypes.bool,
    organisations: PropTypes.bool,
    people: PropTypes.bool,
    resources: PropTypes.bool,
    classpieces: PropTypes.bool,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
};

export default TimelineEventView;
