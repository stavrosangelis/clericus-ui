import axios from 'axios';

export function setPaginationParams(type, params) {
  return (dispatch, getState) => {
    let payload = null;
    const pagination = `${type}Pagination`;
    const newValues = { ...getState()[pagination] };
    Object.keys(params).forEach((key) => {
      newValues[key] = params[key];
    });
    payload = {
      [pagination]: newValues,
    };
    if (payload === null) {
      return false;
    }
    dispatch({
      type: 'GENERIC_UPDATE',
      payload,
    });
    return false;
  };
}

export function loadGenericStats() {
  return (dispatch) => {
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}generic-stats`,
      crossDomain: true,
    })
      .then((response) => {
        const payload = {
          genericStats: response.data.data,
        };
        dispatch({
          type: 'GENERIC_UPDATE',
          payload,
        });
      })
      .catch((error) => console.log(error));
  };
}

export function loadOrganisationsType() {
  return (dispatch) => {
    const params = {
      systemType: 'organisationTypes',
    };
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}taxonomy`,
      crossDomain: true,
      params,
    })
      .then((response) => {
        const payload = {
          loadingOrganisationsType: false,
          organisationsType: response.data.data.taxonomyterms,
        };
        dispatch({
          type: 'GENERIC_UPDATE',
          payload,
        });
      })
      .catch((error) => console.log(error));
  };
}

export function loadOrganisations() {
  return async (dispatch) => {
    const responseData = await axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}ui-organisations-filters`,
      crossDomain: true,
    })
      .then((response) => response.data.data)
      .catch((error) => console.log(error));
    const payload = {
      loadingOrganisations: false,
      organisations: responseData,
    };
    dispatch({
      type: 'GENERIC_UPDATE',
      payload,
    });
  };
}

export function loadEventsType() {
  return (dispatch) => {
    const params = {
      systemType: 'eventTypes',
    };
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}taxonomy`,
      crossDomain: true,
      params,
    })
      .then((response) => {
        const payload = {
          loadingEventsType: false,
          eventsType: response.data.data.taxonomyterms,
        };
        dispatch({
          type: 'GENERIC_UPDATE',
          payload,
        });
      })
      .catch((error) => console.log(error));
  };
}

export function loadEvents() {
  return (dispatch) => {
    const params = {
      limit: 1000000,
    };
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}ui-events`,
      crossDomain: true,
      params,
    })
      .then((response) => {
        const payload = {
          loadingEvents: false,
          events: response.data.data.data,
        };
        dispatch({
          type: 'GENERIC_UPDATE',
          payload,
        });
      })
      .catch((error) => console.log(error));
  };
}

export function loadPeopleType() {
  return (dispatch) => {
    const params = {
      systemType: 'personTypes',
    };
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}taxonomy`,
      crossDomain: true,
      params,
    })
      .then((response) => {
        const payload = {
          loadingPersonType: false,
          personType: response.data.data.taxonomyterms,
        };
        dispatch({
          type: 'GENERIC_UPDATE',
          payload,
        });
      })
      .catch((error) => console.log(error));
  };
}

export function loadPeople() {
  return (dispatch) => {
    const params = {
      limit: 1000000,
    };
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}ui-people`,
      crossDomain: true,
      params,
    })
      .then((response) => {
        const payload = {
          loadingPeople: false,
          people: response.data.data.data,
        };
        dispatch({
          type: 'GENERIC_UPDATE',
          payload,
        });
      })
      .catch((error) => console.log(error));
  };
}

export function loadClasspieces() {
  return (dispatch) => {
    const params = {
      limit: 1000000,
    };
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}classpieces`,
      crossDomain: true,
      params,
    })
      .then((response) => {
        const payload = {
          loadingClasspieces: false,
          classpieces: response.data.data.data,
        };
        dispatch({
          type: 'GENERIC_UPDATE',
          payload,
        });
      })
      .catch((error) => console.log(error));
  };
}

export function loadTemporals() {
  return (dispatch) => {
    const params = {
      limit: 1000000,
      orderField: 'startDate',
      orderDesc: false,
    };
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}temporals`,
      crossDomain: true,
      params,
    })
      .then((response) => {
        const payload = {
          loadingTemporals: false,
          temporals: response.data.data.data,
        };
        dispatch({
          type: 'GENERIC_UPDATE',
          payload,
        });
      })
      .catch((error) => console.log(error));
  };
}

export function loadSpatials() {
  return (dispatch) => {
    const params = {
      limit: 1000000,
    };
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}spatials`,
      crossDomain: true,
      params,
    })
      .then((response) => {
        const payload = {
          loadingSpatials: false,
          spatials: response.data.data.data,
        };
        dispatch({
          type: 'GENERIC_UPDATE',
          payload,
        });
      })
      .catch((error) => console.log(error));
  };
}

export function loadResourcesType() {
  return (dispatch) => {
    const params = {
      systemType: 'resourceSystemTypes',
      flat: true,
    };
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}taxonomy`,
      crossDomain: true,
      params,
    })
      .then((response) => {
        const payload = {
          loadingResourcesType: false,
          resourcesType: response.data.data.taxonomyterms,
        };
        dispatch({
          type: 'GENERIC_UPDATE',
          payload,
        });
      })
      .catch((error) => console.log(error));
  };
}

export function loadPeopleSources() {
  return (dispatch) => {
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_APIPATH}ui-people-sources`,
      crossDomain: true,
    })
      .then((response) => {
        const payload = {
          loadingPeopleSources: false,
          peopleSources: response.data.data,
        };
        dispatch({
          type: 'GENERIC_UPDATE',
          payload,
        });
      })
      .catch((error) => console.log(error));
  };
}

export function updateFilters(type, params) {
  return (dispatch, getState) => {
    let payload = null;
    const filtersName = `${type}Filters`;
    const newValues = { ...getState()[filtersName] };
    Object.keys(params).forEach((key) => {
      newValues[key] = params[key];
    });
    payload = {
      [filtersName]: newValues,
    };
    if (payload === null) {
      return false;
    }
    dispatch({
      type: 'GENERIC_UPDATE',
      payload,
    });
    return false;
  };
}

export function clearFilters(type) {
  return (dispatch, getState) => {
    let payload = null;
    const filtersName = `${type}Filters`;
    const newValues = { ...getState()[filtersName] };
    if (typeof newValues.events !== 'undefined') {
      newValues.events = [];
    }
    if (typeof newValues.organisations !== 'undefined') {
      newValues.organisations = [];
    }
    if (typeof newValues.temporals !== 'undefined') {
      newValues.temporals = {
        startDate: '',
        endDate: '',
        dateType: 'exact',
      };
    }
    if (typeof newValues.organisationType !== 'undefined') {
      newValues.organisationType = '';
    }
    if (typeof newValues.eventType !== 'undefined') {
      newValues.eventType = '';
    }
    if (typeof newValues.personType !== 'undefined') {
      newValues.personType = '';
    }
    if (typeof newValues.sources !== 'undefined') {
      newValues.sources = [];
    }
    if (typeof newValues.resourcesType !== 'undefined') {
      newValues.resourcesType = '';
    }
    if (typeof newValues.spatials !== 'undefined') {
      newValues.spatials = [];
    }
    payload = {
      [filtersName]: newValues,
    };
    if (payload === null) {
      return false;
    }
    dispatch({
      type: 'GENERIC_UPDATE',
      payload,
    });
    return false;
  };
}

export function setRelationshipParams(type, params) {
  return (dispatch, getState) => {
    let payload = null;
    const relationships = `${type}Relationship`;
    const newValues = { ...getState()[relationships] };
    Object.keys(params).forEach((key) => {
      newValues[key] = params[key];
    });
    payload = {
      [relationships]: newValues,
    };
    if (payload === null) {
      return false;
    }
    dispatch({
      type: 'GENERIC_UPDATE',
      payload,
    });
    return false;
  };
}
