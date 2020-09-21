import React, {useState, useEffect, useRef} from 'react';
import {
  FormGroup, Label, Input,
  Card, CardBody
} from 'reactstrap';
import PropTypes from 'prop-types';
import LazyList from './lazylist';

const Filter = props => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState([]);
  const [filterItems, setFilterItems] = useState([]);
  const [filtersTypes, setFiltersTypes] = useState([]);
  const [filterType, setFilterType] = useState("");
  const prevFiltersSetRef = useRef(null);
  const prevId = useRef(null);

  useEffect(()=>{
    const load = () => {
      for (let i=0;i<props.items.length; i++) {
        let item = props.items[i];
        if (props.filtersSet.indexOf(item._id)>-1) {
          item.checked = true;
        }
        else {
          item.checked = false;
        }
        item.i = i;
      }
      setFilterItems(props.items);
      if (typeof props.itemsType!=="undefined") {
        setFiltersTypes(props.itemsType);
      }
      setLoading(false);
    }
    if (!props.loading && loading) {
      load();
    }
  },[loading, props.loading, props.items, props.filtersType, props.filtersSet, props.itemsType]);

  let filtersType = props.filtersType;
  let filtersSet = props.filtersSet;
  let updateFilters = props.updateFilters;

  useEffect(()=>{
    if (prevFiltersSetRef.current>0 && filtersSet.length===0) {
      let newFilterItems = Object.assign([],filterItems);
      for (let i=0;i<newFilterItems.length; i++) {
        newFilterItems[i].checked = false;
      }
      setFilterItems(newFilterItems);
      setFilters([]);
      updateFilters(filtersType,[]);
    }
    prevFiltersSetRef.current = filtersSet.length;
  },[updateFilters,filtersSet,filterItems,filtersType]);

  const over = (e) => {
    e.stopPropagation();
    let elem = e.currentTarget;
    let bbox = elem.getBoundingClientRect();
    let id = elem.dataset.target;
    prevId.current = id;
    let titleElem = document.getElementById(id);

    if (typeof titleElem!=="undefined") {
      let left = bbox.left + 20;
      let top = bbox.top - 2;
      titleElem.style.left = left+"px";
      titleElem.style.top = top+"px";
    }
  }

  const cancelOver = () => {
    if (prevId.current!==null) {
      let titleElem = document.getElementById(prevId.current);
      if (typeof titleElem!=="undefined" && titleElem!==null) {
        titleElem.style.left = "-100px";
        titleElem.style.top = "-100px";
      }
      prevId.current = null;
    }
  }

  useEffect(()=> {
    const cancelOver = () => {
      if (prevId.current!==null) {
        let titleElem = document.getElementById(prevId.current);
        if (typeof titleElem!=="undefined" && titleElem!==null) {
          titleElem.style.left = "-100px";
          titleElem.style.top = "-100px";
        }
        prevId.current = null;
      }
    }
    window.addEventListener("scroll", cancelOver);
    return () => {
      window.removeEventListener("scroll", cancelOver);
    }
  },[]);

  useEffect(()=>{
    if (filtersType==="organisationType" && props.filtersSet.organisationType==="" &&  filterType!==props.filtersSet.organisationType
  ) {
      setFilterType("");
    }
    if (filtersType==="eventType" && props.filtersSet.eventType==="" &&  filterType!==props.filtersSet.eventType
  ) {
      setFilterType("");
    }
  },[filtersType,props.filtersSet,filterType]);

  const clearFilters = () => {
    if (filters.length>0) {
      for (let i=0;i<filterItems.length; i++) {
        filterItems[i].checked = false;
      }
      setFilters([]);
      updateFilters(filtersType,[]);
    }
    if ((props.filtersType==="organisationType" || props.filtersType==="eventType") && filtersTypes.length>0 && filterType!=="") {
      setFilters([]);
      setFilterType("");
      updateFilters(filtersType,[]);
    }
  }

  const toggleFilter = (item) => {
    item.checked = !item.checked;
    let newFilters = filters;
    if (item.checked) {
      newFilters.push(item._id);
    }
    else {
      let index = newFilters.indexOf(item._id);
      newFilters.splice(index, 1);
    }
    setFilters(newFilters);
    props.updateFilters(props.filtersType,filters);

    // update render
    let itemIndex = filterItems.indexOf(item);
    filterItems[itemIndex].checked = item.checked;
  }

  const updateType = (e) => {
    let val = e.target.value;
    setFilterType(val);
    if (typeof props.updateType!=="undefined") {
      props.updateType(val);
    }
  }

  const renderFilterItem = (item) => {
    let disabled = false;
    let hidden = "";
    if (props.relationshipSet.indexOf(item._id)===-1) {
      disabled = true;
      hidden = "hidden";
    }
    if (props.filtersType==="organisations" && filterType!=="" && filterType!==item.organisationType) {
      disabled = true;
      hidden = "hidden";
    }
    return <FormGroup key={item.i} className={hidden+" filter-item"}>
      <Label onMouseOver={(e)=>over(e)} data-target={`${props.filtersType}-fi-${item.i}`}>
        <div className="title" id={`${props.filtersType}-fi-${item.i}`}>{item.label}</div>
        <Input type="checkbox" name={props.filtersType} onChange={()=>toggleFilter(item)} disabled={disabled} checked={item.checked} />{' '}
        <span className="filter-span">{item.label}</span>
      </Label>
    </FormGroup>
  }
  /*console.log(filterItems)
  let filterItemsHTML = filterItems.map((item,i)=>{
    let disabled = false;
    let hidden = "";
    if (props.relationshipSet.indexOf(item._id)===-1) {
      disabled = true;
      hidden = "hidden";
    }
    if (props.filtersType==="organisations" && filterType!=="" && filterType!==item.organisationType) {
      disabled = true;
      hidden = "hidden";
    }
    return <FormGroup key={i} className={hidden+" filter-item"}>
      <Label onMouseOver={(e)=>over(e)} data-target={`${props.filtersType}-fi-${i}`}>
        <div className="title" id={`${props.filtersType}-fi-${i}`}>{item.label}</div>
        <Input type="checkbox" name={props.filtersType} onChange={()=>toggleFilter(item)} disabled={disabled} checked={item.checked} />{' '}
        <span className="filter-span">{item.label}</span>
      </Label>
    </FormGroup>
  });*/

  let filtersTypesHTML = [];
  if (filtersTypes.length>0) {
    let defaultOption = [<option value="" key="default">-- All --</option>];

    let filtersTypesOptions = filtersTypes.map((item,i)=>{
      let value = item._id;
      if (props.filtersType==="organisations" || props.filtersType==="organisationType") {
        value = item.labelId;
      }
      return <option key={i} value={value}>{item.label}</option>
    });
    let options = [...defaultOption, ...filtersTypesOptions];
    filtersTypesHTML = <Input type="select" name={`${props.filtersType}-type`} className="filter-type-dropdown" onChange={(e)=>updateType(e)} value={filterType}>{options}</Input>;
  }

  return (
    <div className="filter-block">
      <Card>
        <CardBody>
          <h4>{props.label}
            <small className="pull-right clear-filters" onClick={()=>{clearFilters()}}>clear <i className="fa fa-times-circle"/></small>
          </h4>
          {filtersTypesHTML}
          <LazyList
            limit={50}
            range={25}
            items={filterItems}
            containerClass="filter-body"
            renderItem={renderFilterItem}
            onScroll={cancelOver}
            />
        </CardBody>
      </Card>
    </div>
  )
}

Filter.defaultProps = {
  filtersSet: [],
  relationshipSet: [],
  filtersType: {},
  items: [],
  itemsType: [],
  label: "",
  relationType: "",
}

Filter.propTypes = {
  relationshipSet: PropTypes.array,
  filtersType: PropTypes.string.isRequired,
  items: PropTypes.array,
  itemsType: PropTypes.array,
  label: PropTypes.string,
  relationType: PropTypes.string,
  updateFilters: PropTypes.func,
}

export default Filter;
