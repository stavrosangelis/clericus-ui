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

  classpiecesFilters: {
    //classpieces: [],
    events: [],
    organisations:  {
      type: {},
      data: {},
      dataName: {},
    },
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

  peopleFilters: {
    //classpieces: [],
    events: [],
    organisations:  {
      type: {},
      data: {},
      dataName: {},
    },
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

  eventsFilters: {
    //classpieces: [],
    events: {
      type: {},
      data: {},
      dataName: {},
    },
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

  organisationsFilters: {
    //classpieces: [],
    //events: [],
    organisations: {
      type: {},
      data: {},
      dataName: {},
    },
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
