import React, {useState, useEffect, useRef, lazy, Suspense} from 'react';
import {
  Card, CardBody,
  Spinner,
  Form, FormGroup,
  Collapse, Badge, Button
} from 'reactstrap';
import axios from 'axios';
import {Breadcrumbs} from '../../components/breadcrumbs';
import moment from "moment";
import {Link} from 'react-router-dom';
import {getResourceThumbnailURL, updateDocumentTitle, outputDate, renderLoader} from '../../helpers';
import "react-datepicker/dist/react-datepicker.css";
import HelpArticle from '../../components/help-article';

const DatePicker = lazy(() => import("react-datepicker"));

const APIPath = process.env.REACT_APP_APIPATH;

const Timeline = props =>{
  const [loading, setLoading] = useState(true);
  const [items,setItems] = useState([]);
  const [eventsContainerVisible,setEventsContainerVisible] = useState(false);
  const [eventsContainerTop,setEventsContainerTop] = useState(0);
  const [eventsContainerLeft,setEventsContainerLeft] = useState(0);
  const [eventsContainerWidth,setEventsContainerWidth] = useState(0);
  const [selectedItem,setSelectedItem] = useState(null);
  const [eventsHTML,setEventsHTML] = useState([]);
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

  const groupByDay = (data) => {
    let itemsHTML = [];
    for (let i=0;i<data.length; i++) {
      let item = items[i];
      itemsHTML.push(
        <li key={i} data-date={item.startDate}>
          <div className="timeline-point" onClick={(e)=>showEvents(e, item)}>
            <label>{item.label} <small>[{item.events.length}]</small></label>
            <div className="triangle-up"></div>
            <div className="triangle-down"></div>
          </div>
        </li>
      )
    }
    return itemsHTML;
  }

  const groupByYear = (data) => {
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
        item: item
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
    let itemsHTML = groupItemsHTML(newGroup);
    return itemsHTML;
  }

  const groupBy10 = (data) => {
    let initialVal = {
      date: 1850,
      items: []
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
        item: item
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
      returnItems.push({date: key, label: key, items: returnItemsItems});
    }
    let itemsHTML = groupItemsHTML(returnItems);
    return itemsHTML;
  }

  const groupBy50 = (data) => {
    let initialVal = {
      date: 1850,
      items: []
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
        item: item
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
      returnItems.push({date: key, label: key, items: returnItemsItems});
    }
    let itemsHTML = groupItemsHTML(returnItems);
    return itemsHTML;
  }

  const groupBy100 = (data) => {
    let initialVal = {
      date: 1800,
      items: []
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
        item: item
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
      returnItems.push({date: key, label: key, items: returnItemsItems});
    }
    let itemsHTML = groupItemsHTML(returnItems);
    return itemsHTML;
  }

  const groupItemsHTML = (newGroup) => {
    let itemsHTML = [];
    for (let i=0;i<newGroup.length; i++) {
      let item = newGroup[i];
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
      itemsHTML.push(
        <li key={i} data-date={item.date}>
          <div className={"timeline-point"+yearClass} onClick={(e)=>showEventsGroup(e, item)}>
            <label>{item.date} <small>[{item.items.length}]</small></label>
            <div className="triangle-up"></div>
            <div className="triangle-down"></div>
          </div>
        </li>
      )
    }
    return itemsHTML;
  }

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'timeline',
        crossDomain: true,
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      setItems(responseData.data);
    }
    if (loading) {
      load();
    }
  },[loading]);

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
    let visible = {events:true,organisations:true,people:true,resources:true};
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
    let container = timelineContainer.current;
    let containerBbox = container.getBoundingClientRect();
    let elem = e.target;
    if (!elem.classList.contains("timeline-point")) {
      elem = e.target.parentElement;
    }
    let bbox = elem.getBoundingClientRect();
    let elemLeft = bbox.x-containerBbox.x+bbox.width+30;
    let elemTop = bbox.y-containerBbox.y;
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
      let dateLabel = outputDate(newItem.startDate);
      if (typeof newItem.endDate!=="undefined" && newItem.endDate!=="" && newItem.endDate!==newItem.startDate) {
        dateLabel += " - "+outputDate(newItem.endDate);
      }
      newEventsHTML.push(<div className="timeline-event-item" key={i} onClick={()=>loadEvent(newItem._id)}>{newItem.label}  <small>[{dateLabel}]</small></div>);
    }
    setEventsHTML(newEventsHTML);
  }

  const showEventsGroup = (e, item) => {
    let container = timelineContainer.current;
    let containerBbox = container.getBoundingClientRect();
    let elem = e.target;
    if (!elem.classList.contains("timeline-point")) {
      elem = e.target.parentElement;
    }
    let bbox = elem.getBoundingClientRect();
    let elemLeft = bbox.x-containerBbox.x+bbox.width+30;
    let elemTop = bbox.y-containerBbox.y;
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
        let event = events[i];
        newEventsHTML.push(<div className="timeline-event-item" key={j+"-"+i} onClick={()=>loadEvent(event._id)}>{event.label} <small>[{dateLabel}]</small></div>);
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
    let item;
    let elem;
    if (zoom==="day") {
      newStartDate = newStartDate.replace(/\//g,"-");
      item = items.find(i=>moment(i.startDate, "DD-MM-YYYY").valueOf()>=moment(newStartDate, "DD-MM-YYYY").valueOf());
      elem = document.querySelectorAll(`[data-date='${item.startDate}']`);
    }
    else {
      newStartDate = newStartDate.replace(/\//g,"-");
      item = items.find(i=>moment(i.startDate, "DD-MM-YYYY").valueOf()>=moment(newStartDate, "DD-MM-YYYY").valueOf());
      newStartDate = newStartDate.split("-")[2];
      elem = document.querySelectorAll(`[data-date='${newStartDate}']`);
    }
    if (typeof item==="undefined") {
      return false;
    }
    if (typeof elem[0]!=="undefined") {
      let newPosition = elem[0].offsetTop-50;
      timelineContainer.current.scrollTo({top: newPosition, behavior: 'smooth'});
      elem[0].classList.add("found");
      setTimeout(()=>{
        elem[0].classList.remove("found");
      },3000);
    }
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
    setZoomVal(newVal);
    setZoom(zoomValues[newIndex]);
  }

  const toggleHelp = () => {
    setHelpVisible(!helpVisible)
  }

  let heading = "Events timeline";
  let breadcrumbsItems = [
    {label: heading, icon: "pe-7s-hourglass", active: true, path: ""}
  ];
  updateDocumentTitle(heading);
  let content = <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  if (!loading && items.length>0) {
    let itemsHTML = [];
    if (zoom==='day') {
      itemsHTML = groupByDay(items);
    }
    if (zoom==='year') {
      itemsHTML = groupByYear(items);
    }
    if (zoom==='10') {
      itemsHTML = groupBy10(items);
    }
    if (zoom==='50') {
      itemsHTML = groupBy50(items);
    }
    if (zoom==='100') {
      itemsHTML = groupBy100(items);
    }

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
      let count = 0;
      if (typeof selectedItem.items!=="undefined") {
        count = selectedItem.items.length;
      }
      if (typeof selectedItem.events!=="undefined") {
        count = selectedItem.events.length;
      }
      eventsContainerHeading = <div>{selectedItem.label} <small>[{count}]</small></div>;
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
        if (typeof selectedEventTemporal.endDate!=="undefined" && selectedEventTemporal.endDate!=="" && selectedEventTemporal.endDate!==selectedEventTemporal.startDate) {
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
      <div className={`events-list-container ${eventsListVisible}`}>
        {eventsHTML}
      </div>
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
              <ul>
                {itemsHTML}
              </ul>
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
