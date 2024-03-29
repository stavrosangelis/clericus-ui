import React, { lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  updateFilters as updateFiltersFn,
  clearFilters as clearFiltersFn,
} from '../redux/actions';
import { renderLoader } from '../helpers';

import '../scss/filters.scss';

const Filter = lazy(() => import('./Filter'));
const FilterTemporal = lazy(() => import('./Filter.temporal'));

function Filters(props) {
  // redux
  const dispatch = useDispatch();
  const loadingOrganisationsType = useSelector(
    (state) => state.loadingOrganisationsType
  );
  const {
    organisationsType,
    organisations: propsOrganisations,
    loadingEventsType,
    eventsType,
    loadingPersonType,
    personType,
    loadingResourcesType,
    resourcesType: propsResourcesType,
    loadingPeopleSources,
    peopleSources,
    temporals: propsTemporals,
  } = useSelector((state) => state);

  // props
  const {
    name: propsName,
    updatedata,
    filterType: propsFilterType,
    relationshipSet,
    filtersSet,
    updateType,
  } = props;

  const updateFilters = (name, values, dataRefresh = true) => {
    const payload = {
      [name]: values,
    };
    dispatch(updateFiltersFn(propsName, payload));

    if (dataRefresh) {
      setTimeout(() => {
        updatedata();
      }, 20);
    }
  };

  const clearAllFilters = () => {
    dispatch(clearFiltersFn(propsName));
    setTimeout(() => {
      updatedata();
    }, 20);
  };

  // render
  let eventsOut = null;
  let organisationsOut = null;
  let eventTypeOut = null;
  let personTypeOut = null;
  let resourcesOut = null;
  let sourcesOut = null;
  let temporalsOut = null;
  const spatialsOut = null;
  const dataTypes = null;
  const { length } = propsFilterType;
  for (let i = 0; i < length; i += 1) {
    const filterType = propsFilterType[i];
    if (filterType === 'events') {
      const eventsFiltersSet = filtersSet.events || [];
      eventsOut = (
        <Suspense fallback={renderLoader()} key="events">
          <Filter
            loading={loadingEventsType}
            relationshipSet={relationshipSet.events}
            filtersSet={eventsFiltersSet}
            filtersType="events"
            items={eventsType}
            label="Events Types"
            updateFilters={updateFilters}
          />
        </Suspense>
      );
    }
    if (filterType === 'organisations') {
      organisationsOut = (
        <Suspense fallback={renderLoader()} key="organisations">
          <Filter
            loading={loadingOrganisationsType}
            relationshipSet={relationshipSet.organisations}
            filtersSet={filtersSet.organisations}
            filtersType="organisations"
            items={propsOrganisations}
            itemsType={organisationsType}
            label="Organisations"
            updateFilters={updateFilters}
          />
        </Suspense>
      );
    }
    if (filterType === 'organisationType') {
      organisationsOut = (
        <Suspense fallback={renderLoader()} key="organisationType">
          <Filter
            loading={loadingOrganisationsType}
            relationshipSet={[]}
            filtersSet={filtersSet}
            filtersType="organisationType"
            itemsType={organisationsType}
            items={[]}
            label="Organisation type"
            updateFilters={updateFilters}
            updateType={updateType}
          />
        </Suspense>
      );
    }
    if (filterType === 'eventType') {
      eventTypeOut = (
        <Suspense fallback={renderLoader()} key="eventType">
          <Filter
            loading={loadingEventsType}
            relationshipSet={[]}
            filtersSet={filtersSet}
            filtersType="eventType"
            itemsType={eventsType}
            items={[]}
            label="Event type"
            updateFilters={updateFilters}
            updateType={updateType}
          />
        </Suspense>
      );
    }
    if (filterType === 'personType') {
      personTypeOut = (
        <Suspense fallback={renderLoader()} key="personType">
          <Filter
            loading={loadingPersonType}
            relationshipSet={[]}
            filtersSet={filtersSet}
            filtersType="personType"
            itemsType={personType}
            items={[]}
            label="Type"
            updateFilters={updateFilters}
            updateType={updateType}
          />
        </Suspense>
      );
    }
    if (filterType === 'resourcesType') {
      const resourcesTypes =
        propsResourcesType.filter((r) => r.labelId !== 'Classpiece') || [];

      resourcesOut = (
        <Suspense fallback={renderLoader()} key="resourcesTypes">
          <Filter
            loading={loadingResourcesType}
            relationshipSet={[]}
            filtersSet={filtersSet}
            filtersType="resourcesType"
            items={[]}
            itemsType={resourcesTypes}
            label="Resources type"
            updateFilters={updateFilters}
            updateType={updateType}
          />
        </Suspense>
      );
    }
    if (filterType === 'sources') {
      sourcesOut = (
        <Suspense fallback={renderLoader()} key="sources">
          <Filter
            loading={loadingPeopleSources}
            relationshipSet={relationshipSet.sources}
            filtersSet={filtersSet.sources}
            filtersType="sources"
            items={peopleSources}
            label="Sources"
            updateFilters={updateFilters}
          />
        </Suspense>
      );
    }
    if (filterType === 'temporals') {
      temporalsOut = (
        <Suspense fallback={renderLoader()} key="temporals">
          <FilterTemporal
            filtersSet={filtersSet.temporals}
            relationshipSet={relationshipSet.events}
            filtersType="temporals"
            items={propsTemporals}
            itemsType={eventsType}
            label="Dates"
            updateFilters={updateFilters}
          />
        </Suspense>
      );
    }
  }

  return (
    <>
      <h4 style={{ position: 'relative' }}>
        Filters
        <small
          className="pull-right clear-filters"
          onClick={() => {
            clearAllFilters();
          }}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="clear filters"
        >
          clear all <i className="fa fa-times-circle" />
        </small>
      </h4>
      {eventsOut}
      {organisationsOut}
      {eventTypeOut}
      {sourcesOut}
      {personTypeOut}
      {resourcesOut}
      {temporalsOut}
      {spatialsOut}
      {dataTypes}
    </>
  );
}

Filters.defaultProps = {
  name: '',
  filterType: [],
  filtersSet: {
    events: {
      eventType: '',
      temporals: {
        startDate: '',
        endDate: '',
        dateType: 'exact',
      },
    },
    organisations: {
      organisationType: '',
    },
    sources: {},
    temporals: {},
  },
  relationshipSet: null,
  updatedata: () => {},
  organisations: [],
  updateType: () => {},
  temporals: [],
};
Filters.propTypes = {
  name: PropTypes.string,
  filterType: PropTypes.array,
  filtersSet: PropTypes.shape({
    events: PropTypes.oneOfType([
      PropTypes.shape({
        eventType: PropTypes.string,
        temporals: PropTypes.shape({
          startDate: PropTypes.string,
          endDate: PropTypes.string,
          dateType: PropTypes.string,
        }),
      }),
      PropTypes.array,
    ]),
    organisations: PropTypes.array,
    resourcesType: PropTypes.string,
    sources: PropTypes.array,
    temporals: PropTypes.object,
  }),
  relationshipSet: PropTypes.object,
  updatedata: PropTypes.func,
  organisations: PropTypes.array,
  updateType: PropTypes.func,
  temporals: PropTypes.array,
};

export default Filters;
