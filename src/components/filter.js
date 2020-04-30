import React, {useState, useEffect} from 'react';
import {
  FormGroup, Label, Input,
  Card, CardBody
} from 'reactstrap';
import PropTypes from 'prop-types';

const Filter = props => {
  const [filterItems,setFilterItems] = useState([]);
  useEffect(()=> {
    const toggleFilter = (name="", _id=null) => {
      let filters = props.filtersSet;
      if (filters.indexOf(_id)===-1) {
        filters.push(_id);
      }
      else{
        filters.splice(filters.indexOf(_id), 1);
      }
      props.updateFilters(props.filtersType,filters);
    }
    const prepareFilterItems = (relatedItems=null) => {
      let output = [];
      let disabled = "", checked = "";
      let preFilterSet = props.filtersSet;
      for (let i=0;i<props.items.length; i++) {
        disabled = "";
        checked="";
        let item = props.items[i];
        let hidden = "";
        if(relatedItems!==null) {
          if(relatedItems.indexOf(item._id)===-1) {
            disabled = "disabled";
            hidden = "hidden";
          }
        }
        if(preFilterSet.length>0){
          if(preFilterSet.indexOf(item._id)!==-1) {
            checked = "defaultChecked";
          }
        }
        let filterItem = <FormGroup key={item._id}>
              <Label className={hidden}>
                <Input type="checkbox" name="classpieces" onClick={()=>toggleFilter(item.label,item._id)} onChange={()=>{}} disabled={disabled} checked={checked}/>{' '}
                <span>{item.label}</span>
              </Label>
            </FormGroup>
        output.push(filterItem);
      }
      setFilterItems(output);
    }
    prepareFilterItems();
  },[props])



  const clearFilters = () => {
    props.updateFilters(props.filtersType,[]);
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

Filter.defaultProps = {
  filtersSet: [],
  filtersType: "",
  items: [],
  label: "",
  relationType: "",
}

Filter.propTypes = {
  filtersSet: PropTypes.array,
  filtersType: PropTypes.string.isRequired,
  items: PropTypes.array,
  label: PropTypes.string,
  relationType: PropTypes.string,
  updateFilters: PropTypes.func,
}

export default Filter;
