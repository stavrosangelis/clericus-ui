import axios from 'axios';

export function setPaginationParams(type,params) {
  return (dispatch,getState) => {
    let payload = null;
    let pagination = type+"Pagination";
    let newValues = Object.assign({},getState()[pagination]);
    for (let key in params) {
      newValues[key] = params[key];
    }
    payload = {
      [pagination]: newValues
    };
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

export function loadResourcesType() {
  return (dispatch,getState) => {
    let params = {
      systemType: "resourceSystemTypes",
      flat: true,
    }
    axios({
      method: 'get',
      url: process.env.REACT_APP_APIPATH+'taxonomy',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let payload = {
        loadingResourcesType: false,
        resourcesType: response.data.data.taxonomyterms,
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
    let filtersName = type+"Filters";
    let newValues = Object.assign({},getState()[filtersName]);
    for (let key in params) {
      newValues[key] = params[key];
    }
    payload = {
      [filtersName]: newValues
    };

    if (payload===null) {
      return false;
    }
    dispatch({
      type: "GENERIC_UPDATE",
      payload: payload
    });
  }

}

export function clearFilters(type) {
  return (dispatch,getState) => {
    let payload = null;
    let filtersName = type+"Filters";
    let newValues = Object.assign({},getState()[filtersName]);
    if (typeof newValues.events!=="undefined") {
      newValues.events = [];
    }
    if (typeof newValues.organisations!=="undefined") {
      newValues.organisations = [];
    }
    if (typeof newValues.temporals!=="undefined") {
      newValues.temporals = {
        startDate: "",
        endDate: "",
        dateType: "exact",
      };
    }
    if (typeof newValues.organisationType!=="undefined") {
      newValues.organisationType = "";
    }
    if (typeof newValues.eventType!=="undefined") {
      newValues.eventType = "";
    }
    payload = {
      [filtersName]: newValues
    };
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
    let relationships = type+"Relationship";
    let newValues = Object.assign({},getState()[relationships]);
    for (let key in params) {
      newValues[key] = params[key];
    }
    payload = {
      [relationships]: newValues
    };
    if (payload===null) {
      return false;
    }
    dispatch({
      type: "GENERIC_UPDATE",
      payload: payload
    });
  }

}
