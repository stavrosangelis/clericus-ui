const domain = process.env.REACT_APP_DOMAIN;
export const getEventThumbnailURL = (eventItem) => {
  return null;
  /*
  if (eventItem===null || typeof eventItem.resources==="undefined" || eventItem.resources.length===0) {
    return null;
  }
  let thumbnailResource = eventItem.resources.filter((item)=>{return (item.term.label==="hasRepresentationObject")});
  let thumbnailPath = null;
  if (typeof thumbnailResource[0]!=="undefined") {
    if (typeof thumbnailResource[0].ref.paths!=="undefined") {
      let thumbnailPaths = thumbnailResource[0].ref.paths;
      if (typeof thumbnailPaths[0]==="string") {
        thumbnailPaths = thumbnailPaths.map(p=>JSON.parse(p));
        if (typeof thumbnailPaths[0]==="string") {
          thumbnailPaths = thumbnailPaths.map(path=>JSON.parse(path));
        }
      }
      let thumbnailPathFilter = thumbnailPaths.filter((item)=>{return (item.pathType==="thumbnail")});
      thumbnailPath = domain+"/"+thumbnailPathFilter[0].path;
    }
  }
  return thumbnailPath;
  */
}

export const getOrganisationThumbnailURL = (organisationItem) => {
  return null;
  /*
  if (organisationItem===null || typeof organisationItem.resources==="undefined" || organisationItem.resources.length===0) {
    return null;
  }
  let thumbnailResource = organisationItem.resources.filter((item)=>{return (item.term.label==="hasRepresentationObject")});
  let thumbnailPath = null;
  if (typeof thumbnailResource[0]!=="undefined") {
    if (typeof thumbnailResource[0].ref.paths!=="undefined") {
      let thumbnailPaths = thumbnailResource[0].ref.paths;
      if (typeof thumbnailPaths[0]==="string") {
        thumbnailPaths = thumbnailPaths.map(p=>JSON.parse(p));
        if (typeof thumbnailPaths[0]==="string") {
          thumbnailPaths = thumbnailPaths.map(path=>JSON.parse(path));
        }
      }
      let thumbnailPathFilter = thumbnailPaths.filter((item)=>{return (item.pathType==="thumbnail")});
      thumbnailPath = domain+"/"+thumbnailPathFilter[0].path;
    }
  }
  return thumbnailPath;
  */
}

export const getPersonThumbnailURL = (person) => {
  if (person===null || typeof person.resources==="undefined" || person.resources.length===0) {
    return null;
  }
  let thumbnailResource = person.resources.filter((item)=>{return (item.term.label==="hasRepresentationObject")});
  let thumbnailPath = null;
  if (typeof thumbnailResource[0]!=="undefined") {
    if (typeof thumbnailResource[0].ref.paths!=="undefined") {
      let thumbnailPaths = thumbnailResource[0].ref.paths;
      if (typeof thumbnailPaths[0]==="string") {
        thumbnailPaths = thumbnailPaths.map(p=>JSON.parse(p));
        if (typeof thumbnailPaths[0]==="string") {
          thumbnailPaths = thumbnailPaths.map(path=>JSON.parse(path));
        }
      }
      let thumbnailPathFilter = thumbnailPaths.filter((item)=>{return (item.pathType==="thumbnail")});
      thumbnailPath = domain+"/"+thumbnailPathFilter[0].path;
    }
  }
  return thumbnailPath;
}

export const getResourceThumbnailURL = (resource) => {
  if (resource===null || typeof resource.paths==="undefined" || resource.paths===null) {
    return null;
  }
  if(typeof resource.paths[0].path==="undefined") {
    let parsedPaths = resource.paths.map(path=>{
      let newPath = JSON.parse(path);
      return newPath;
    });
    resource.paths = parsedPaths;
  }
  let thumbnail = resource.paths.filter((item)=>{return (item.pathType==="thumbnail")});
  let thumbnailPath = null;
  if (typeof thumbnail[0]!=="undefined") {
    thumbnailPath = domain+"/"+thumbnail[0].path;
  }
  return thumbnailPath;
}

export const getResourceFullsizeURL = (resource) => {
  if (resource===null || typeof resource.paths==="undefined") {
    return null;
  }
  if(typeof resource.paths[0].path==="undefined") {
    let parsedPaths = resource.paths.map(path=>{
      let newPath = JSON.parse(path);
      return newPath;
    });
    resource.paths = parsedPaths;
  }
  let thumbnail = resource.paths.filter((item)=>{return (item.pathType==="source")});
  let thumbnailPath = null;
  if (typeof thumbnail[0]!=="undefined") {
    thumbnailPath = domain+"/"+thumbnail[0].path;
  }
  return thumbnailPath;
}

export const getIDFromArray = (dataArray) => {
  let result = [];
  for(var property in dataArray) {
    if(dataArray[property].length>0) {
      for(let i=0;i<dataArray[property].length;i++){
        result.push(dataArray[property][i]);
      }
    }
  }
  return result;
}

export const getInfoFromSort = (type=null,dataString=null) => {
  let orderField = "", orderDesc = null;
  if(dataString === "asc_firstName") {
    orderField = "firstName";
    orderDesc = false;
  }
  else if (dataString === "asc_lastName") {
    orderField = "lastName";
    orderDesc = false;
  }
  else if (dataString === "desc_firstName") {
    orderField = "firstName";
    orderDesc = true;
  }
  else if (dataString === "desc_lastName") {
    orderField = "lastName";
    orderDesc = true;
  }
  
  if (type === "orderField") {
    return orderField;
  }
  else if (type === "orderDesc") {
    return orderDesc;
  }
  
  return null;
}

export const getInfoFromFilterObj = (type=null,filtersData=null) => {
  if ((type !== "people") && (type !== "classpieces")) {
    return null;
  }
  
  let result = {
    /*eventsType,*/
    events: [],
    /*organisationsType,*/
    organisations: [],
    temporals: {},
    resources: [],
  }
  if(typeof filtersData.events !== "undefined") {
    //eventsType = getIDFromArray(filtersData.events.type);
    result.events = filtersData.events;
  }
  if(typeof filtersData.organisations !== "undefined") {
    //organisationsType = getIDFromArray(filtersData.organisations.type);
    result.organisations = filtersData.organisations;
  }
  if(typeof filtersData.temporals !=="undefined") {
    result.temporals = filtersData.temporals;
  }
  /*
  if(filtersData.spatials.length > 0) {
    for (let i=0;i<filtersData.spatials.length;i++) {
      if(!events.includes(filtersData.spatials[i])) {
        result.events.push(filtersData.spatials[i]);
      }
    }
  }
  */
  return result;
}
