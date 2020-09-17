import React, {useState, useEffect, useRef, lazy, Suspense, useCallback} from 'react';
import {
  Card, CardBody,
  Spinner,
  Form, FormGroup,
  Collapse, Badge, Button
} from 'reactstrap';
import axios from 'axios';
import {Breadcrumbs} from '../../components/breadcrumbs';
import {Link} from 'react-router-dom';
import {getResourceThumbnailURL, updateDocumentTitle, outputDate, getClosestDate, renderLoader} from '../../helpers';
import HelpArticle from '../../components/help-article';
import LazyList from '../../components/lazylist';

import "react-datepicker/dist/react-datepicker.css";
const DatePicker = lazy(() => import("react-datepicker"));

const APIPath = process.env.REACT_APP_APIPATH;

const Timeline = props =>{
  const [loading, setLoading] = useState(true);
  const [item,setItem] = useState(null);
  const [items,setItems] = useState([]);
  const [itemsHTML,setItemsHTML] = useState([]);
  const [eventsContainerVisible,setEventsContainerVisible] = useState(false);
  const [eventsContainerTop,setEventsContainerTop] = useState(0);
  const [eventsContainerLeft,setEventsContainerLeft] = useState(0);
  const [eventsContainerWidth,setEventsContainerWidth] = useState(0);
  const [selectedItem,setSelectedItem] = useState(null);
  const [eventsHTML,setEventsHTML] = useState([]);
  const [eventsNum,setEventsNum] = useState(0);
  const [selectedEvent,setSelectedEvent] = useState(null);
  const [selectedEventVisible,setSelectedEventVisible] = useState(false);
  const timelineContainer = useRef(null);
  const [relatedVisible,setRelatedVisible] = useState({events:true,organisations:true,people:true,resources:true,classpieces:true});
  const [relatedOpen,setRelatedOpen] = useState({events:true,organisations:true,people:true,resources:true,classpieces:true});
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [startDate,setStartDate] = useState("");
  const zoomValues = ['100', '50', '10', 'year', 'day'];
  const zoomIndex = 4;
  const [zoomVal,setZoomVal] = useState(zoomIndex);
  const [zoom,setZoom] = useState(zoomValues[(zoomIndex-1)]);
  const [helpVisible, setHelpVisible] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);

  const initialData = (data) => {
    let initialVal = {
      startYear: 0,
      endYear: 0,
      item: null
    }
    let newItems = [initialVal];
    for (let i=0;i<data.length;i++) {
      let item = data[i];
      if (typeof item.startDate==="undefined" || item.startDate==="") {
        continue;
      }
      let startDate = item.startDate;
      let endDate = null;
      if (typeof item.endDate!=="undefined" && item.endDate!=="" && item.endDate!==item.startDate) {
        endDate = item.endDate;
      }
      let startDateArr = startDate.split("-");
      let endDateArr = [];
      if (endDate!==null) {
        endDate.split("-");
      }
      let startYear = startDateArr[2];
      let endYear = startDateArr[2];
      if (endDate!==null) {
        endYear = endDateArr[2];
      }
      let newItem = {
        startYear: startYear,
        endYear: endYear,
        item: item,
        i: i
      }
      newItems.push(newItem);
    }
    const reducer = (accumulator, item) => Object.assign(accumulator, { [item.startYear]:( accumulator[item.startYear] || [] ).concat(item) });
    let grouped = newItems.reduce(reducer);
    let newGroup = [];
    for (let key in grouped) {
      if (key!=="endYear" && key!=="startYear" && key!=="item") {
        newGroup.push({date: key, label: key, items:grouped[key], i:key, group: true})
      }
    }
    return newGroup;
  };

  const groupByDay = useCallback(() => {
    let newItems = items.map((item,i)=>{
      item.i = i;
      return item;
    });
    return newItems;
  },[items]);

  const groupByYear = useCallback(() => {
    let initialVal = {
      startYear: 0,
      endYear: 0,
      item: null
    }
    let newItems = [initialVal];
    for (let i=0;i<items.length;i++) {
      let item = items[i];
      if (typeof item.startDate==="undefined" || item.startDate==="") {
        continue;
      }
      let startDate = item.startDate;
      let endDate = null;
      if (typeof item.endDate!=="undefined" && item.endDate!=="" && item.endDate!==item.startDate) {
        endDate = item.endDate;
      }
      let startDateArr = startDate.split("-");
      let endDateArr = [];
      if (endDate!==null) {
        endDate.split("-");
      }
      let startYear = startDateArr[2];
      let endYear = startDateArr[2];
      if (endDate!==null) {
        endYear = endDateArr[2];
      }
      let newItem = {
        startYear: startYear,
        endYear: endYear,
        item: item,
        i: i
      }
      newItems.push(newItem);
    }
    const reducer = (accumulator, item) => Object.assign(accumulator, { [item.startYear]:( accumulator[item.startYear] || [] ).concat(item) });
    let grouped = newItems.reduce(reducer);
    let newGroup = [];
    for (let key in grouped) {
      if (key!=="endYear" && key!=="startYear" && key!=="item") {
        newGroup.push({date: key, label: key, items:grouped[key], i:key, group: true})
      }
    }
    return newGroup;
  },[items]);

  const groupBy10 = useCallback(() => {
    let initialVal = {
      date: 1850,
      items: []
    }
    let newItems = [initialVal];
    for (let i=0;i<items.length;i++) {
      let item = items[i];
      if (typeof item.startDate==="undefined" || item.startDate==="") {
        continue;
      }
      let startDate = item.startDate;
      let endDate = null;
      if (typeof item.endDate!=="undefined" && item.endDate!=="" && item.endDate!==item.startDate) {
        endDate = item.endDate;
      }
      let startDateArr = startDate.split("-");
      let endDateArr = [];
      if (endDate!==null) {
        endDate.split("-");
      }
      let startYear = startDateArr[2];
      let endYear = startDateArr[2];
      if (endDate!==null) {
        endYear = endDateArr[2];
      }
      let newItem = {
        startYear: startYear,
        endYear: endYear,
        item: item,
        i: i
      }
      newItems.push(newItem);
    }
    const reducer = (accumulator, item) => Object.assign(accumulator, { [item.startYear]:( accumulator[item.startYear] || [] ).concat(item) });
    let grouped = newItems.reduce(reducer);
    let newGroup = [];
    for (let key in grouped) {
      if (key!=="endYear" && key!=="startYear" && key!=="item") {
        newGroup.push({date: key, label: key, items:grouped[key]})
      }
    }
    let yearItems = [];
    let year = 1850;
    for (let i=0;i<newGroup.length; i++) {
      let item = newGroup[i];
      if (Number(item.date)%10===0) {
        year = Number(item.date);
        yearItems[year] = [];
      }
      if (typeof yearItems[year]==="undefined") {
        yearItems[year] = [];
      }
      yearItems[year].push(item);
    }
    let returnItems = [];
    for (let key in yearItems) {
      let returnItemsItems = [];
      for (let items in yearItems[key]) {
        for (let item in yearItems[key][items].items) {
          returnItemsItems.push(yearItems[key][items].items[item])
        }
      }
      returnItems.push({date: key, label: key, items: returnItemsItems, i:key, group: true});
    }
    return returnItems;
  },[items]);

  const groupBy50 = useCallback(() => {
    let initialVal = {
      date: 1850,
      items: []
    }
    let newItems = [initialVal];
    for (let i=0;i<items.length;i++) {
      let item = items[i];
      if (typeof item.startDate==="undefined" || item.startDate==="") {
        continue;
      }
      let startDate = item.startDate;
      let endDate = null;
      if (typeof item.endDate!=="undefined" && item.endDate!=="" && item.endDate!==item.startDate) {
        endDate = item.endDate;
      }
      let startDateArr = startDate.split("-");
      let endDateArr = [];
      if (endDate!==null) {
        endDate.split("-");
      }
      let startYear = startDateArr[2];
      let endYear = startDateArr[2];
      if (endDate!==null) {
        endYear = endDateArr[2];
      }
      let newItem = {
        startYear: startYear,
        endYear: endYear,
        item: item,
        i: i
      }
      newItems.push(newItem);
    }
    const reducer = (accumulator, item) => Object.assign(accumulator, { [item.startYear]:( accumulator[item.startYear] || [] ).concat(item) });
    let grouped = newItems.reduce(reducer);
    let newGroup = [];
    for (let key in grouped) {
      if (key!=="endYear" && key!=="startYear" && key!=="item") {
        newGroup.push({date: key, label: key, items:grouped[key]})
      }
    }
    let yearItems = [];
    let year = 1850;
    for (let i=0;i<newGroup.length; i++) {
      let item = newGroup[i];
      if (Number(item.date)%50===0) {
        year = Number(item.date);
        yearItems[year] = [];
      }
      if (typeof yearItems[year]==="undefined") {
        yearItems[year] = [];
      }
      yearItems[year].push(item);
    }
    let returnItems = [];
    for (let key in yearItems) {
      let returnItemsItems = [];
      for (let items in yearItems[key]) {
        for (let item in yearItems[key][items].items) {
          returnItemsItems.push(yearItems[key][items].items[item])
        }
      }
      returnItems.push({date: key, label: key, items: returnItemsItems, i:key, group: true});
    }
    return returnItems;
  },[items]);

  const groupBy100 = useCallback(() => {
    let initialVal = {
      date: 1800,
      items: []
    }
    let newItems = [initialVal];
    for (let i=0;i<items.length;i++) {
      let item = items[i];
      if (typeof item.startDate==="undefined" || item.startDate==="") {
        continue;
      }
      let startDate = item.startDate;
      let endDate = null;
      if (typeof item.endDate!=="undefined" && item.endDate!=="" && item.endDate!==item.startDate) {
        endDate = item.endDate;
      }
      let startDateArr = startDate.split("-");
      let endDateArr = [];
      if (endDate!==null) {
        endDate.split("-");
      }
      let startYear = startDateArr[2];
      let endYear = startDateArr[2];
      if (endDate!==null) {
        endYear = endDateArr[2];
      }
      let newItem = {
        startYear: startYear,
        endYear: endYear,
        item: item,
        i: i
      }
      newItems.push(newItem);
    }
    const reducer = (accumulator, item) => Object.assign(accumulator, { [item.startYear]:( accumulator[item.startYear] || [] ).concat(item) });
    let grouped = newItems.reduce(reducer);
    let newGroup = [];
    for (let key in grouped) {
      if (key!=="endYear" && key!=="startYear" && key!=="item") {
        newGroup.push({date: key, label: key, items:grouped[key]})
      }
    }
    let yearItems = [];
    let year = 1800;
    for (let i=0;i<newGroup.length; i++) {
      let item = newGroup[i];
      if (Number(item.date)%100===0) {
        year = Number(item.date);
        yearItems[year] = [];
      }
      if (typeof yearItems[year]==="undefined") {
        yearItems[year] = [];
      }
      yearItems[year].push(item);
    }
    let returnItems = [];
    for (let key in yearItems) {
      let returnItemsItems = [];
      for (let items in yearItems[key]) {
        for (let item in yearItems[key][items].items) {
          returnItemsItems.push(yearItems[key][items].items[item])
        }
      }
      returnItems.push({date: key, label: key, items: returnItemsItems, i:key, group: true});
    }
    return returnItems;
  },[items]);

  const renderTimelineItem = (item=null) => {
    if (item===null) {
      return null;
    }
    if (typeof item.group==="undefined" || !item.group) {
      return <div data-date={item.startDate} className="timeline-point" onClick={(e)=>showEvents(e, item)}>
          <label>{item.label} <small>[{item.events.length}]</small></label>
          <div className="triangle-up"></div>
          <div className="triangle-down"></div>
        </div>
    }
    else {
      let eventsLength = 0;
      if (typeof item.items!=="undefined") {
        for (let i=0;i<item.items.length; i++) {
          let child = item.items[i]
          eventsLength += child.item.events.length;
        }
      }
      let yearClass = "";
      if (Number(item.date)%10===0) {
        yearClass = " decade";
      }
      if (Number(item.date)%50===0) {
        yearClass = " fifty";
      }
      if (Number(item.date)%100===0) {
        yearClass = " century";
      }
      return <div data-date={item.date} className={"timeline-point"+yearClass} onClick={(e)=>showEventsGroup(e, item, eventsLength)}>
          <label>{item.date} <small>[{eventsLength}]</small></label>
          <div className="triangle-up"></div>
          <div className="triangle-down"></div>
        </div>
    }
  }

  useEffect(()=> {
    let url = null;
    let type = props.match.params.type;
    let params = {};
    if (type==="person") {
      url = `${APIPath}ui-person`;
      params = {_id:props.match.params._id};
    }
    if (type==="classpiece") {
      url = `${APIPath}classpiece`;
      params = {_id:props.match.params._id};
    }
    if (type==="resource") {
      url = `${APIPath}resource`;
      params = {_id:props.match.params._id};
    }
    if (type==="event") {
      url = `${APIPath}ui-event`;
      params = {_id:props.match.params._id};
    }
    if (type==="organisation") {
      url = `${APIPath}ui-organisation`;
      params = {_id:props.match.params._id};
    }
    if (url===null) {
      return ;
    }
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: url,
        crossDomain: true,
        params: params
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      let respData = responseData.data;
      setItem(respData);
      let eventsData = await axios({
        method: 'get',
        url: `${APIPath}item-timeline`,
        crossDomain: true,
        params: params
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      let evtData = eventsData.data;
      setItems(evtData);
      let newData = initialData(evtData);
      setItemsHTML(newData);
    }
    if (loading) {
      load();
    }
    return () => {
      return false;
    }
  },[loading, props.match.params]);

  useEffect(()=>{
    var resizeTimer;
    const resize = () => {
      if (!eventsContainerVisible) {
        return false;
      }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        let container = timelineContainer.current;
        let containerBbox = container.getBoundingClientRect();
        let elemWidth = containerBbox.width-eventsContainerLeft;
        setEventsContainerWidth(elemWidth);
      },250);
    }
    window.addEventListener("resize", resize);
    return(()=>{
      window.removeEventListener("resize", resize);
    })
  })

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  }

  const loadEvent = async(_id) => {
    let responseData = await axios({
      method: 'get',
      url: APIPath+'ui-event',
      crossDomain: true,
      params: {_id:_id}
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    setSelectedEvent(responseData.data);
    toggleSelectedEvent(true);
    let visible = {events:false,organisations:false,people:false,resources:false};
    if (responseData.data.events.length>0) {
      visible.events = true;
    }
    if (responseData.data.organisations.length>0) {
      visible.organisations = true;
    }
    if (responseData.data.people.length>0) {
      visible.people = true;
    }
    if (responseData.data.resources.length>0) {
      visible.resources = true;
    }
    if (responseData.data.classpieces.length>0) {
      visible.classpieces = true;
    }
    setRelatedVisible(visible);
  }

  const showEvents = (e, item) => {
    let itemsNum = item.events.length;
    setEventsNum(itemsNum);
    if (itemsNum>9) {
      itemsNum = 9;
    }
    let bboxHeight = itemsNum*30;
    let container = timelineContainer.current;
    let containerBbox = container.getBoundingClientRect();
    let elem = e.target;
    if (!elem.classList.contains("timeline-point")) {
      elem = e.target.parentElement;
    }
    let bbox = elem.getBoundingClientRect();
    let elemLeft = bbox.x-containerBbox.x+bbox.width+30;
    let elemTop = bbox.y-containerBbox.y;
    if (elemTop+bboxHeight>500) {
      let diff = (elemTop+bboxHeight)-500;
      elemTop -= diff;
    }
    let elemWidth = containerBbox.width-elemLeft;
    toggleEventsContainer(true);
    setSelectedItem(item);
    setEventsContainerLeft(elemLeft);
    setEventsContainerTop(elemTop);
    setEventsContainerWidth(elemWidth);
    setSelectedEventVisible(false);
    setRelatedVisible({events:true,organisations:true,people:true,resources:true})
    setRelatedOpen({events:true,organisations:true,people:true,resources:true})
    let newEventsHTML = [];
    for (let i=0;i<item.events.length; i++) {
      let newItem = item.events[i];
      let dateLabel = outputDate(item.startDate);
      if (typeof item.endDate!=="undefined" && item.endDate!=="" && item.endDate!==item.startDate) {
        dateLabel += " - "+outputDate(item.endDate);
      }
      newItem.i = i;
      newItem.dateLabel = dateLabel;
      newEventsHTML.push(newItem);
    }
    setEventsHTML(newEventsHTML);
  }

  const renderEventHTML = (item) => {
    return <div className="timeline-event-item" key={item.i} onClick={()=>loadEvent(item._id)}>{item.label}  <small>[{item.dateLabel}]</small></div>
  }

  const showEventsGroup = (e, item, itemsNum) => {
    setEventsNum(itemsNum);
    if (itemsNum>9) {
      itemsNum = 9;
    }
    let bboxHeight = itemsNum*30;
    let container = timelineContainer.current;
    let containerBbox = container.getBoundingClientRect();
    let elem = e.target;
    if (!elem.classList.contains("timeline-point")) {
      elem = e.target.parentElement;
    }
    let bbox = elem.getBoundingClientRect();
    let elemLeft = bbox.x-containerBbox.x+bbox.width+30;
    let elemTop = bbox.y-containerBbox.y;
    if (elemTop+bboxHeight>500) {
      let diff = (elemTop+bboxHeight)-500;
      elemTop -= diff;
    }
    let elemWidth = containerBbox.width-elemLeft;
    toggleEventsContainer(true);
    setSelectedItem(item);
    setEventsContainerLeft(elemLeft);
    setEventsContainerTop(elemTop);
    setEventsContainerWidth(elemWidth);
    setSelectedEventVisible(false);
    setRelatedVisible({events:true,organisations:true,people:true,resources:true})
    setRelatedOpen({events:true,organisations:true,people:true,resources:true})
    let newEventsHTML = [];
    for (let j=0;j<item.items.length;j++) {
      let newItem = item.items[j].item;
      let events = newItem.events;
      let dateLabel = outputDate(newItem.startDate);
      if (typeof newItem.endDate!=="undefined" && newItem.endDate!=="" && newItem.endDate!==newItem.startDate) {
        dateLabel += " - "+outputDate(newItem.endDate);
      }
      for (let i=0;i<events.length; i++) {
        let newEvent = events[i];
        newEvent.i = `${j}-${i}`;
        newEvent.dateLabel = dateLabel;
        newEventsHTML.push(newEvent);
      }
    }

    setEventsHTML(newEventsHTML);
  }

  const toggleRelatedOpen = (name) => {
    let value = !relatedOpen[name];
    let relatedOpenCopy = Object.assign({},relatedOpen);
    relatedOpenCopy[name]=value;
    setRelatedOpen(relatedOpenCopy);
  }

  const toggleEventsContainer = (val=null) => {
    let visible = val || !eventsContainerVisible;
    setEventsContainerVisible(visible);
  }

  const toggleSelectedEvent = (val=null) => {
    let visible = val || !selectedEventVisible;
    setSelectedEventVisible(visible);
  }

  const searchDate = async(e)=>{
    e.preventDefault();
    if (startDate==="") {
      return false;
    }
    let newStartDate = startDate;
    if(newStartDate!==""){
      newStartDate = new Intl.DateTimeFormat('en-GB').format(startDate);
    }
    let compareDates = [];
    if (zoom==="day") {
     compareDates = itemsHTML.map(i=>i.startDate);
    }
    else {
      compareDates = itemsHTML.map(i=>`01-01-${i.date}`);
    }
    let closestDate = getClosestDate(newStartDate,compareDates);
    let newIndex = compareDates.indexOf(closestDate);
    setScrollIndex(newIndex);

    // highlight found dom element
    setTimeout(()=>{
      let elem = document.querySelectorAll(`*[data-lazylist-index="${newIndex}"]`);
      if (typeof elem[0]!=="undefined") {
        elem[0].classList.add("found");
        setTimeout(()=>{
          elem[0].classList.remove("found");
        },3000);
      }
    },500);
  }

  const updateZoom = (val=null) => {
    if (val===null) {
      return false;
    }
    let newVal;
    if (val==="+") {
      newVal = zoomVal+1;
    }
    if (val==="-") {
      newVal = zoomVal-1;
    }
    let newIndex = newVal-1;
    if (newIndex<0 || newVal>zoomValues.length) {
      return false;
    }
    let newZoom = zoomValues[newIndex];
    setZoomVal(newVal);
    setZoom(newZoom);
    let newItems = [];
    if (newZoom==='day') {
      newItems = groupByDay(items);
    }
    if (newZoom==='year') {
      newItems = groupByYear();
    }
    if (newZoom==='10') {
      newItems = groupBy10();
    }
    if (newZoom==='50') {
      newItems = groupBy50();
    }
    if (newZoom==='100') {
      newItems = groupBy100();
    }
    setItemsHTML(newItems);
  }

  const toggleHelp = () => {
    setHelpVisible(!helpVisible)
  }

  let heading = "";
  let pageType = props.match.params.type;
  let breadcrumbsItems = [];
  let breadcrumbsParent = {};
  if (pageType==="classpiece") {
    breadcrumbsParent = {label: "Classpieces", icon: "pe-7s-photo", active: false, path: "/classpieces"};
  }
  if (pageType==="event") {
    breadcrumbsParent = {label: "Events", icon: "pe-7s-date", active: false, path: "/events"};
  }
  if (pageType==="organisation") {
    breadcrumbsParent = {label: "Organisations", icon: "pe-7s-culture", active: false, path: "/organisations"};
  }
  if (pageType==="person") {
    breadcrumbsParent = {label: "People", icon: "pe-7s-users", active: false, path: "/people"};
  }
  if (pageType==="resource") {
    breadcrumbsParent = {label: "Resources", icon: "pe-7s-photo", active: false, path: "/resources"};
  }
  breadcrumbsItems.push(breadcrumbsParent);
  if (!loading && item!==null) {
    let label = item.label;
    if (pageType==="classpiece") {
      breadcrumbsItems.push(
        {label: label, icon: "pe-7s-photo", active: false, path: `/classpiece/${props.match.params._id}`},
        {label: "Timeline", icon: "pe-7s-hourglass", active: true, path: ""});
    }
    if (pageType==="event") {
      breadcrumbsItems.push(
        {label: label, icon: "pe-7s-date", active: false, path: `/event/${props.match.params._id}`},
        {label: "Timeline", icon: "pe-7s-hourglass", active: true, path: ""});
    }
    if (pageType==="organisation") {
      breadcrumbsItems.push(
        {label: label, icon: "pe-7s-culture", active: false, path: `/organisation/${props.match.params._id}`},
        {label: "Timeline", icon: "pe-7s-hourglass", active: true, path: ""});
    }
    if (pageType==="person") {
      label = item.firstName;
      if (typeof item.middleName!=="undefined" && item.middleName!==null && item.middleName!=="") {
        label += " "+item.middleName;
      }
      label += " "+item.lastName;
      breadcrumbsItems.push(
        {label: label, icon: "pe-7s-user", active: false, path: `/person/${props.match.params._id}`},
        {label: "Timeline", icon: "pe-7s-hourglass", active: true, path: ""});
    }
    if (pageType==="resource") {
      breadcrumbsItems.push(
        {label: label, icon: "pe-7s-photo", active: false, path: `/resource/${props.match.params._id}`},
        {label: "Timeline", icon: "pe-7s-hourglass", active: true, path: ""});
    }
    let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
    updateDocumentTitle(documentTitle);
    heading = `${label} Timeline`;
  }

  let content = <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  if (!loading && itemsHTML.length>0) {
    let ecstyle = {
      left: eventsContainerLeft,
      top: eventsContainerTop,
      width: eventsContainerWidth
    }
    let echidden = " hidden";
    if (eventsContainerVisible) {
      echidden = "";
    }
    let eventsContainerHeading = "";
    if (selectedItem!==null) {
      eventsContainerHeading = <div>{selectedItem.label} <small>[{eventsNum}]</small></div>;
    }
    let eventsListVisible = "";
    let eventDetailsVisible = " hidden";
    if (selectedEventVisible) {
      eventsListVisible=" hidden";
      eventDetailsVisible="";
    }
    let selectedEventLabel = "";
    if (selectedEvent!==null) {
      let selectedEventDateLabel = "";
      let selectedEventDate = "";
      if (typeof selectedEvent.temporal!=="undefined" && selectedEvent.temporal.length>0) {
        let selectedEventTemporal = selectedEvent.temporal[0].ref;
        selectedEventDateLabel = outputDate(selectedEventTemporal.startDate);
        if (typeof selectedEventTemporal.endDate!=="undefined" &&selectedEventTemporal.endDate!=="" && selectedEventTemporal.endDate!==selectedEventTemporal.startDate) {
          selectedEventDateLabel += " - "+outputDate(selectedEventTemporal.endDate);
        }
        selectedEventDate =  <small key="date"> [{selectedEventDateLabel}]</small>;
      }
      selectedEventLabel = [<span key="label">{selectedEvent.label}</span>,selectedEventDate];
    }

    let relatedEvents = [], relatedEventsOpen = "", relatedEventsVisible = "hidden";
    let relatedOrganisations = [], relatedOrganisationsOpen = "", relatedOrganisationsVisible = "hidden";
    let relatedPeople = [], relatedPeopleOpen = "", relatedPeopleVisible = "hidden";
    let relatedResources = [], relatedResourcesOpen = "", relatedResourcesVisible = "hidden";
    let relatedClasspieces = [], relatedClasspiecesOpen = "", relatedClasspiecesVisible = "hidden";
    if (selectedEvent!==null && selectedEvent.events.length>0 && relatedVisible.events) {
      relatedEventsOpen = " active";
      relatedEventsVisible = "";
      relatedEvents = selectedEvent.events.map((e,i)=>{
        return <Link href={`/event/${e.ref._id}`} to={`/event/${e.ref._id}`} key={i}>
          <Badge className="related-event badge-event" color="warning">{e.ref.label}</Badge>
        </Link>
      });
    }
    if (selectedEvent!==null && selectedEvent.organisations.length>0 && relatedVisible.organisations) {
      relatedOrganisationsVisible = "";
      relatedOrganisations = selectedEvent.organisations.map((e,i)=>{
        return <Link href={`/organisation/${e.ref._id}`} to={`/organisation/${e.ref._id}`} key={i}>
          <Badge className="related-organisation badge-organisation">{e.ref.label}</Badge>
        </Link>
      });
    }
    if (selectedEvent!==null && selectedEvent.people.length>0 && relatedVisible.people) {
      relatedPeopleVisible = "";
      relatedPeople = selectedEvent.people.map((e,i)=>{
        return <Link href={`/person/${e.ref._id}`} to={`/person/${e.ref._id}`} key={i}>
          <Badge className="related-person">{e.ref.label}</Badge>
        </Link>
      });

    }
    if (selectedEvent!==null && selectedEvent.resources.length>0 && relatedVisible.resources) {
      relatedResourcesVisible = "";
      relatedResources = selectedEvent.resources.map((e,i)=>{
        let thumbnailPath = getResourceThumbnailURL(e.ref);
        let thumbnailImage = [];
        if (thumbnailPath!==null) {
          thumbnailImage = <img src={thumbnailPath} alt={e.ref.label} />
        }
        return <Link href={`/resource/${e.ref._id}`} to={`/resource/${e.ref._id}`} key={i}>
          <Badge className="related-resource badge-resource">{thumbnailImage}{e.ref.label}</Badge>
        </Link>
      });
    }
    if (selectedEvent!==null && selectedEvent.classpieces.length>0 && relatedVisible.classpieces) {
      relatedClasspiecesVisible = "";
      relatedClasspieces = selectedEvent.classpieces.map((e,i)=>{
        let thumbnailPath = getResourceThumbnailURL(e.ref);
        let thumbnailImage = [];
        if (thumbnailPath!==null) {
          thumbnailImage = <img src={thumbnailPath} alt={e.ref.label} />
        }
        return <Link href={`/classpiece/${e.ref._id}`} to={`/classpiece/${e.ref._id}`} key={i}>
          <Badge className="related-classpiece badge-resource">{thumbnailImage}{e.ref.label}</Badge>
        </Link>
      });
    }
    if (relatedOpen.events) {
      relatedEventsOpen = " active";
    }
    if (relatedOpen.organisations) {
      relatedOrganisationsOpen = " active";
    }
    if (relatedOpen.people) {
      relatedPeopleOpen = " active";
    }
    if (relatedOpen.resources) {
      relatedResourcesOpen = " active";
    }
    if (relatedOpen.classpieces) {
      relatedClasspiecesOpen = " active";
    }
    let description = [];
    if (selectedEvent!==null && selectedEvent.description!=="") {
      description = selectedEvent.description;
    }


    let eventsContainer = <div className={"timeline-events-container"+echidden} style={ecstyle}>
      <div className="heading">
        <h4>{eventsContainerHeading}</h4>
      </div>
      <div className="graph-details-card-close" onClick={()=>toggleEventsContainer()}>
        <i className="fa fa-times" />
      </div>
      <LazyList
        limit={20}
        range={5}
        items={eventsHTML}
        renderItem={renderEventHTML}
        containerClass={`events-list-container ${eventsListVisible}`}
        />
      <div className={"event-details"+eventDetailsVisible}>
        <h4>
          <div className="event-details-back">
            <i className="fa fa-chevron-left" onClick={()=>toggleSelectedEvent()} />
          </div>
          <span>{selectedEventLabel}</span>
        </h4>
        <div className="event-details-body">
          <div className="event-details-description">{description}</div>
          <div className={`event-details-related ${relatedEventsVisible}`}>
            <div className={`toggle-event-details-related ${relatedEventsOpen}`} onClick={()=>toggleRelatedOpen("events")}>Events <small>[{relatedEvents.length}]</small>: <i className="fa fa-angle-down" /></div>
            <Collapse isOpen={relatedOpen.events}>{relatedEvents}</Collapse>
          </div>
          <div className={`event-details-related ${relatedOrganisationsVisible}`}>
            <div className={`toggle-event-details-related ${relatedOrganisationsOpen}`} onClick={()=>toggleRelatedOpen("organisations")}>Organisations <small>[{relatedOrganisations.length}]</small>: <i className="fa fa-angle-down" /></div>
            <Collapse isOpen={relatedOpen.organisations}>{relatedOrganisations}</Collapse>
          </div>
          <div className={`event-details-related ${relatedPeopleVisible}`}>
            <div className={`toggle-event-details-related ${relatedPeopleOpen}`} onClick={()=>toggleRelatedOpen("people")}>People <small>[{relatedPeople.length}]</small>: <i className="fa fa-angle-down" /></div>
            <Collapse isOpen={relatedOpen.people}>{relatedPeople}</Collapse>
          </div>
          <div className={`event-details-related ${relatedResourcesVisible}`}>
            <div className={`toggle-event-details-related ${relatedResourcesOpen}`} onClick={()=>toggleRelatedOpen("resources")}>Resources <small>[{relatedResources.length}]</small>: <i className="fa fa-angle-down" /></div>
            <Collapse isOpen={relatedOpen.resources}>{relatedResources}</Collapse>
          </div>
          <div className={`event-details-related ${relatedClasspiecesVisible}`}>
            <div className={`toggle-event-details-related ${relatedClasspiecesOpen}`} onClick={()=>toggleRelatedOpen("classpieces")}>Classpieces <small>[{relatedClasspieces.length}]</small>: <i className="fa fa-angle-down" /></div>
            <Collapse isOpen={relatedOpen.classpieces}>{relatedClasspieces}</Collapse>
          </div>
        </div>
      </div>
    </div>

    const searchIcon = <div className="graph-search-toggle events-timeline" onClick={()=>toggleSearchContainerVisible()}>
      <i className="fa fa-search" />
    </div>

    const helpIcon = <div className="graph-help-toggle events-timeline" onClick={()=>toggleHelp()} title="Help">
      <i className="fa fa-question-circle" />
    </div>

    let scVisibleClass = " hidden";
    if (searchContainerVisible) {
      scVisibleClass = "";
    }
    const searchContainer = <div className={`events-timeline-search-container${scVisibleClass}`}>
      <div className="graph-details-card-close" onClick={()=>toggleSearchContainerVisible()}>
        <i className="fa fa-times" />
      </div>
      <Form onSubmit={(e)=>searchDate(e)}>
        <FormGroup>
          <label>Search for date</label>
          <Suspense fallback={renderLoader()}>
            <DatePicker
              placeholderText="dd/mm/yyyy"
              selected={startDate}
              onChange={(val)=>setStartDate(val)}
              dateFormat="dd/MM/yyyy"
              showMonthDropdown
              showYearDropdown
              />
          </Suspense>
        </FormGroup>
        <Button size="sm" outline>Submit</Button>
      </Form>
    </div>

    const zoomPanel = <div className="zoom-panel events-timeline">
      <div className="zoom-action" onClick={()=>updateZoom("+")}>
        <i className="fa fa-plus" />
      </div>
      <div className="zoom-action" onClick={()=>updateZoom("-")}>
        <i className="fa fa-minus" />
      </div>
    </div>

    content = <div className="row">
      <div className="col-12">
        <Card className="timeline-card">
          <CardBody>
            <div className="timeline-container" ref={timelineContainer}>
              <LazyList
                limit={50}
                range={25}
                items={itemsHTML}
                renderItem={renderTimelineItem}
                scrollIndex={scrollIndex}
                />
              {zoomPanel}
              {searchIcon}
              {helpIcon}
              {searchContainer}
              {eventsContainer}
            </div>
          </CardBody>
        </Card>
      </div>
      <HelpArticle permalink={"timeline-help"} visible={helpVisible} toggle={toggleHelp}/>
    </div>
  }
  return (
    <div className="container">
      <Breadcrumbs items={breadcrumbsItems} />
      <h3>{heading}</h3>
      {content}
    </div>
  )
}

export default Timeline;
