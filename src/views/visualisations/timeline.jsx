import React, {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  useCallback,
} from 'react';
import {
  Card,
  CardBody,
  Spinner,
  Form,
  FormGroup,
  Collapse,
  Badge,
  Button,
  Label,
} from 'reactstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  getResourceThumbnailURL,
  updateDocumentTitle,
  outputDate,
  getClosestDate,
  renderLoader,
} from '../../helpers';
import 'react-datepicker/dist/react-datepicker.css';
import HelpArticle from '../../components/help-article';
import LazyList from '../../components/lazylist';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));
const DatePicker = lazy(() => import('react-datepicker'));

const APIPath = process.env.REACT_APP_APIPATH;

const timelineItem = (data, i) => {
  let returnItem = null;
  if (typeof data.startDate !== 'undefined' && data.startDate !== '') {
    const { startDate: newStartDate } = data;
    let endDate = null;
    if (
      typeof data.endDate !== 'undefined' &&
      data.endDate !== '' &&
      data.endDate !== data.startDate
    ) {
      endDate = data.endDate;
    }
    const startDateArr = newStartDate.split('-');
    const endDateArr = [];
    if (endDate !== null) {
      endDate.split('-');
    }
    const startYear = startDateArr[2];
    let endYear = startDateArr[2];
    const endDatev = endDateArr[2];
    if (endDate !== null) {
      endYear = endDatev;
    }
    const newItem = {
      startYear,
      endYear,
      item: data,
      i,
    };
    returnItem = newItem;
  }
  return returnItem;
};

const reducer = (accumulator, itemParam) =>
  Object.assign(accumulator, {
    [itemParam.startYear]: (accumulator[itemParam.startYear] || []).concat(
      itemParam
    ),
  });

const initialData = (data) => {
  const initialVal = {
    startYear: 0,
    endYear: 0,
    item: null,
  };
  const newItems = [initialVal];
  for (let i = 0; i < data.length; i += 1) {
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

const groupItemsByYear = (items) => {
  const initialVal = {
    startYear: 0,
    endYear: 0,
    item: null,
  };
  const newItems = [initialVal];
  for (let i = 0; i < items.length; i += 1) {
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

const groupedYearItems = (yearItems) => {
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

const groupItemsByYears = (items, yearParam = 1850, modulus = 10) => {
  const initialVal = {
    date: yearParam,
    items: [],
  };
  const newItems = [initialVal];
  for (let i = 0; i < items.length; i += 1) {
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
  for (let i = 0; i < newGroup.length; i += 1) {
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

const Timeline = () => {
  // state
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [itemsHTML, setItemsHTML] = useState([]);
  const [eventsContainerVisible, setEventsContainerVisible] = useState(false);
  const [eventsContainerTop, setEventsContainerTop] = useState(0);
  const [eventsContainerLeft, setEventsContainerLeft] = useState(0);
  const [eventsContainerWidth, setEventsContainerWidth] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [eventsHTML, setEventsHTML] = useState([]);
  const [eventsNum, setEventsNum] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventVisible, setSelectedEventVisible] = useState(false);
  const timelineContainer = useRef(null);
  const [relatedVisible, setRelatedVisible] = useState({
    events: true,
    organisations: true,
    people: true,
    resources: true,
    classpieces: true,
  });
  const [relatedOpen, setRelatedOpen] = useState({
    events: true,
    organisations: true,
    people: true,
    resources: true,
    classpieces: true,
  });
  const [searchContainerVisible, setSearchContainerVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const zoomValues = ['100', '50', '10', 'year', 'day'];
  const zoomIndex = 4;
  const [zoomVal, setZoomVal] = useState(zoomIndex);
  const [zoom, setZoom] = useState(zoomValues[zoomIndex - 1]);
  const [helpVisible, setHelpVisible] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [viewEventId, setViewEventId] = useState(null);

  const groupByDay = useCallback(() => {
    const newItems = items.map((itemParam, i) => {
      const copy = itemParam;
      copy.i = i;
      return copy;
    });
    return newItems;
  }, [items]);

  const groupByYear = useCallback(() => groupItemsByYear(items), [items]);

  const groupBy10 = useCallback(
    () => groupItemsByYears(items, 1850, 10),
    [items]
  );

  const groupBy50 = useCallback(
    () => groupItemsByYears(items, 1850, 50),
    [items]
  );

  const groupBy100 = useCallback(
    () => groupItemsByYears(items, 1800, 100),
    [items]
  );

  const toggleEventsContainer = (val = null) => {
    const visible = val || !eventsContainerVisible;
    setEventsContainerVisible(visible);
  };

  const showEvents = (e, item) => {
    let itemsNum = item.events.length;
    setEventsNum(itemsNum);
    if (itemsNum > 9) {
      itemsNum = 9;
    }
    const bboxHeight = itemsNum * 30;
    const container = timelineContainer.current;
    const containerBbox = container.getBoundingClientRect();
    let elem = e.target;
    if (!elem.classList.contains('timeline-point')) {
      elem = e.target.parentElement;
    }
    const bbox = elem.getBoundingClientRect();
    const elemLeft = bbox.x - containerBbox.x + bbox.width + 30;
    let elemTop = bbox.y - containerBbox.y;
    if (elemTop + bboxHeight > 500) {
      const diff = elemTop + bboxHeight - 500;
      elemTop -= diff;
    }
    const elemWidth = containerBbox.width - elemLeft;
    toggleEventsContainer(true);
    setSelectedItem(item);
    setEventsContainerLeft(elemLeft);
    setEventsContainerTop(elemTop);
    setEventsContainerWidth(elemWidth);
    setSelectedEventVisible(false);
    setRelatedVisible({
      events: true,
      organisations: true,
      people: true,
      resources: true,
    });
    setRelatedOpen({
      events: true,
      organisations: true,
      people: true,
      resources: true,
    });
    const newEventsHTML = [];
    for (let i = 0; i < item.events.length; i += 1) {
      const newItem = item.events[i];
      let dateLabel = outputDate(item.startDate);
      if (
        typeof item.endDate !== 'undefined' &&
        item.endDate !== '' &&
        item.endDate !== item.startDate
      ) {
        dateLabel += ` - ${outputDate(item.endDate)}`;
      }
      newItem.i = i;
      newItem.dateLabel = dateLabel;
      newEventsHTML.push(newItem);
    }
    setEventsHTML(newEventsHTML);
  };

  const showEventsGroup = (e, item, itemsNumParam) => {
    let itemsNum = itemsNumParam;
    setEventsNum(itemsNum);
    if (itemsNum > 9) {
      itemsNum = 9;
    }
    const bboxHeight = itemsNum * 30;
    const container = timelineContainer.current;
    const containerBbox = container.getBoundingClientRect();
    let elem = e.target;
    if (!elem.classList.contains('timeline-point')) {
      elem = e.target.parentElement;
    }
    const bbox = elem.getBoundingClientRect();
    const elemLeft = bbox.x - containerBbox.x + bbox.width + 30;
    let elemTop = bbox.y - containerBbox.y;
    if (elemTop + bboxHeight > 500) {
      const diff = elemTop + bboxHeight - 500;
      elemTop -= diff;
    }
    const elemWidth = containerBbox.width - elemLeft;
    toggleEventsContainer(true);
    setSelectedItem(item);
    setEventsContainerLeft(elemLeft);
    setEventsContainerTop(elemTop);
    setEventsContainerWidth(elemWidth);
    setSelectedEventVisible(false);
    setRelatedVisible({
      events: true,
      organisations: true,
      people: true,
      resources: true,
    });
    setRelatedOpen({
      events: true,
      organisations: true,
      people: true,
      resources: true,
    });
    const newEventsHTML = [];
    for (let j = 0; j < item.items.length; j += 1) {
      const newItem = item.items[j].item;
      const { events } = newItem;
      let dateLabel = outputDate(newItem.startDate);
      if (
        typeof newItem.endDate !== 'undefined' &&
        newItem.endDate !== '' &&
        newItem.endDate !== newItem.startDate
      ) {
        dateLabel += ` - ${outputDate(newItem.endDate)}`;
      }
      for (let i = 0; i < events.length; i += 1) {
        const newEvent = events[i];
        newEvent.i = `${j}-${i}`;
        newEvent.dateLabel = dateLabel;
        newEventsHTML.push(newEvent);
      }
    }

    setEventsHTML(newEventsHTML);
  };

  const renderTimelineItem = (item = null) => {
    if (item === null) {
      return null;
    }
    if (typeof item.group === 'undefined' || !item.group) {
      return (
        <div
          data-date={item.startDate}
          className="timeline-point"
          onClick={(e) => showEvents(e, item)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="show events"
        >
          <Label>
            {item.label} <small>[{item.events.length}]</small>
          </Label>
          <div className="triangle-up" />
          <div className="triangle-down" />
        </div>
      );
    }

    let eventsLength = 0;
    if (typeof item.items !== 'undefined') {
      for (let i = 0; i < item.items.length; i += 1) {
        const child = item.items[i];
        eventsLength += child.item.events.length;
      }
    }
    let yearClass = '';
    if (Number(item.date) % 10 === 0) {
      yearClass = ' decade';
    }
    if (Number(item.date) % 50 === 0) {
      yearClass = ' fifty';
    }
    if (Number(item.date) % 100 === 0) {
      yearClass = ' century';
    }
    return (
      <div
        data-date={item.date}
        className={`timeline-point${yearClass}`}
        onClick={(e) => showEventsGroup(e, item, eventsLength)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle image viewer"
      >
        <Label>
          {item.date} <small>[{eventsLength}]</small>
        </Label>
        <div className="triangle-up" />
        <div className="triangle-down" />
      </div>
    );
  };

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}timeline`,
        crossDomain: true,
        cancelToken: source.token,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined') {
        const respData = responseData.data;
        setItems(respData);
        const newData = initialData(respData);
        setItemsHTML(newData);
        setLoading(false);
      }
    };
    if (loading) {
      load();
    }
    return () => {
      source.cancel('api request cancelled');
    };
  }, [loading]);

  useEffect(() => {
    let resizeTimer;
    const resize = () => {
      if (!eventsContainerVisible) {
        return false;
      }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const container = timelineContainer.current;
        const containerBbox = container.getBoundingClientRect();
        const elemWidth = containerBbox.width - eventsContainerLeft;
        setEventsContainerWidth(elemWidth);
      }, 250);
      return false;
    };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  });

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const loadEvent = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}ui-event`,
        crossDomain: true,
        params: { _id: viewEventId },
        cancelToken: source.token,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined') {
        setSelectedEvent(responseData.data);
        setSelectedEventVisible(true);
        const visible = {
          events: true,
          organisations: true,
          people: true,
          resources: true,
        };
        if (responseData.data.events.length > 0) {
          visible.events = true;
        }
        if (responseData.data.organisations.length > 0) {
          visible.organisations = true;
        }
        if (responseData.data.people.length > 0) {
          visible.people = true;
        }
        if (responseData.data.resources.length > 0) {
          visible.resources = true;
        }
        if (responseData.data.classpieces.length > 0) {
          visible.classpieces = true;
        }
        setRelatedVisible(visible);
        setLoadingEvent(false);
      }
    };

    if (viewEventId !== null && loadingEvent) {
      loadEvent(viewEventId);
    }
    return () => {
      source.cancel('api request cancelled');
    };
  }, [viewEventId, loadingEvent]);

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  };

  const loadEvent = (_id) => {
    setViewEventId(_id);
    setLoadingEvent(true);
  };

  const renderEventHTML = (item) => (
    <div
      className="timeline-event-item"
      key={item.i}
      onClick={() => loadEvent(item._id)}
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="load event"
    >
      {item.label} <small>[{item.dateLabel}]</small>
    </div>
  );

  const toggleRelatedOpen = (name) => {
    const value = !relatedOpen[name];
    const relatedOpenCopy = { ...relatedOpen };
    relatedOpenCopy[name] = value;
    setRelatedOpen(relatedOpenCopy);
  };

  const toggleSelectedEvent = (val = null) => {
    const visible = val || !selectedEventVisible;
    setSelectedEventVisible(visible);
  };

  const searchDate = async (e) => {
    e.preventDefault();
    if (startDate === '') {
      return false;
    }
    let newStartDate = startDate;
    if (newStartDate !== '') {
      newStartDate = new Intl.DateTimeFormat('en-GB').format(startDate);
    }
    let compareDates = [];
    if (zoom === 'day') {
      compareDates = itemsHTML.map((i) => i.startDate);
    } else {
      compareDates = itemsHTML.map((i) => `01-01-${i.date}`);
    }
    const closestDate = getClosestDate(newStartDate, compareDates);
    const newIndex = compareDates.indexOf(closestDate);
    setScrollIndex(newIndex);

    // highlight found dom element
    setTimeout(() => {
      const elem = document.querySelectorAll(
        `*[data-lazylist-index="${newIndex}"]`
      );
      if (typeof elem[0] !== 'undefined') {
        elem[0].classList.add('found');
        setTimeout(() => {
          elem[0].classList.remove('found');
        }, 3000);
      }
    }, 500);
    return false;
  };

  const updateZoom = (val = null) => {
    if (val === null) {
      return false;
    }
    let newVal;
    if (val === '+') {
      newVal = zoomVal + 1;
    }
    if (val === '-') {
      newVal = zoomVal - 1;
    }
    const newIndex = newVal - 1;
    if (newIndex < 0 || newVal > zoomValues.length) {
      return false;
    }
    const newZoom = zoomValues[newIndex];
    setZoomVal(newVal);
    setZoom(newZoom);
    let newItems = [];
    if (newZoom === 'day') {
      newItems = groupByDay(items);
    }
    if (newZoom === 'year') {
      newItems = groupByYear();
    }
    if (newZoom === '10') {
      newItems = groupBy10();
    }
    if (newZoom === '50') {
      newItems = groupBy50();
    }
    if (newZoom === '100') {
      newItems = groupBy100();
    }
    setItemsHTML(newItems);
    return false;
  };

  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
  };

  const heading = 'Events timeline';
  const breadcrumbsItems = [
    { label: heading, icon: 'pe-7s-hourglass', active: true, path: '' },
  ];
  updateDocumentTitle(heading);
  let content = (
    <div className="row">
      <div className="col-12">
        <div style={{ padding: '40pt', textAlign: 'center' }}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  );

  if (!loading && itemsHTML.length > 0) {
    const ecstyle = {
      left: eventsContainerLeft,
      top: eventsContainerTop,
      width: eventsContainerWidth,
    };
    let echidden = ' hidden';
    if (eventsContainerVisible) {
      echidden = '';
    }
    let eventsContainerHeading = '';
    if (selectedItem !== null) {
      eventsContainerHeading = (
        <div>
          {selectedItem.label} <small>[{eventsNum}]</small>
        </div>
      );
    }
    let eventsListVisible = '';
    let eventDetailsVisible = ' hidden';
    if (selectedEventVisible) {
      eventsListVisible = ' hidden';
      eventDetailsVisible = '';
    }
    let selectedEventLabel = '';
    if (selectedEvent !== null) {
      let selectedEventDateLabel = '';
      let selectedEventDate = '';
      if (
        typeof selectedEvent.temporal !== 'undefined' &&
        selectedEvent.temporal.length > 0
      ) {
        const selectedEventTemporal = selectedEvent.temporal[0].ref;
        selectedEventDateLabel = outputDate(selectedEventTemporal.startDate);
        if (
          typeof selectedEventTemporal.endDate !== 'undefined' &&
          selectedEventTemporal.endDate !== '' &&
          selectedEventTemporal.endDate !== selectedEventTemporal.startDate
        ) {
          selectedEventDateLabel += ` - ${outputDate(
            selectedEventTemporal.endDate
          )}`;
        }
        selectedEventDate = (
          <small key="date"> [{selectedEventDateLabel}]</small>
        );
      }
      selectedEventLabel = [
        <span key="label">{selectedEvent.label}</span>,
        selectedEventDate,
      ];
    }

    let relatedEvents = [];
    let relatedEventsOpen = '';
    let relatedEventsVisible = 'hidden';
    let relatedOrganisations = [];
    let relatedOrganisationsOpen = '';
    let relatedOrganisationsVisible = 'hidden';
    let relatedPeople = [];
    let relatedPeopleOpen = '';
    let relatedPeopleVisible = 'hidden';
    let relatedResources = [];
    let relatedResourcesOpen = '';
    let relatedResourcesVisible = 'hidden';
    let relatedClasspieces = [];
    let relatedClasspiecesOpen = '';
    let relatedClasspiecesVisible = 'hidden';
    if (
      selectedEvent !== null &&
      selectedEvent.events.length > 0 &&
      relatedVisible.events
    ) {
      relatedEventsOpen = ' active';
      relatedEventsVisible = '';
      relatedEvents = selectedEvent.events.map((e) => (
        <Link
          href={`/event/${e.ref._id}`}
          to={`/event/${e.ref._id}`}
          key={e.ref._id}
        >
          <Badge className="related-event badge-event" color="warning">
            {e.ref.label}
          </Badge>
        </Link>
      ));
    }
    if (
      selectedEvent !== null &&
      selectedEvent.organisations.length > 0 &&
      relatedVisible.organisations
    ) {
      relatedOrganisationsVisible = '';
      relatedOrganisations = selectedEvent.organisations.map((e) => (
        <Link
          href={`/organisation/${e.ref._id}`}
          to={`/organisation/${e.ref._id}`}
          key={e.ref._id}
        >
          <Badge className="related-organisation badge-organisation">
            {e.ref.label}
          </Badge>
        </Link>
      ));
    }
    if (
      selectedEvent !== null &&
      selectedEvent.people.length > 0 &&
      relatedVisible.people
    ) {
      relatedPeopleVisible = '';
      relatedPeople = selectedEvent.people.map((e) => (
        <Link
          href={`/person/${e.ref._id}`}
          to={`/person/${e.ref._id}`}
          key={e.ref._id}
        >
          <Badge className="related-person">{e.ref.label}</Badge>
        </Link>
      ));
    }
    if (
      selectedEvent !== null &&
      selectedEvent.resources.length > 0 &&
      relatedVisible.resources
    ) {
      relatedResourcesVisible = '';
      relatedResources = selectedEvent.resources.map((e) => {
        const thumbnailPath = getResourceThumbnailURL(e.ref);
        let thumbnailImage = [];
        if (thumbnailPath !== null) {
          thumbnailImage = <img src={thumbnailPath} alt={e.ref.label} />;
        }
        return (
          <Link
            href={`/resource/${e.ref._id}`}
            to={`/resource/${e.ref._id}`}
            key={e.ref._id}
          >
            <Badge className="related-resource badge-resource">
              {thumbnailImage}
              {e.ref.label}
            </Badge>
          </Link>
        );
      });
    }
    if (
      selectedEvent !== null &&
      selectedEvent.classpieces.length > 0 &&
      relatedVisible.classpieces
    ) {
      relatedClasspiecesVisible = '';
      relatedClasspieces = selectedEvent.classpieces.map((e) => {
        const thumbnailPath = getResourceThumbnailURL(e.ref);
        let thumbnailImage = [];
        if (thumbnailPath !== null) {
          thumbnailImage = <img src={thumbnailPath} alt={e.ref.label} />;
        }
        return (
          <Link
            href={`/classpiece/${e.ref._id}`}
            to={`/classpiece/${e.ref._id}`}
            key={e.ref._id}
          >
            <Badge className="related-classpiece badge-resource">
              {thumbnailImage}
              {e.ref.label}
            </Badge>
          </Link>
        );
      });
    }
    if (relatedOpen.events) {
      relatedEventsOpen = ' active';
    }
    if (relatedOpen.organisations) {
      relatedOrganisationsOpen = ' active';
    }
    if (relatedOpen.people) {
      relatedPeopleOpen = ' active';
    }
    if (relatedOpen.resources) {
      relatedResourcesOpen = ' active';
    }
    if (relatedOpen.classpieces) {
      relatedClasspiecesOpen = ' active';
    }
    let description = [];
    if (selectedEvent !== null && selectedEvent.description !== '') {
      description = selectedEvent.description;
    }

    const eventsContainer = (
      <div className={`timeline-events-container${echidden}`} style={ecstyle}>
        <div className="heading">
          <h4>{eventsContainerHeading}</h4>
        </div>
        <div
          className="graph-details-card-close"
          onClick={() => toggleEventsContainer()}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle events container"
        >
          <i className="fa fa-times" />
        </div>
        <LazyList
          limit={30}
          range={15}
          items={eventsHTML}
          renderItem={renderEventHTML}
          containerClass={`events-list-container ${eventsListVisible}`}
        />
        <div className={`event-details${eventDetailsVisible}`}>
          <h4>
            <div className="event-details-back">
              <i
                className="fa fa-chevron-left"
                onClick={() => toggleSelectedEvent()}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle selected event"
              />
            </div>
            <span>{selectedEventLabel}</span>
          </h4>
          <div className="event-details-body">
            <div className="event-details-description">{description}</div>
            <div className={`event-details-related ${relatedEventsVisible}`}>
              <div
                className={`toggle-event-details-related ${relatedEventsOpen}`}
                onClick={() => toggleRelatedOpen('events')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle related events"
              >
                Events <small>[{relatedEvents.length}]</small>:{' '}
                <i className="fa fa-angle-down" />
              </div>
              <Collapse isOpen={relatedOpen.events}>{relatedEvents}</Collapse>
            </div>
            <div
              className={`event-details-related ${relatedOrganisationsVisible}`}
            >
              <div
                className={`toggle-event-details-related ${relatedOrganisationsOpen}`}
                onClick={() => toggleRelatedOpen('organisations')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle related organisations"
              >
                Organisations <small>[{relatedOrganisations.length}]</small>:{' '}
                <i className="fa fa-angle-down" />
              </div>
              <Collapse isOpen={relatedOpen.organisations}>
                {relatedOrganisations}
              </Collapse>
            </div>
            <div className={`event-details-related ${relatedPeopleVisible}`}>
              <div
                className={`toggle-event-details-related ${relatedPeopleOpen}`}
                onClick={() => toggleRelatedOpen('people')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle related people"
              >
                People <small>[{relatedPeople.length}]</small>:{' '}
                <i className="fa fa-angle-down" />
              </div>
              <Collapse isOpen={relatedOpen.people}>{relatedPeople}</Collapse>
            </div>
            <div className={`event-details-related ${relatedResourcesVisible}`}>
              <div
                className={`toggle-event-details-related ${relatedResourcesOpen}`}
                onClick={() => toggleRelatedOpen('resources')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle related resources"
              >
                Resources <small>[{relatedResources.length}]</small>:{' '}
                <i className="fa fa-angle-down" />
              </div>
              <Collapse isOpen={relatedOpen.resources}>
                {relatedResources}
              </Collapse>
            </div>
            <div
              className={`event-details-related ${relatedClasspiecesVisible}`}
            >
              <div
                className={`toggle-event-details-related ${relatedClasspiecesOpen}`}
                onClick={() => toggleRelatedOpen('classpieces')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle related classpieces"
              >
                Classpieces <small>[{relatedClasspieces.length}]</small>:{' '}
                <i className="fa fa-angle-down" />
              </div>
              <Collapse isOpen={relatedOpen.classpieces}>
                {relatedClasspieces}
              </Collapse>
            </div>
          </div>
        </div>
      </div>
    );

    const searchIcon = (
      <div
        className="graph-search-toggle events-timeline"
        onClick={() => toggleSearchContainerVisible()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle search"
      >
        <i className="fa fa-search" />
      </div>
    );

    const helpIcon = (
      <div
        className="graph-help-toggle events-timeline"
        onClick={() => toggleHelp()}
        title="Help"
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle help"
      >
        <i className="fa fa-question-circle" />
      </div>
    );

    let scVisibleClass = ' hidden';
    if (searchContainerVisible) {
      scVisibleClass = '';
    }
    const searchContainer = (
      <div className={`events-timeline-search-container${scVisibleClass}`}>
        <div
          className="graph-details-card-close"
          onClick={() => toggleSearchContainerVisible()}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle search container"
        >
          <i className="fa fa-times" />
        </div>
        <Form onSubmit={(e) => searchDate(e)}>
          <FormGroup>
            <Label>Search for date</Label>
            <Suspense fallback={renderLoader()}>
              <DatePicker
                placeholderText="dd/mm/yyyy"
                selected={startDate}
                onChange={(val) => setStartDate(val)}
                dateFormat="dd/MM/yyyy"
                showMonthDropdown
                showYearDropdown
              />
            </Suspense>
          </FormGroup>
          <Button size="sm" outline>
            Submit
          </Button>
        </Form>
      </div>
    );

    const zoomPanel = (
      <div className="zoom-panel events-timeline">
        <div
          className="zoom-action"
          onClick={() => updateZoom('+')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="zoom in"
        >
          <i className="fa fa-plus" />
        </div>
        <div
          className="zoom-action"
          onClick={() => updateZoom('-')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="zoom out"
        >
          <i className="fa fa-minus" />
        </div>
      </div>
    );

    content = (
      <div className="row">
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
        <HelpArticle
          permalink="timeline-help"
          visible={helpVisible}
          toggle={toggleHelp}
        />
      </div>
    );
  }
  return (
    <div className="container">
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <h3>{heading}</h3>
      {content}
    </div>
  );
};

export default Timeline;
