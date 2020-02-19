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

  classpiecesFilters: {
    events: [],
    organisations: [],
  },
  
  classpiecesRelationship: {
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
