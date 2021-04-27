import React from 'react';
import { Spinner } from 'reactstrap';
import moment from 'moment';

const domain = process.env.REACT_APP_DOMAIN;

export const jsonStringToObject = (strParam) => {
  let str = strParam;
  if (typeof str === 'string') {
    str = JSON.parse(str);
    if (typeof str === 'string') {
      str = jsonStringToObject(str);
    }
  }
  return str;
};

export const getPersonThumbnailURL = (person) => {
  if (
    person === null ||
    typeof person.resources === 'undefined' ||
    person.resources.length === 0
  ) {
    return [];
  }
  const thumbnailResources = person.resources.filter(
    (item) => item.term.label === 'hasRepresentationObject'
  );
  const thumbnailPaths = [];
  const fullsizePaths = [];

  if (typeof thumbnailResources !== 'undefined') {
    for (let i = 0; i < thumbnailResources.length; i += 1) {
      const t = thumbnailResources[i];
      if (typeof t.ref.paths !== 'undefined') {
        const { paths } = t.ref;
        for (let j = 0; j < paths.length; j += 1) {
          let path = paths[j];
          if (typeof path === 'string') {
            path = jsonStringToObject(path);
          }
          if (path.pathType === 'thumbnail') {
            const newPath = `${domain}/${path.path}`;
            thumbnailPaths.push(newPath);
          }
          if (path.pathType === 'source') {
            const newPath = `${domain}/${path.path}`;
            fullsizePaths.push(newPath);
          }
        }
      }
    }
  }
  return { thumbnails: thumbnailPaths, fullsize: fullsizePaths };
};

export const getResourceThumbnailURL = (resourceParam) => {
  const resource = resourceParam;
  if (
    resource === null ||
    typeof resource.paths === 'undefined' ||
    resource.paths === null ||
    resource.paths.length === 0
  ) {
    return null;
  }
  if (typeof resource.paths[0].path === 'undefined') {
    const parsedPaths = resource.paths.map((path) => {
      const newPath = JSON.parse(path);
      return newPath;
    });
    resource.paths = parsedPaths;
  }
  const thumbnail = resource.paths.filter(
    (item) => item.pathType === 'thumbnail'
  );
  let thumbnailPath = null;
  if (typeof thumbnail[0] !== 'undefined') {
    thumbnailPath = `${domain}/${thumbnail[0].path}`;
  }
  return thumbnailPath;
};

export const getResourceFullsizeURL = (resourceParam) => {
  const resource = resourceParam;
  if (
    resource === null ||
    typeof resource.paths === 'undefined' ||
    resource.paths === null ||
    resource.paths.length === 0
  ) {
    return null;
  }
  if (typeof resource.paths[0].path === 'undefined') {
    const parsedPaths = resource.paths.map((path) => {
      const newPath = JSON.parse(path);
      return newPath;
    });
    resource.paths = parsedPaths;
  }
  const thumbnail = resource.paths.filter((item) => item.pathType === 'source');
  let thumbnailPath = null;
  if (typeof thumbnail[0] !== 'undefined') {
    thumbnailPath = `${domain}/${thumbnail[0].path}`;
  }
  return thumbnailPath;
};

export const updateDocumentTitle = (title = null) => {
  let documentTitle = 'Clericus';
  if (title !== null) {
    documentTitle += ` / ${title}`;
  }
  document.title = documentTitle;
};

export const getCookie = (cname) => {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

export const checkSessionCookies = () => {
  if (getCookie('letterssessionactive') === 'true') {
    const userName = getCookie('lettersusername');
    const accessToken = getCookie('lettersaccesstoken');
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('sessionActive', true);
    sessionStorage.setItem('accessToken', accessToken);
  } else {
    sessionStorage.setItem('userName', '');
    sessionStorage.setItem('sessionActive', false);
    sessionStorage.setItem('accessToken', '');
  }
};

export const setCookie = (name, value, expires) => {
  document.cookie = `${name}=${value}${
    expires == null ? '' : `;expires=${expires.toUTCString()}`
  };domain=${window.location.hostname};path=/`;
};

export const webglSupport = () => {
  const canvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (gl && gl instanceof WebGLRenderingContext) {
    return true;
  }

  return false;
};

export const outputDate = (date, short = true) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const dateArr = date.split('-');
  const d = dateArr[0];
  const m = Number(dateArr[1]) - 1;
  const y = dateArr[2];
  let month = months[m];
  if (short) {
    month = month.substr(0, 3);
  }
  const output = `${d} ${month} ${y}`;
  return output;
};

export const renderLoader = () => (
  <div className="generic-loading">
    <i>Loading data...</i> <Spinner color="info" />
  </div>
);

export const getClosestDate = (query = null, dates = [], type = 'years') => {
  if (query === null || query === '' || dates.length === 0) {
    return false;
  }
  let minDiff = null;
  let closestDate = [];
  for (let i = 0; i < dates.length; i += 1) {
    const date = dates[i];
    const mDate = moment(date, 'DD-MM-YYYY');
    const diff = Math.abs(moment(query, 'DD/MM/YYYY').diff(mDate, type, true));
    if (!minDiff || diff < minDiff) {
      minDiff = diff;
      closestDate = date;
    }
  }
  return closestDate;
};
