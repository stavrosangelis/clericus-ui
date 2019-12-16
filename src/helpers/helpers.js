const domain = process.env.REACT_APP_DOMAIN;
export const getPersonThumbnailURL = (person) => {
  if (person===null || typeof person.resources==="undefined" || person.resources.length===0) {
    return null;
  }
  let thumbnailResource = person.resources.filter((item)=>{return (item.refLabel==="hasRepresentationObject")});
  let thumbnailPath = null;
  if (typeof thumbnailResource[0]!=="undefined") {
    if (typeof thumbnailResource[0].ref.paths!=="undefined") {
      let thumbnailPaths = thumbnailResource[0].ref.paths;
      let thumbnailPathFilter = thumbnailPaths.filter((item)=>{return (item.pathType==="thumbnail")});
      thumbnailPath = domain+"/"+thumbnailPathFilter[0].path;
    }
  }
  return thumbnailPath;
}

export const getResourceThumbnailURL = (resource) => {
  if (resource===null || typeof resource.paths==="undefined") {
    return null;
  }
  let thumbnail = resource.paths.filter((item)=>{return (item.pathType==="thumbnail")});
  let thumbnailPath = null;
  if (typeof thumbnail[0]!=="undefined") {
    thumbnailPath = domain+"/"+thumbnail[0].path;
  }
  return thumbnailPath;
}

export const getResourceFullsizelURL = (resource) => {
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
