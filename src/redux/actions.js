import axios from 'axios';

export function setPaginationParams(type,params) {
  return (dispatch,getState) => {
    let payload = null;
    /*
    if (type==="resources") {
      payload = {
        resourcesPagination: {
          limit:params.limit,
          activeSystemType:params.activeSystemType,
          page:params.page,
        }
      };
    }
    */
    if (type==="classpieces") {
      payload = {
        classpiecesPagination: {
          limit:params.limit,
          page:params.page,
        }
      };
    }else if (type==="people") {
      payload = {
        peoplePagination: {
          limit:params.limit,
          page:params.page,
        }
      };
    }else if (type==="events") {
      payload = {
        eventsPagination: {
          limit:params.limit,
          page:params.page,
        }
      };
    }else if (type==="organisations") {
      payload = {
        organisationsPagination: {
          limit:params.limit,
          page:params.page,
        }
      };
    }
    else {
      return false;
    }

    if (payload===null) {
      return false;
    }
    dispatch({
      type: "GENERIC_UPDATE",
      payload: payload
    });
  }
}

export function loadGenericStats() {
  return (dispatch,getState) => {
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'generic-stats',
      crossDomain: true,
    })
	  .then(function (response) {
      let payload = {
        genericStats: response.data.data,
      }
      dispatch({
        type: "GENERIC_UPDATE",
        payload: payload
      });
	  })
	  .catch(function (error) {
	  });
  }
}

export function loadOrganisationsType() {
  return (dispatch,getState) => {
    let params = {
      systemType: "organisationTypes"
    }
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'taxonomy',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let payload = {
        loadingOrganisationsType: false,
        organisationsType: response.data.data.taxonomyterms,
      }
      dispatch({
        type: "GENERIC_UPDATE",
        payload: payload
      });
	  })
	  .catch(function (error) {
	  });
  }
}

export function loadOrganisations() {
  return (dispatch,getState) => {
    let params = {
      limit: 1000000
    }
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'ui-organisations',
      crossDomain: true,
      params: params
    })
    .then(function (response) {
      let payload = {
        loadingOrganisations: false,
        organisations: response.data.data.data,
      }
      dispatch({
        type: "GENERIC_UPDATE",
        payload: payload
      });
    })
    .catch(function (error) {
    });
  }
}

export function loadEventsType() {
  return (dispatch,getState) => {
    let params = {
      systemType: "eventTypes"
    }
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'taxonomy',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let payload = {
        loadingEventsType: false,
        eventsType: response.data.data.taxonomyterms,
      }
      dispatch({
        type: "GENERIC_UPDATE",
        payload: payload
      });
	  })
	  .catch(function (error) {
	  });
  }
}

export function loadEvents() {
  return (dispatch,getState) => {
    let params = {
      limit: 1000000
    }
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'ui-events',
      crossDomain: true,
      params: params
    })
    .then(function (response) {
      let payload = {
        loadingEvents: false,
        events: response.data.data.data,
      }
      dispatch({
        type: "GENERIC_UPDATE",
        payload: payload
      });
    })
    .catch(function (error) {
    });
  }
}

export function loadPeople() {
  return (dispatch,getState) => {
    let params = {
      limit: 1000000
    }
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'ui-people',
      crossDomain: true,
      params: params
    })
    .then(function (response) {
      let payload = {
        loadingPeople: false,
        people: response.data.data.data,
      }
      dispatch({
        type: "GENERIC_UPDATE",
        payload: payload
      });
    })
    .catch(function (error) {
    });
  }
}

export function loadClasspieces() {
  return (dispatch,getState) => {
    let params = {
      limit: 1000000
    }
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'classpieces',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let payload = {
        loadingClasspieces: false,
        classpieces: response.data.data.data,
      }
      dispatch({
        type: "GENERIC_UPDATE",
        payload: payload
      });
	  })
	  .catch(function (error) {
	  });
  }
}

export function loadTemporals() {
  return (dispatch,getState) => {
    let params = {
      limit: 1000000,
      orderField: "startDate",
      orderDesc: false,
    }
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'temporals',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let payload = {
        loadingTemporals: false,
        temporals: response.data.data.data,
      }
      dispatch({
        type: "GENERIC_UPDATE",
        payload: payload
      });
	  })
	  .catch(function (error) {
	  });
  }
}

export function loadSpatials() {
  return (dispatch,getState) => {
    let params = {
      limit: 1000000
    }
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'spatials',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let payload = {
        loadingSpatials: false,
        spatials: response.data.data.data,
      }
      dispatch({
        type: "GENERIC_UPDATE",
        payload: payload
      });
	  })
	  .catch(function (error) {
	  });
  }
}

export function updateFilters(type,params) {
  return (dispatch,getState) => {
    let payload = null;
    let eventsData = params.events;
    let organisationsData = params.organisations;
    let temporalsData = params.temporals;
    let spatialsData = params.spatials;
    if (type==="classpieces") {
      /*
      if(typeof params.events === "undefined") {
        eventsData = Object.assign({}, getState().classpiecesFilters.events);
      }*/
      if(typeof params.organisations === "undefined") {
        organisationsData = Object.assign({}, getState().classpiecesFilters.organisations);
      }
      if(typeof params.temporals === "undefined") {
        temporalsData = Object.assign({}, getState().classpiecesFilters.temporals);
      }
      if(typeof params.spatials === "undefined") {
        spatialsData = Object.assign({}, getState().classpiecesFilters.spatials);
      }
      payload = {
        classpiecesFilters: {
          //classpieces: params.classpieces,
          //events: eventsData,
          organisations: organisationsData,
          //people: params.people,
          temporals: temporalsData,
          spatials: spatialsData,
        }
      };
    }else if (type==="people") {
      if(typeof params.events === "undefined") {
        eventsData = Object.assign([], getState().peopleFilters.events);
      }
      if(typeof params.organisations === "undefined") {
        organisationsData = Object.assign({}, getState().peopleFilters.organisations);
      }
      if(typeof params.temporals === "undefined") {
        temporalsData = Object.assign({}, getState().peopleFilters.temporals);
      }
      if(typeof params.spatials === "undefined") {
        spatialsData = Object.assign({}, getState().peopleFilters.spatials);
      }
      payload = {
        peopleFilters: {
          //classpieces: params.classpieces,
          events: eventsData,
          organisations: organisationsData,
          //people: params.people,
          temporals: temporalsData,
          spatials: spatialsData,
        }
      };
    }else if (type==="events") {
      payload = {
        eventsFilters: {
          //classpieces: params.classpieces,
          events: eventsData,
          //organisations: params.organisations,
          //people: params.people,
          //temporals: params.temporals,
          //spatials: params.spatials,
        }
      };
    }else if (type==="organisations") {
      payload = {
        organisationsFilters: {
          //classpieces: params.classpieces,
          //events: params.events,
          organisations: organisationsData,
          //people: params.people,
          //temporals: params.temporals,
          //spatials: params.spatials,
        }
      };
    }
    else {
      return false;
    }

    if (payload===null) {
      return false;
    }
    dispatch({
      type: "GENERIC_UPDATE",
      payload: payload
    });
  }

}

export function setRelationshipParams(type,params) {
  return (dispatch,getState) => {
    let payload = null;
    if (type==="classpieces") {
      payload = {
        classpiecesRelationship: {
          classpieces: params.classpieces,
          events: params.events,
          organisations: params.organisations,
          people: params.people,
          //temporals: params.temporals,
          //spatials: params.spatials,
        }
      };
    }else if (type==="people") {
      payload = {
        peopleRelationship: {
          classpieces: params.classpieces,
          events: params.events,
          organisations: params.organisations,
          people: params.people,
          //temporals: params.temporals,
          //spatials: params.spatials,
        }
      };
    }else if (type==="events") {
      payload = {
        eventsRelationship: {
          classpieces: params.classpieces,
          events: params.events,
          organisations: params.organisations,
          people: params.people,
          temporals: params.temporals,
          spatials: params.spatials,
        }
      };
    }else if (type==="organisations") {
      payload = {
        organisationsRelationship: {
          classpieces: params.classpieces,
          events: params.events,
          organisations: params.organisations,
          people: params.people,
          temporals: params.temporals,
          spatials: params.spatials,
        }
      };
    }
    else {
      return false;
    }

    if (payload===null) {
      return false;
    }
    dispatch({
      type: "GENERIC_UPDATE",
      payload: payload
    });
  }

}
