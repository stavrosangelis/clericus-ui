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
  let thumbnail = resource.paths.filter((item)=>{return (item.pathType==="source")});
  let thumbnailPath = null;
  if (typeof thumbnail[0]!=="undefined") {
    thumbnailPath = domain+"/"+thumbnail[0].path;
  }
  return thumbnailPath;
}
