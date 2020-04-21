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

export function loadOrganisations() {
  return (dispatch,getState) => {
    let params = {
      limit: 1000000
    }
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'organisations',
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

export function loadEvents() {
  return (dispatch,getState) => {
    let params = {
      limit: 1000000
    }
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'events',
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
      url: process.env.REACT_APP_APIPATH+'resources',
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

export function updateFilters(type,params) {
  return (dispatch,getState) => {
    let payload = null;
    if (type==="classpieces") {
      payload = {
        classpiecesFilters: {
          classpieces: params.classpieces,
          events: params.events,
          organisations: params.organisations,
          people: params.people,
        }
      };
    }else if (type==="people") {
      payload = {
        peopleFilters: {
          classpieces: params.classpieces,
          events: params.events,
          organisations: params.organisations,
          people: params.people,
        }
      };
    }else if (type==="events") {
      payload = {
        eventsFilters: {
          classpieces: params.classpieces,
          events: params.events,
          organisations: params.organisations,
          people: params.people,
        }
      };
    }else if (type==="organisations") {
      payload = {
        organisationsFilters: {
          classpieces: params.classpieces,
          events: params.events,
          organisations: params.organisations,
          people: params.people,
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
        }
      };
    }else if (type==="people") {
      payload = {
        peopleRelationship: {
          classpieces: params.classpieces,
          events: params.events,
          organisations: params.organisations,
          people: params.people,
        }
      };
    }else if (type==="events") {
      payload = {
        eventsRelationship: {
          classpieces: params.classpieces,
          events: params.events,
          organisations: params.organisations,
          people: params.people,
        }
      };
    }else if (type==="organisations") {
      payload = {
        organisationsRelationship: {
          classpieces: params.classpieces,
          events: params.events,
          organisations: params.organisations,
          people: params.people,
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
