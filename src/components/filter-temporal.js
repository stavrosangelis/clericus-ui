import React, {useState, useEffect} from 'react';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import {
  FormGroup, Label, Input,
  Card, CardBody,
  InputGroup,
  InputGroupAddon,
  Button,
} from 'reactstrap';
import PropTypes from 'prop-types';

const FilterTemporal = props => {
  const [filterItems,setFilterItems] = useState([]);
  useEffect(()=> {
    const toggleSearch = (dataItems=null) => {
      let filters = props.filtersSet;
      filters.eventID = [];
      let startDat_Filters = Date.parse(filters.startDate);
      let endDate_Filters = Date.parse(filters.endDate);
      if (filters.eventType.length > 0) {
        for (let i=0;i<filters.eventType.length;i++) {
          for (let j=0;j<dataItems._id.length;j++) {
            if (filters.eventType[i] === dataItems._id[j]) {
              for(let temporalsIndex=0;temporalsIndex<dataItems.temporals[`${dataItems.name[j]}`].length;temporalsIndex++) {
                let startDate_dataItems = Date.parse(dataItems.temporals[`${dataItems.name[j]}`][temporalsIndex].startDate);
                let endDate_dataItems = Date.parse(dataItems.temporals[`${dataItems.name[j]}`][temporalsIndex].endDate);
                if ((!isNaN(startDat_Filters)) && isNaN(endDate_Filters)) {
                  if (startDat_Filters <= startDate_dataItems) {
                    filters.eventID.push(dataItems.temporals[`${dataItems.name[j]}`][temporalsIndex].event[0].ref._id);
                  }
                }
                else if (isNaN(startDat_Filters) && (!isNaN(endDate_Filters))) {
                  if (endDate_Filters >= endDate_dataItems) {
                    filters.eventID.push(dataItems.temporals[`${dataItems.name[j]}`][temporalsIndex].event[0].ref._id);
                  }
                }
                else {
                  if ((startDat_Filters <= startDate_dataItems) &&
                      (endDate_Filters >= endDate_dataItems)) {
                    filters.eventID.push(dataItems.temporals[`${dataItems.name[j]}`][temporalsIndex].event[0].ref._id);
                  }
                }
              }
            }
          }
        }
      }
      else {
        for (let i=0;i<props.items.length;i++) {
          let startDate_items = Date.parse(props.items[i].startDate);
          let endDate_items = Date.parse(props.items[i].endDate);
          if ((!isNaN(startDat_Filters)) && isNaN(endDate_Filters)) {
            if (startDat_Filters <= startDate_items) {
              filters.eventID.push(props.items[i].event[0].ref._id);
            }
          }
          else if (isNaN(startDat_Filters) && (!isNaN(endDate_Filters))) {
            if (endDate_Filters >= endDate_items) {
              filters.eventID.push(props.items[i].event[0].ref._id);
            }
          }
          else {
            if ((startDat_Filters <= startDate_items) &&
                (endDate_Filters >= endDate_items)) {
              filters.eventID.push(props.items[i].event[0].ref._id);
            }
          }
        }
      }
      props.updateFilters(props.filtersType.name,filters);
    }
    const setDate = (date, type) => {
      let filters = props.filtersSet;
      filters[`${type}`] = date;
      props.updateFilters(props.filtersType.name,filters,false);
    }
    const clearTime = (type) => {
      let filters = props.filtersSet;
      filters[`${type}`] = null;
      props.updateFilters(props.filtersType.name,filters,false);
    }
    const toggleEventType = (_id=null) => {
      let filters = props.filtersSet;
      if (filters.eventType.includes(_id)===false) {
        filters.eventType.push(_id);
      }
      else {
        filters.eventType.splice(filters.eventType.indexOf(_id), 1);
      }
      props.updateFilters(props.filtersType.name,filters,false);
    }
    const existTemporalsEvent = (itemsOrdered=null) => {
      for(let i=0;i<itemsOrdered.name.length;i++) {
        for(let j=0;j<itemsOrdered.temporals[`${itemsOrdered.name[i]}`].length;j++) {
          if (props.relationshipSet.includes(itemsOrdered.temporals[`${itemsOrdered.name[i]}`][j].event[0].ref._id)) {
            return true;
          }
        }
      }
    }
    const prepareEventType = (itemsOrdered=null) => {
      if((props.filtersSet.startDate === null) && (props.filtersSet.endDate === null)) {
        return null;
      }
      
      let output = [];
      let checked = "";
      let hidden = "hidden";
      let preFilterSet = props.filtersSet;
      let startDat_Filters = Date.parse(preFilterSet.startDate);
      let endDate_Filters = Date.parse(preFilterSet.endDate);

      for(let i=0;i<itemsOrdered.name.length;i++) {
        checked = "";
        hidden = "hidden";
        for(let j=0;j<itemsOrdered.temporals[`${itemsOrdered.name[i]}`].length;j++) {
          if (props.relationshipSet.includes(itemsOrdered.temporals[`${itemsOrdered.name[i]}`][j].event[0].ref._id)) {
            let startDate_itemsOrdered = Date.parse(itemsOrdered.temporals[`${itemsOrdered.name[i]}`][j].startDate);
            let endDate_itemsOrdered = Date.parse(itemsOrdered.temporals[`${itemsOrdered.name[i]}`][j].endDate);
            if ((!isNaN(startDat_Filters)) && isNaN(endDate_Filters)) {
              if (startDat_Filters <= startDate_itemsOrdered) {
                hidden = "";
              }
            }
            else if (isNaN(startDat_Filters) && (!isNaN(endDate_Filters))) {
              if (endDate_Filters >= endDate_itemsOrdered) {
                hidden = "";
              }
            }
            else {
              if ((startDat_Filters <= startDate_itemsOrdered) &&
                  (endDate_Filters >= endDate_itemsOrdered)) {
                hidden = "";
              }
            }
          }
        }
        
        if(preFilterSet.eventType.length > 0) {
          if(preFilterSet.eventType.includes(itemsOrdered._id[i])!==false) {
            checked = "defaultChecked";
          }
        }
        
        let filterItem = <FormGroup key={itemsOrdered._id[i]}>
              <Label className={hidden+" filter-label"}>
                <Input type="checkbox" name={itemsOrdered.name[i]} onClick={()=>toggleEventType(itemsOrdered._id[i])} onChange={()=>{}} checked={checked}/>{' '}
                <span className="filter-span">{itemsOrdered.name[i]}</span>
              </Label>
            </FormGroup>
        output.push(filterItem);
      }
      return output;
    }
    const orderDataItems = (temporalItems=null, eventsType=null) => {
      let result_eventType = {
        name: [],
        _id: [],
        temporals: {},
      };
      let dataTypeNum = 0;
      for (let dataIndex=0;dataIndex<temporalItems.length; dataIndex++) {
        for (let typeIndex=0;typeIndex<eventsType.length; typeIndex++) {
          if(temporalItems[dataIndex].event[0].ref.eventType === eventsType[typeIndex]._id) {
            if(!result_eventType._id.includes(eventsType[typeIndex]._id)) {
              result_eventType._id.push(eventsType[typeIndex]._id);
              result_eventType.name.push(eventsType[typeIndex].label);
              if(typeof result_eventType.temporals[`${eventsType[typeIndex].label}`] === "undefined") {
                result_eventType.temporals[`${eventsType[typeIndex].label}`] = [];
              }
              dataTypeNum++;
            }
            result_eventType.temporals[`${eventsType[typeIndex].label}`].push(temporalItems[dataIndex]);
            continue;
          }
        }
        if(dataTypeNum === eventsType.length) {
          break;
        }
      }
      return result_eventType;
    }
    const prepareFilterItems = (dataItems=null) => {
      let preFilterSet = props.filtersSet;
      let filterItem = [];
      let disabled="disabled";
      if(existTemporalsEvent(dataItems)) {
        disabled = "";
      }
      let label = "Start Date";
      let startDateItem = <InputGroup key="startDate" size="sm" className="datepicker-wrapper">
              <InputGroupAddon addonType="prepend">{label}</InputGroupAddon>
              <DatePicker
                selected={preFilterSet.startDate}
                onChange={(date)=>{setDate(date,"startDate")}}
                className="ui-datepicker"
                fixedHeight
                disabled={disabled}
              />
              <InputGroupAddon addonType="append" className="btn-append">
                <Button key="startDateBtn" size="sm" type="button" onClick={()=>{clearTime("startDate")}}>
                  <i className="fa fa-times-circle" />
                </Button>
            </InputGroupAddon>
          </InputGroup>
      filterItem.push(startDateItem);
      label = "End Date";
      let endDateItem = <InputGroup key="endDate" size="sm" className="datepicker-wrapper">
              <InputGroupAddon addonType="prepend">{label+'\u00A0\u00A0'}</InputGroupAddon>
              <DatePicker
                selected={preFilterSet.endDate}
                onChange={(date)=>{setDate(date,"endDate")}}
                className="ui-datepicker"
                fixedHeight
                disabled={disabled}
              />
              <InputGroupAddon addonType="append" className="btn-append">
                <Button key="endDateBtn" size="sm" type="button" onClick={()=>{clearTime("endDate")}}>
                  <i className="fa fa-times-circle" />
                </Button>
            </InputGroupAddon>
          </InputGroup>
      filterItem.push(endDateItem);
      if(dataItems !== null) {
        let eventType = <div key="eventType" className="filter-body">
              <Label>
                <span className="filter-span-type">Types:</span>
              </Label>
              {prepareEventType(dataItems)}
            </div>;
        filterItem.push(eventType);
      }
      let btn_disabled = false;
      if(disabled==="disabled") {
        btn_disabled = true;
      }
      let searchBtn = <Button
              key="searchBtn"
              type="submit"
              size="sm"
              color="secondary"
              className="pull-right filter-search-font"
              onClick={()=>{toggleSearch(dataItems)}}
              disabled={btn_disabled}
            >
              <i className="fa fa-search" /> Search
            </Button>
      filterItem.push(searchBtn);
      setFilterItems(filterItem);
    }
    let dataItems = orderDataItems(props.items, props.itemsType);
    prepareFilterItems(dataItems);
  },[props])

  const clearFilters = () => {
    props.updateFilters(props.filtersType.name,
                        {
                        startDate: null,
                        endDate: null,
                        eventType: [],
                        eventID: [],});
  }
  
  return (
    <div className="filter-block">
      <Card>
        <CardBody>
          <h4>{props.label}
            <small className="pull-right clear-filters" onClick={()=>{clearFilters()}}>clear <i className="fa fa-times-circle"/></small>
          </h4>
          {filterItems}
        </CardBody>
      </Card>
      
    </div>
  )
}

FilterTemporal.defaultProps = {
  filtersSet: {},
  relationshipSet: [],
  filtersType: {},
  items: [],
  itemsType: [],
  label: "",
  relationType: "",
}

FilterTemporal.propTypes = {
  filtersSet: PropTypes.object,
  relationshipSet: PropTypes.array,
  filtersType: PropTypes.object.isRequired,
  items: PropTypes.array,
  itemsType: PropTypes.array,
  label: PropTypes.string,
  relationType: PropTypes.string,
  updateFilters: PropTypes.func,
}

export default FilterTemporal;
