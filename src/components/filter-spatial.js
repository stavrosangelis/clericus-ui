import React, {useState, useEffect} from 'react';
import {
  FormGroup, Label, Input,
  Card, CardBody
} from 'reactstrap';
import PropTypes from 'prop-types';

const FilterSpatial = props => {
  const [filterItems,setFilterItems] = useState([]);
  useEffect(()=> {
    const toggleFilter = (_id=null) => {
      let filters = props.filtersSet;
      if (filters.eventID.includes(_id)===false) {
        filters.eventID.push(_id);
      }
      else{
        filters.eventID.splice(filters.eventID.indexOf(_id), 1);
      }
      props.updateFilters(props.filtersType.name,filters);
    }
    const prepareFilterItems = () => {     
      let filterItem = [];
      let preFilterSet = props.filtersSet;
      let labelType = "";
      for(let i=0;i<props.items.length;i++) {
        let disabled = "", checked = "";
        let hidden = "";
        let item = props.items[i];
        
        if(props.relationshipSet.includes(item.event[0].ref._id)===false) {
          disabled = "disabled";
          hidden = "hidden";
        }else {
          labelType = " filter-label";
        }
        
        if(preFilterSet.eventID.length > 0) {
          if(preFilterSet.eventID.includes(item.event[0].ref._id)===true) {
            checked = "defaultChecked";
          }
        }
        
        let output = <FormGroup key={item._id}>
              <Label className={hidden+labelType}>
                <Input type="checkbox" name={props.filtersType.name} onClick={()=>toggleFilter(item.event[0].ref._id)} onChange={()=>{}} disabled={disabled} checked={checked}/>{' '}
                <span className="filter-span">{item.label}</span>
              </Label>
            </FormGroup>
        filterItem.push(output);
      }
      setFilterItems(filterItem);
    }
    prepareFilterItems();
  },[props])

  const clearFilters = () => {
    props.updateFilters(props.filtersType.name,{eventID: []});
  }
  return (
    <div className="filter-block">
      <Card>
        <CardBody>
          <h4>{props.label}
            <small className="pull-right clear-filters" onClick={()=>{clearFilters()}}>clear <i className="fa fa-times-circle"/></small>
          </h4>
          <div className="filter-body">
            {filterItems}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

FilterSpatial.defaultProps = {
  filtersSet: {},
  relationshipSet: [],
  filtersType: {},
  items: [],
  itemsType: [],
  label: "",
  relationType: "",
}

FilterSpatial.propTypes = {
  filtersSet: PropTypes.object,
  relationshipSet: PropTypes.array,
  filtersType: PropTypes.object.isRequired,
  items: PropTypes.array,
  itemsType: PropTypes.array,
  label: PropTypes.string,
  relationType: PropTypes.string,
  updateFilters: PropTypes.func,
}

export default FilterSpatial;
