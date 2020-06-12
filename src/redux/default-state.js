export const defaultState = {
  genericStats: null,

  peoplePagination: {
    limit:25,
    page:1,
    sort: "asc_firstName",
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
  
  resourcesPagination: {
    limit:25,
    page:1
  },
  
  temporalsPagination: {
    limit:25,
    page:1
  },
  
  spatialsPagination: {
    limit:25,
    page:1
  },

  classpiecesFilters: {
    //classpieces: [],
    events: [],
    organisations:  [],
    //people: [],
    temporals: {
      startDate: "",
      endDate: "",
      dateType: "exact",
    },
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
  loadingClasspiecesRelationship: true,

  peopleFilters: {
    //classpieces: [],
    events: [],
    organisations:  [],
    //people: [],
    temporals: {
      startDate: "",
      endDate: "",
      dateType: "exact",
    },
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
  loadingPeopleRelationship: true,

  eventsFilters: {
    //classpieces: [],
    events: [],
    //organisations: [],
    //people: [],
    //temporals: [],
    //spatials: [],
  },
  eventsRelationship: {
    //classpieces: [],
    events: [],
    //organisations: [],
    //people: [],
    //temporals: [],
    //spatials: [],
  },
  loadingEventsRelationship: true,

  organisationsFilters: {
    //classpieces: [],
    //events: [],
    organisations: [],
    //people: [],
    //temporals: [],
    //spatials: [],
  },
  organisationsRelationship: {
    //classpieces: [],
    //events: [],
    organisations: [],
    //people: [],
    //temporals: [],
    //spatials: [],
  },
  loadingOrganisationsRelationship: true,

  resourcesFilters: {
    //classpieces: [],
    //events: [],
    //organisations: [],
    //people: [],
    //temporals: [],
    //spatials: [],
    resources: [],
  },
  resourcesRelationship: {
    //classpieces: [],
    //events: [],
    //organisations: [],
    //people: [],
    //temporals: [],
    //spatials: [],
    resources: [],
  },
  loadingResourcesRelationship: true,
  
  temporalsFilters: {
    //classpieces: [],
    //events: [],
    //organisations: [],
    //people: [],
    temporals: {
      startDate: "",
      endDate: "",
      dateType: "exact",
    },
    //spatials: [],
  },
  temporalsRelationship: {
    //classpieces: [],
    //events: [],
    //organisations: [],
    //people: [],
    temporals: [],
    //spatials: [],
  },
  loadingTemporalsRelationship: true,
  
  spatialsFilters: {
    //classpieces: [],
    //events: [],
    //organisations: [],
    //people: [],
    //temporals: [],
    spatials: [],
  },
  spatialsRelationship: {
    //classpieces: [],
    //events: [],
    //organisations: [],
    //people: [],
    //temporals: [],
    spatials: [],
  },
  loadingSpatialsRelationship: true,

  loadingResourcesType: true,
  resourcesType: [],

  loadingOrganisationsType: true,
  organisationsType: [],

  loadingOrganisations: true,
  organisations: [],

  loadingClasspieces: true,
  classpieces: [],

  loadingEventsType: true,
  eventsType: [],

  loadingEvents: true,
  events: [],

  loadingPeople: true,
  people: [],

  loadingSpatials: true,
  spatials: [],

  loadingTemporals: true,
  temporals: []
}
