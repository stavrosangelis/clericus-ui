export const defaultState = {
  genericStats: null,

  peoplePagination: {
    limit:25,
    page:1
  },

  classpiecesPagination: {
    limit:25,
    page:1
  },
  
  eventsPagination: {
    limit:25,
    page:1
  },
  
  organisationsPagination: {
    limit:25,
    page:1
  },

  classpiecesFilters: {
    events: [],
    organisations: [],
  },
  classpiecesRelationship: {
    events: [],
    organisations: [],
  },
  
  peopleFilters: {
    events: [],
    organisations: [],
  },
  peopleRelationship: {
    events: [],
    organisations: [],
  },
  
  eventsFilters: {
    events: [],
    organisations: [],
  },
  eventsRelationship: {
    events: [],
    organisations: [],
  },
  
  organisationsFilters: {
    events: [],
    organisations: [],
  },
  organisationsRelationship: {
    events: [],
    organisations: [],
  },

  loadingOrganisations: true,
  organisations: [],

  loadingClasspieces: true,
  classpieces: [],

  loadingEvents: true,
  events: [],

  loadingSpatial: true,
  spatial: [],

  loadingTemporal: true,
  temporal: []
}
