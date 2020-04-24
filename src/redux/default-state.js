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
    //temporals: [],
    //spatials: [],
  },
  classpiecesRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    //temporals: [],
    //spatials: [],
  },
  
  peopleFilters: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    //temporals: [],
    //spatials: [],
  },
  peopleRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    //temporals: [],
    //spatials: [],
  },
  
  eventsFilters: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
  eventsRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
  
  organisationsFilters: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
  organisationsRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },

  loadingOrganisations: true,
  organisations: [],

  loadingClasspieces: true,
  classpieces: [],

  loadingEvents: true,
  events: [],
  
  loadingPeople: true,
  people: [],

  loadingSpatials: true,
  spatials: [],

  loadingTemporals: true,
  temporals: []
}
