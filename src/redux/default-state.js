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
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
  },
  classpiecesRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
  },
  
  peopleFilters: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
  },
  peopleRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
  },
  
  eventsFilters: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
  },
  eventsRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
  },
  
  organisationsFilters: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
  },
  organisationsRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
  },

  loadingOrganisations: true,
  organisations: [],

  loadingClasspieces: true,
  classpieces: [],

  loadingEvents: true,
  events: [],
  
  loadingPeople: true,
  people: [],

  loadingSpatial: true,
  spatial: [],

  loadingTemporal: true,
  temporal: []
}
