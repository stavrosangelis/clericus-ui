import React, {useState, useEffect} from 'react';
import {
  FormGroup, Label, Input,
  Card, CardBody
} from 'reactstrap';
import PropTypes from 'prop-types';

const Filter = props => {
  const [filterItems,setFilterItems] = useState([]);
  const [filters, setFilters] = useState([]);

  useEffect(()=>{
    const load = () => {
      let items = props.items.map((item,i)=>{
        item.checked = false;
        return item;
      });
      setFilterItems(items);
    }
    if (!props.loading) {
      load();
    }
  },[props.loading, props.items, props.filtersType]);

  useEffect(()=>{
    if (props.filtersSet.length===0) {
      let newFilterItems = filterItems;
      for (let i=0;i<newFilterItems.length; i++) {
        newFilterItems[i].checked = false;
      }
      setFilterItems(newFilterItems);
    }
  },[props.filtersSet,filterItems])

  const clearFilters = () => {
    let newFilterItems = filterItems;
    for (let i=0;i<newFilterItems.length; i++) {
      newFilterItems[i].checked = false;
    }
    setFilterItems(newFilterItems);
    props.updateFilters(props.filtersType,[]);
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
    let items = filterItems;
    let itemIndex = items.indexOf(item);
    items[itemIndex].checked = item.checked;
    setFilterItems(items);
  }

  let filterItemsHTML = filterItems.map((item,i)=>{
    let disabled = false;
    let hidden = "";
    if (props.relationshipSet.indexOf(item._id)===-1) {
      disabled = true;
      hidden = "hidden";
    }
    return <FormGroup key={i} className={hidden}>
      <Label>
        <Input type="checkbox" name={props.filtersType} onClick={()=>toggleFilter(item)} onChange={()=>{}} disabled={disabled} checked={item.checked}/>{' '}
        <span className="filter-span">{item.label}</span>
      </Label>
    </FormGroup>
  })
  return (
    <div className="filter-block">
      <Card>
        <CardBody>
          <h4>{props.label}
            <small className="pull-right clear-filters" onClick={()=>{clearFilters()}}>clear <i className="fa fa-times-circle"/></small>
          </h4>
          <div className="filter-body">
            {filterItemsHTML}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

Filter.defaultProps = {
  filtersSet: {},
  relationshipSet: [],
  filtersType: {},
  items: [],
  itemsType: [],
  label: "",
  relationType: "",
}

Filter.propTypes = {
  filtersSet: PropTypes.array,
  relationshipSet: PropTypes.array,
  filtersType: PropTypes.string.isRequired,
  items: PropTypes.array,
  itemsType: PropTypes.array,
  label: PropTypes.string,
  relationType: PropTypes.string,
  updateFilters: PropTypes.func,
}

export default Filter;
