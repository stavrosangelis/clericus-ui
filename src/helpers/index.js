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

export const getItemThumbnailsURL = (item) => {
  const { resources = [] } = item;
  const { length } = resources;
  if (length === 0) {
    return [];
  }
  const thumbnailResources =
    resources.filter((r) => r.term.label === 'hasRepresentationObject') || [];
  const { length: tLength } = thumbnailResources;
  const thumbnailPaths = [];
  const fullsizePaths = [];

  for (let i = 0; i < tLength; i += 1) {
    const t = thumbnailResources[i];
    const { ref = null } = t;
    if (ref !== null) {
      const { paths = [] } = ref;
      const { length: pLength } = paths;
      for (let j = 0; j < pLength; j += 1) {
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
  return { thumbnails: thumbnailPaths, fullsize: fullsizePaths };
};

export const getResourceThumbnailURL = (resourceParam = null) => {
  const { paths = [] } = resourceParam;
  if (paths.length > 0) {
    const parsedPaths =
      typeof paths[0].path === 'undefined'
        ? paths.map((path) => {
            const newPath = JSON.parse(path);
            return newPath;
          })
        : paths;
    const thumbnail = parsedPaths.filter(
      (item) => item.pathType === 'thumbnail'
    );
    const thumbnailPath =
      typeof thumbnail[0] !== 'undefined'
        ? `${domain}/${thumbnail[0].path}`
        : null;
    return thumbnailPath;
  }
  return null;
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

export const outputDate = (date = '', short = true) => {
  if (date !== '') {
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
  }
  return '';
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

const isUpperCase = (c) => {
  const result = c === c.toUpperCase();
  return result;
};

export const outputRelationTypes = (str) => {
  let newString = '';
  for (let i = 0; i < str.length; i += 1) {
    const c = str[i];
    const upperCase = isUpperCase(c);
    if (upperCase) {
      newString += ` ${c.toLowerCase()}`;
    } else {
      newString += c;
    }
  }
  return newString;
};

export const debounce = (fn, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, timeout);
  };
};

export const personLabel = (person) => {
  const { firstName = '', middleName = '', lastName = '' } = person;
  let label = '';
  if (firstName !== '') {
    label += firstName;
  }
  if (middleName !== '') {
    if (label !== '') {
      label += ' ';
    }
    label += middleName;
  }
  if (lastName !== '') {
    if (label !== '') {
      label += ' ';
    }
    label += lastName;
  }
  return label;
};

// timeline
export const timelineItem = (data, i) => {
  const { startDate = '', endDate = '' } = data;
  if (startDate !== '') {
    const startDateArr = startDate.split('-');
    const startYear = startDateArr[2];
    let endYear = startDateArr[2];
    if (endDate !== '') {
      const endDateArr = endDate.split('-');
      [, , endYear] = endDateArr;
    }
    const newItem = {
      startYear,
      endYear,
      item: data,
      i,
    };
    return newItem;
  }
  return null;
};

export const reducer = (accumulator, itemParam) =>
  Object.assign(accumulator, {
    [itemParam.startYear]: (accumulator[itemParam.startYear] || []).concat(
      itemParam
    ),
  });

export const initialData = (data) => {
  const initialVal = {
    startYear: 0,
    endYear: 0,
    item: null,
  };
  const newItems = [initialVal];
  const { length } = data;
  for (let i = 0; i < length; i += 1) {
    const initItem = timelineItem(data[i], i);
    if (initItem !== null) {
      newItems.push(initItem);
    }
  }
  const grouped = newItems.reduce(reducer);
  const newGroup = [];
  Object.keys(grouped).forEach((key) => {
    const value = grouped[key];
    if (key !== 'endYear' && key !== 'startYear' && key !== 'item') {
      newGroup.push({
        date: key,
        label: key,
        items: value,
        i: key,
        group: true,
      });
    }
  });
  return newGroup;
};

export const groupItemsByYear = (items) => {
  const initialVal = {
    startYear: 0,
    endYear: 0,
    item: null,
  };
  const newItems = [initialVal];
  const { length } = items;
  for (let i = 0; i < length; i += 1) {
    const newItem = timelineItem(items[i], i);
    if (newItem !== null) {
      newItems.push(newItem);
    }
  }
  const grouped = newItems.reduce(reducer);
  const newGroup = [];
  Object.keys(grouped).forEach((key) => {
    const value = grouped[key];
    if (key !== 'endYear' && key !== 'startYear' && key !== 'item') {
      newGroup.push({
        date: key,
        label: key,
        items: value,
        i: key,
        group: true,
      });
    }
  });
  return newGroup;
};

export const groupedYearItems = (yearItems) => {
  const returnItems = [];
  Object.keys(yearItems).forEach((key) => {
    const value = yearItems[key];
    const returnItemsItems = [];
    Object.keys(value).forEach((key2) => {
      const newItems2 = value[key2];
      Object.keys(newItems2.items).forEach((key4) => {
        const newItem = newItems2.items[key4];
        returnItemsItems.push(newItem);
      });
    });
    returnItems.push({
      date: key,
      label: key,
      items: returnItemsItems,
      i: key,
      group: true,
    });
  });
  return returnItems;
};

export const groupItemsByYears = (items, yearParam = 1850, modulus = 10) => {
  const initialVal = {
    date: yearParam,
    items: [],
  };
  const newItems = [initialVal];
  const { length } = items;
  for (let i = 0; i < length; i += 1) {
    const newItem = timelineItem(items[i], i);
    if (newItem !== null) {
      newItems.push(newItem);
    }
  }
  const grouped = newItems.reduce(reducer);
  const newGroup = [];
  Object.keys(grouped).forEach((key) => {
    const value = grouped[key];
    if (key !== 'endYear' && key !== 'startYear' && key !== 'item') {
      newGroup.push({ date: key, label: key, items: value });
    }
  });
  const yearItems = [];
  let year = yearParam;
  const { length: nLength } = newGroup;
  for (let i = 0; i < nLength; i += 1) {
    const newGroupItem = newGroup[i];
    if (Number(newGroupItem.date) % modulus === 0) {
      year = Number(newGroupItem.date);
      yearItems[year] = [];
    }
    if (typeof yearItems[year] === 'undefined') {
      yearItems[year] = [];
    }
    yearItems[year].push(newGroupItem);
  }
  const returnItems = groupedYearItems(yearItems);
  return returnItems;
};
