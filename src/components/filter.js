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
  const [scrollIndex, setScrollIndex] = useState(0);
  const prevId = useRef(null);
  const prevRelationshipSet = useRef([]);

  useEffect(()=>{
    const load = () => {
      const flattenItems = (items, parentId=null) => {
        let newItems = [];
        for (let i in items) {
          let item = items[i];
          if (parentId!==null) {
            item.parentId = parentId;
          }
          let itemCopy = Object.assign({},item);
          if (typeof item.children!=="undefined") {
            delete itemCopy.children;
          }
          newItems.push(itemCopy);
          let parentIds = [];
          if (parentId===null) {
            parentIds.push(item._id);
          }
          else {
            parentIds = [...parentId, item._id];
          }
          if (item.children?.length>0) {
            newItems = [...newItems, ...flattenItems(item.children, parentIds)]
          }
        }
        return newItems;
      }

      let flatItems = flattenItems(props.items);
      let parentIds = [];
      if (Array.isArray(props.filtersSet)) {
        let selectedItems = flatItems.filter(i=>props.filtersSet?.indexOf(i._id)>-1);
        if (typeof selectedItems!=="undefined") {
          for (let skey in selectedItems) {
            let selectedItem = selectedItems[skey];
            if (typeof selectedItem.parentId!=="undefined") {
              for (let pkey in selectedItem.parentId) {
                let pId = selectedItem.parentId[pkey];
                if (parentIds.indexOf(pId)===-1) {
                  parentIds.push(pId);
                }
              }
            }
          }
        }
      }

      let newFilterItems = [];
      for (let i=0;i<flatItems.length; i++) {
        let item = flatItems[i];
        if (Array.isArray(props.filtersSet) && props.filtersSet.indexOf(item._id)>-1) {
          item.checked = true;
        }
        else {
          item.checked = false;
        }
        item.i = i;
        if (props.relationshipSet.length>0 && props.relationshipSet.indexOf(item._id)===-1 && parentIds.indexOf(item._id)===-1) {
          continue;
        }
        if (props.filtersType==="organisations" && filterType!=="" && filterType!==item.organisationType && parentIds.indexOf(item._id)===-1) {
          continue;
        }
        newFilterItems.push(item)
      }


      setFilterItems(newFilterItems);
      if (typeof props.itemsType!=="undefined") {
        setFiltersTypes(props.itemsType);
      }
      setLoading(false);
    }
    if (!props.loading && loading) {
      load();
    }
  },[loading, props.loading, props.items, props.filtersType, props.filtersSet, props.itemsType, props.relationshipSet, filterType]);

  useEffect(()=>{
    if (props.relationshipSet.length>0 && props.relationshipSet.length!==prevRelationshipSet.current.length && !loading) {
      prevRelationshipSet.current = props.relationshipSet;
      setLoading(true);
    }
  },[props.relationshipSet, loading]);

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
      setFilterType("");
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
    let children = filterItemChildren(item);
    if (typeof children!=="undefined" && children.length>0) {
      if (item.checked) {
        newFilters = [...newFilters, ...children];
      }
      else {
        for (let ckey in children) {
          let cid = children[ckey];
          let newIndex = newFilters.indexOf(cid);
          newFilters.splice(newIndex,1);
        }
      }
    }
    setFilters(newFilters);
    props.updateFilters(props.filtersType,newFilters);

  }


  const filterItemChildren = (item) => {
    let newItems = filterItems.filter(i=>(typeof i.parentId!=="undefined" && i.parentId!==null));
    let childrenIds = [];
    if (typeof newItems!=="undefined") {
      let children = newItems.filter(i=>i.parentId.indexOf(item._id)>-1);
      if (typeof children!=="undefined") {
        for (let key in children) {
          let c = children[key];
          c.checked = item.checked;
          childrenIds.push(c._id);
        }
      }
    }
    return childrenIds;
  }

  const updateType = (e) => {
    let val = e.target.value;
    setFilterType(val);
    setScrollIndex(1);
    if (typeof props.updateType!=="undefined") {
      props.updateType(val);
    }
    if (!loading) {
      setLoading(true);
    }

    setTimeout(()=>{setScrollIndex(0);},750);
  }

  const renderFilterItem = (item) => {
    let sepIcon = [];
    let sepClass = "";
    let spanWidthStyle = {width:"calc(100% - 5px)"};
    let parentId = item.parentId || null;
    if (parentId!==null) {
      let spanWidth = 15;
      for (let i=0;i<item.parentId.length; i++) {
        sepIcon.push(<div className="filter-separator" key={i}></div>);
      }
      spanWidth = spanWidth+(15*item.parentId.length);
      spanWidthStyle = {width:`calc(100% - ${spanWidth}px)`};
      sepClass = `sep-${item.parentId.length}`;
    }
    let output = <FormGroup key={item._id} className={`filter-item ${sepClass}`}>
      <Label onMouseOver={(e)=>over(e)} data-target={`${props.filtersType}-fi-${item._id}`}>
        <div className="title" id={`${props.filtersType}-fi-${item._id}`}>{item.label}</div>
        <div className="filter-separator-container">{sepIcon}</div> <Input type="checkbox" name={props.filtersType} onChange={()=>toggleFilter(item, parentId)} checked={item.checked} />{' '}
        <span className="filter-span" style={spanWidthStyle}>{item.label}</span>
      </Label>
    </FormGroup>;
    return output;
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
            scrollIndex={scrollIndex}
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
