import React from 'react';
import { Spinner } from 'reactstrap';

const domain = process.env.REACT_APP_DOMAIN;

export const getPersonThumbnailURL = (person) => {
  if (person===null || typeof person.resources==="undefined" || person.resources.length===0) {
    return [];
  }
  let thumbnailResources = person.resources.filter((item)=>{return (item.term.label==="hasRepresentationObject")});
  let thumbnailPaths = [];
  let fullsizePaths = [];

  if (typeof thumbnailResources!=="undefined") {
    for (let i=0;i<thumbnailResources.length; i++) {
      let t = thumbnailResources[i];
      if (typeof t.ref.paths!=="undefined") {
        let paths = t.ref.paths;
        for (let j=0;j<paths.length;j++) {
          let path = paths[j];
          if (typeof path==="string") {
            path = jsonStringToObject(path);
          }
          if (path.pathType==="thumbnail") {
            let newPath = domain+"/"+path.path;
            thumbnailPaths.push(newPath);
          }
          if (path.pathType==="source") {
            let newPath = domain+"/"+path.path;
            fullsizePaths.push(newPath);
          }
        }
      }
    }
  }
  return {thumbnails:thumbnailPaths, fullsize: fullsizePaths};
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

export const updateDocumentTitle = (title=null) => {
  let documentTitle = "Clericus";
  if (title!==null) {
    documentTitle += ` / ${title}`;
  }
  document.title = documentTitle;
}

export const checkSessionCookies = () => {
  if (getCookie('letterssessionactive')==="true") {
    let userName = getCookie('lettersusername');
    let accessToken = getCookie('lettersaccesstoken');
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('sessionActive', true);
    sessionStorage.setItem('accessToken', accessToken);
  }
  else {
    sessionStorage.setItem('userName', '');
    sessionStorage.setItem('sessionActive', false);
    sessionStorage.setItem('accessToken', '');
  }
}

export const getCookie = (cname) => {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}

export const setCookie = (name,value,expires) => {
   document.cookie = name + "=" + value + ((expires==null) ? "" : ";expires=" + expires.toUTCString())+";domain="+window.location.hostname+";path=/";
}

export const jsonStringToObject = (str) => {
  if (typeof str==="string") {
    str = JSON.parse(str);
    if (typeof str==="string") {
      str = jsonStringToObject(str);
    }
  }
  return str;
}

export const webglSupport = () => {
   var canvas = document.createElement('canvas');
   var gl = canvas.getContext("webgl")
     || canvas.getContext("experimental-webgl");
   if (gl && gl instanceof WebGLRenderingContext) {
     return true;
   }
   else {
     return false;
   }
 };

 export const outputDate = (date, short=true) => {
   let months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
   let dateArr = date.split("-");
   let d = dateArr[0];
   let m = Number(dateArr[1])-1;
   let y = dateArr[2];
   let month = months[m];
   if (short) {
     month = month.substr(0,3);
   }
   let output = `${d} ${month} ${y}`;
   return output;
 }

export const renderLoader = () => <div className="generic-loading"><i>Loading data...</i> <Spinner color="info" /></div>;
