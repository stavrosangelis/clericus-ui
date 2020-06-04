import React, {useState, useEffect} from 'react';
import {
  FormGroup, Label, Input,
  Card, CardBody
} from 'reactstrap';
import PropTypes from 'prop-types';

const Filter = props => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState([]);
  const [filterItems, setFilterItems] = useState([]);

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
      }
      setFilterItems(props.items);
      setLoading(false);
    }
    if (!props.loading && loading) {
      load();
    }
  },[loading, props.loading, props.items, props.filtersType, props.filtersSet]);

  useEffect(()=>{
    if (props.filtersSet.length===0) {
      for (let i=0;i<filterItems.length; i++) {
        filterItems[i].checked = false;
      }
    }
  },[props.filtersSet,filterItems])

  const clearFilters = () => {
    for (let i=0;i<filterItems.length; i++) {
      filterItems[i].checked = false;
    }
    setFilters([]);
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
    let itemIndex = filterItems.indexOf(item);
    filterItems[itemIndex].checked = item.checked;
  }
  
  const resetState = () => {
    setFilters([]);
  }
  
  props.resetStateForwardRef(() => resetState());

  let filterItemsHTML = filterItems.map((item,i)=>{
    let disabled = false;
    let hidden = "";
    if (props.relationshipSet.indexOf(item._id)===-1) {
      disabled = true;
      hidden = "hidden";
    }
    return <FormGroup key={i} className={hidden}>
      <Label>
        <Input type="checkbox" name={props.filtersType} onChange={()=>toggleFilter(item)} disabled={disabled} checked={item.checked} />{' '}
        <span className="filter-span">{item.label}</span>
      </Label>
    </FormGroup>
  });
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
