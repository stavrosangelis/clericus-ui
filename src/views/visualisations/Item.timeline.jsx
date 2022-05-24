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
  Button,
  Label,
} from 'reactstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import {
  updateDocumentTitle,
  outputDate,
  getClosestDate,
  personLabel,
  renderLoader,
  initialData,
  groupItemsByYear,
  groupItemsByYears,
} from '../../helpers';
import TimelineEventView from '../../components/visualisations/Timeline.event.view';
import LazyList from '../../components/Lazylist';

import 'react-datepicker/dist/react-datepicker.css';
import '../../scss/timeline.scss';

const Breadcrumbs = lazy(() => import('../../components/Breadcrumbs'));
const DatePicker = lazy(() => import('react-datepicker'));
const HelpArticle = lazy(() => import('../../components/Help.article'));

const { REACT_APP_APIPATH: APIPath } = process.env;

function Timeline() {
  // state
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
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

  // props
  const { _id, type } = useParams();

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

  const showEvents = (e, itemParam) => {
    const { events } = itemParam;
    let { length: itemsNum } = events;
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
    const elemWidth = containerBbox.width - elemLeft - 40;
    toggleEventsContainer(true);
    setSelectedItem(itemParam);
    setEventsContainerLeft(elemLeft);
    setEventsContainerTop(elemTop);
    setEventsContainerWidth(elemWidth);
    setSelectedEventVisible(false);
    setRelatedOpen({
      events: true,
      organisations: true,
      people: true,
      resources: true,
    });
    const newEventsHTML = [];
    const { length } = events;
    for (let i = 0; i < length; i += 1) {
      const newItem = events[i];
      const { startDate: iStartDate = '', endDate: iEndDate = '' } = itemParam;
      let dateLabel = outputDate(iStartDate);
      if (iEndDate !== '' && iEndDate !== iStartDate) {
        dateLabel += ` - ${outputDate(iEndDate)}`;
      }
      newItem.i = i;
      newItem.dateLabel = dateLabel;
      newEventsHTML.push(newItem);
    }
    setEventsHTML(newEventsHTML);
  };

  const showEventsGroup = (e, itemParam, itemsNumParam) => {
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
    const elemWidth = containerBbox.width - elemLeft - 40;
    toggleEventsContainer(true);
    setSelectedItem(itemParam);
    setEventsContainerLeft(elemLeft);
    setEventsContainerTop(elemTop);
    setEventsContainerWidth(elemWidth);
    setSelectedEventVisible(false);
    setRelatedOpen({
      events: true,
      organisations: true,
      people: true,
      resources: true,
    });
    const newEventsHTML = [];
    const { items: nItems } = itemParam;
    const { length } = nItems;
    for (let j = 0; j < length; j += 1) {
      const { item: newItem } = nItems[j];
      const { events } = newItem;
      const { startDate: nStartDate = '', endDate: nEndDate = '' } = newItem;
      let dateLabel = outputDate(nStartDate);
      if (nEndDate !== '' && nEndDate !== nStartDate) {
        dateLabel += ` - ${outputDate(nEndDate)}`;
      }
      const { length: eLength } = events;
      for (let i = 0; i < eLength; i += 1) {
        const newEvent = events[i];
        newEvent.i = `${j}-${i}`;
        newEvent.dateLabel = dateLabel;
        newEventsHTML.push(newEvent);
      }
    }

    setEventsHTML(newEventsHTML);
  };

  const toggleSelectedEvent = (val = null) => {
    setSelectedEvent(null);
    const visible = val || !selectedEventVisible;
    setSelectedEventVisible(visible);
  };

  const loadEvent = async (eventId) => {
    toggleSelectedEvent(true);
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}ui-event`,
      crossDomain: true,
      params: { _id: eventId },
    })
      .then((response) => response.data)
      .catch((error) => console.log(error));
    const { data = [] } = responseData;
    setSelectedEvent(data);
  };

  const renderEventHTML = (itemParam = null) => {
    if (itemParam !== null) {
      const {
        _id: iId = '',
        label: iLabel = '',
        dateLabel: iDateLabel = '',
      } = itemParam;
      return (
        <div
          className="timeline-event-item"
          key={iId}
          onClick={() => loadEvent(iId)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="load event"
        >
          {iLabel} <small>[{iDateLabel}]</small>
        </div>
      );
    }
    return null;
  };

  const renderTimelineItem = (itemParam = null) => {
    if (itemParam !== null) {
      const {
        date: iDate = '',
        group = false,
        startDate: iStartDate = '',
        label: iLabel = '',
        events: iEvents,
        items: iItems = [],
      } = itemParam;
      if (!group) {
        return (
          <div
            data-date={iStartDate}
            className="timeline-point"
            onClick={(e) => showEvents(e, itemParam)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="tshow events"
          >
            <Label>
              {iLabel} <small>[{iEvents.length}]</small>
            </Label>
            <div className="triangle-up" />
            <div className="triangle-down" />
          </div>
        );
      }

      let eventsLength = 0;
      if (iItems.length > 0) {
        const { length: iItemsLength } = iItems;
        for (let i = 0; i < iItemsLength; i += 1) {
          const child = iItems[i];
          eventsLength += child.item.events.length;
        }
      }
      let yearClass = '';
      if (Number(itemParam.date) % 10 === 0) {
        yearClass = ' decade';
      }
      if (Number(itemParam.date) % 50 === 0) {
        yearClass = ' fifty';
      }
      if (Number(itemParam.date) % 100 === 0) {
        yearClass = ' century';
      }
      return (
        <div
          data-date={iDate}
          className={`timeline-point${yearClass}`}
          onClick={(e) => showEventsGroup(e, itemParam, eventsLength)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="show events group"
        >
          <Label>
            {iDate} <small>[{eventsLength}]</small>
          </Label>
          <div className="triangle-up" />
          <div className="triangle-down" />
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      let url = null;
      const params = { _id };
      switch (type) {
        case 'person':
          url = `${APIPath}ui-person`;
          break;
        case 'classpiece':
          url = `${APIPath}classpiece`;
          break;
        case 'resource':
          url = `${APIPath}resource`;
          break;
        case 'event':
          url = `${APIPath}ui-event`;
          break;
        case 'organisation':
          url = `${APIPath}ui-organisation`;
          break;
        default:
          url = null;
          break;
      }
      if (url === null) {
        return;
      }
      const responseData = await axios({
        method: 'get',
        url,
        crossDomain: true,
        params,
        signal: controller.signal,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));

      const eventsData = await axios({
        method: 'get',
        url: `${APIPath}item-timeline`,
        crossDomain: true,
        params,
        signal: controller.signal,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));

      if (!unmounted) {
        setLoading(false);
        const { data: respData = null } = responseData;
        const { data: evtData = null } = eventsData;
        if (respData !== null) {
          setItem(respData);
        }
        if (evtData !== null) {
          setItems(evtData);
          const newData = initialData(evtData);
          setItemsHTML(newData);
        }
      }
    };
    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading, _id, type]);

  useEffect(() => {
    let resizeTimer;
    const resize = () => {
      if (!eventsContainerVisible) {
        return false;
      }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const { current: container = null } = timelineContainer;
        if (container !== null) {
          const containerBbox = container.getBoundingClientRect();
          const elemWidth = containerBbox.width - eventsContainerLeft;
          setEventsContainerWidth(elemWidth);
        }
      }, 250);
      return false;
    };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  });

  const toggleSearchContainerVisible = () => {
    setSearchContainerVisible(!searchContainerVisible);
  };

  const toggleRelatedOpen = (name) => {
    const value = !relatedOpen[name];
    const relatedOpenCopy = { ...relatedOpen };
    relatedOpenCopy[name] = value;
    setRelatedOpen(relatedOpenCopy);
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
    const newScrollIndex = newIndex > 20 ? newIndex - 10 : newIndex;
    setScrollIndex(newScrollIndex);

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
    if (val !== null) {
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
      let newItems = null;
      switch (newZoom) {
        case 'day':
          newItems = groupByDay(items);
          break;
        case 'year':
          newItems = groupByYear();
          break;
        case '10':
          newItems = groupBy10();
          break;
        case '50':
          newItems = groupBy50();
          break;
        case '100':
          newItems = groupBy100();
          break;
        default:
          newItems = null;
          break;
      }
      setItemsHTML(newItems);
    }
    return false;
  };

  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
  };

  const renderEventsContainer = () => {
    // events container size and position
    const ecstyle = {
      left: eventsContainerLeft,
      top: eventsContainerTop,
      width: eventsContainerWidth,
    };
    // events container visibility
    const echidden = eventsContainerVisible ? '' : ' hidden';
    let eventsContainerContent = (
      <>
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
        <div style={{ padding: '40pt', textAlign: 'center' }}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </>
    );
    if (selectedItem !== null) {
      const eventsListVisible = selectedEventVisible ? ' hidden' : '';
      // selectedItem data
      const { label: sLabel = '' } = selectedItem;
      const eventsContainerHeading = (
        <>
          {sLabel} <small>[{eventsNum}]</small>
        </>
      );
      eventsContainerContent = (
        <>
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
          <TimelineEventView
            relatedOpen={relatedOpen}
            selectedEvent={selectedEvent}
            toggle={toggleSelectedEvent}
            toggleRelated={toggleRelatedOpen}
            visible={selectedEventVisible}
          />
        </>
      );
    }

    return (
      <div className={`timeline-events-container${echidden}`} style={ecstyle}>
        {eventsContainerContent}
      </div>
    );
  };

  let heading = '';
  const breadcrumbsItems = [];
  let breadcrumbsParent = {};
  switch (type) {
    case 'classpiece':
      breadcrumbsParent = {
        label: 'Classpieces',
        icon: 'pe-7s-photo',
        active: false,
        path: '/classpieces',
      };
      break;
    case 'event':
      breadcrumbsParent = {
        label: 'Events',
        icon: 'pe-7s-date',
        active: false,
        path: '/events',
      };
      break;
    case 'organisation':
      breadcrumbsParent = {
        label: 'Organisations',
        icon: 'pe-7s-culture',
        active: false,
        path: '/organisations',
      };
      break;
    case 'person':
      breadcrumbsParent = {
        label: 'People',
        icon: 'pe-7s-users',
        active: false,
        path: '/people',
      };
      break;
    case 'resource':
      breadcrumbsParent = {
        label: 'Resources',
        icon: 'pe-7s-photo',
        active: false,
        path: '/resources',
      };
      break;
    default:
      break;
  }
  breadcrumbsItems.push(breadcrumbsParent);

  if (!loading && item !== null) {
    let { label = '' } = item;
    switch (type) {
      case 'classpiece':
        breadcrumbsItems.push(
          {
            label,
            icon: 'pe-7s-photo',
            active: false,
            path: `/classpiece/${_id}`,
          },
          { label: 'Timeline', icon: 'pe-7s-hourglass', active: true, path: '' }
        );
        break;
      case 'event':
        breadcrumbsItems.push(
          {
            label,
            icon: 'pe-7s-date',
            active: false,
            path: `/event/${_id}`,
          },
          { label: 'Timeline', icon: 'pe-7s-hourglass', active: true, path: '' }
        );
        break;
      case 'organisation':
        breadcrumbsItems.push(
          {
            label,
            icon: 'pe-7s-culture',
            active: false,
            path: `/organisation/${_id}`,
          },
          { label: 'Timeline', icon: 'pe-7s-hourglass', active: true, path: '' }
        );
        break;
      case 'person':
        label = personLabel(item);
        breadcrumbsItems.push(
          {
            label,
            icon: 'pe-7s-user',
            active: false,
            path: `/person/${_id}`,
          },
          { label: 'Timeline', icon: 'pe-7s-hourglass', active: true, path: '' }
        );
        break;
      case 'resource':
        breadcrumbsItems.push(
          {
            label,
            icon: 'pe-7s-photo',
            active: false,
            path: `/resource/${_id}`,
          },
          { label: 'Timeline', icon: 'pe-7s-hourglass', active: true, path: '' }
        );
        break;
      default:
        break;
    }
    const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
    updateDocumentTitle(documentTitle);
    heading = `${label} Timeline`;
  }

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
    const eventsContainer = renderEventsContainer();

    const searchIcon = (
      <div
        className="graph-search-toggle events-timeline"
        onClick={() => toggleSearchContainerVisible()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle search container"
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

    const scVisibleClass = !searchContainerVisible ? ' hidden' : '';

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
        <Suspense fallback={null}>
          <HelpArticle
            permalink="timeline-help"
            visible={helpVisible}
            toggle={toggleHelp}
          />
        </Suspense>
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
}
export default Timeline;
