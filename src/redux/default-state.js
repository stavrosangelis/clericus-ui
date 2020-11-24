export const defaultState = {
  genericStats: {
    people: 0,
    resources: 0,
    dioceses: 0,
    lastNames: 0,
    organisations: 0,
    events: 0,
    spatial: 0,
    temporal: 0,
    classpieces: 0
  },

  peoplePagination: {
    limit:25,
    page:1,
    orderField: "lastName",
    orderDesc: false,
    simpleSearchTerm: "",
    advancedSearchInputs: [],
  },
  peopleRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
  peopleFilters: {
    events: [],
    organisations:  [],
    temporals: {
      startDate: "",
      endDate: "",
      dateType: "exact",
    },
  },

  classpiecesPagination: {
    limit:50,
    page:1,
    simpleSearchTerm: "",
  },
  classpiecesRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
  classpiecesFilters: {
    events: [],
    organisations:  [],
    temporals: {
      startDate: "",
      endDate: "",
      dateType: "exact",
    },
  },

  resourcesPagination: {
    limit:25,
    page:1,
    simpleSearchTerm: "",
  },

  resourcesFilters: {
    resourcesTypes: []
  },

  organisationsPagination: {
    limit:25,
    page:1,
    simpleSearchTerm: "",
  },
  organisationsRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
  organisationsFilters: {
    organisationType: "",
  },

  eventsPagination: {
    limit:25,
    page:1,
    simpleSearchTerm: ""
  },
  eventsFilters: {
    eventType: "",
    temporals: {
      startDate: "",
      endDate: "",
      dateType: "exact",
    },
  },
  eventsRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },

  temporalsPagination: {
    limit:25,
    page:1,
    simpleSearchTerm: "",
  },
  temporalsRelationship: {
    classpieces: [],
    events: [],
    organisations: [],
    people: [],
    temporals: [],
    spatials: [],
  },
  temporalsFilters: {
    temporals: {
      startDate: "",
      endDate: "",
      dateType: "exact",
    },
  },

  spatialsPagination: {
    limit:25,
    page:1,
    simpleSearchTerm: "",
  },


  loadingClasspiecesRelationship: true,


  loadingPeopleRelationship: true,


  loadingEventsRelationship: true,



  loadingOrganisationsRelationship: true,


  loadingResourcesRelationship: true,

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
