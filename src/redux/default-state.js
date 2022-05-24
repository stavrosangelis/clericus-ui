const defaultState = {
  genericStats: {
    people: 0,
    resources: 0,
    dioceses: 0,
    lastNames: 0,
    organisations: 0,
    events: 0,
    spatial: 0,
    temporal: 0,
    classpieces: 0,
  },

  peoplePagination: {
    advancedSearchInputs: [],
    limit: 25,
    page: 1,
    simpleSearchTerm: '',
    orderField: 'lastName',
    orderDesc: false,
    totalItems: 0,
    totalPages: 0,
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
    personType: '',
    sources: [],
    temporals: {
      startDate: '',
      endDate: '',
      dateType: 'exact',
    },
  },

  classpiecesPagination: {
    limit: 24,
    page: 1,
    simpleSearchTerm: '',
    totalItems: 0,
    totalPages: 0,
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
    temporals: {
      startDate: '',
      endDate: '',
      dateType: 'exact',
    },
  },

  resourcesPagination: {
    limit: 25,
    page: 1,
    simpleSearchTerm: '',
    orderField: 'label',
    orderDesc: false,
    totalItems: 0,
    totalPages: 0,
  },
  resourcesFilters: {
    resourcesType: '',
    events: [],
    temporals: {
      startDate: '',
      endDate: '',
      dateType: 'exact',
    },
  },

  organisationsPagination: {
    limit: 25,
    page: 1,
    simpleSearchTerm: '',
    orderField: 'label',
    orderDesc: false,
    totalItems: 0,
    totalPages: 0,
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
    organisationType: '',
  },

  eventsPagination: {
    limit: 25,
    page: 1,
    simpleSearchTerm: '',
    orderField: 'label',
    orderDesc: false,
    totalItems: 0,
    totalPages: 0,
  },
  eventsFilters: {
    eventType: '',
    temporals: {
      startDate: '',
      endDate: '',
      dateType: 'exact',
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
    limit: 25,
    page: 1,
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
      startDate: '',
      endDate: '',
      dateType: 'exact',
    },
  },

  spatialsPagination: {
    limit: 25,
    page: 1,
    simpleSearchTerm: '',
    orderField: 'label',
    orderDesc: false,
    totalItems: 0,
    totalPages: 0,
  },

  loadingClasspiecesRelationship: true,

  loadingPeopleRelationship: true,

  loadingEventsRelationship: true,

  loadingOrganisationsRelationship: true,

  loadingResourcesRelationship: true,

  loadingTemporalsRelationship: true,

  spatialsFilters: {
    spatials: [],
  },
  spatialsRelationship: {
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

  loadingPersonType: true,
  personType: [],

  loadingEvents: true,
  events: [],

  loadingPeople: true,
  people: [],

  loadingSpatials: true,
  spatials: [],

  loadingTemporals: true,
  temporals: [],

  loadingPeopleSources: true,
  peopleSources: [],
};
export default defaultState;
