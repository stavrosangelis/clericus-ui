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
      thumbnailPath = process.env.REACT_APP_DOMAIN+"/"+thumbnailPathFilter[0].path;
    }
  }
  return thumbnailPath;
}
