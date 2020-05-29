import React, {useState, useEffect} from 'react';
import {
  FormGroup, Label, Input,
  Card, CardBody
} from 'reactstrap';
import PropTypes from 'prop-types';
import { Link} from 'react-router-dom';

const FilterSpatial = props => {
  const [filterItems,setFilterItems] = useState([]);
  useEffect(()=> {
    const toggleFilter = (_id=null) => {
      let filters = props.filtersSet;
      if (filters.includes(_id)===false) {
        filters.push(_id);
      }
      else{
        filters.splice(filters.indexOf(_id), 1);
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

        if(props.relationshipSet.includes(item._id)===false) {
          disabled = "disabled";
          hidden = "hidden";
        }else {
          labelType = " filter-label";
        }
        
        if(preFilterSet.length > 0) {
          if(preFilterSet.includes(item._id)===true) {
            checked = "defaultChecked";
          }
        }
        
        let link = "/spatial/"+item._id;
        let output = <FormGroup key={item._id}>
              <Label className={hidden+labelType}>
                <Input type="checkbox" name={props.filtersType.name} onClick={()=>toggleFilter(item._id)} onChange={()=>{}} disabled={disabled} checked={checked}/>{' '}
                <span className="filter-span">{item.label}</span>
              </Label>
              <Link to={link} href={link} className={hidden}>
                <i className={"fa fa-map-marker filter-spatial-marker"}/>
              </Link>
            </FormGroup>
        filterItem.push(output);
      }
      setFilterItems(filterItem);
    }
    prepareFilterItems();
  },[props])

  const clearFilters = () => {
    props.updateFilters(props.filtersType.name,[]);
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
  filtersSet: [],
  relationshipSet: [],
  filtersType: {},
  items: [],
  itemsType: [],
  label: "",
  relationType: "",
}

FilterSpatial.propTypes = {
  filtersSet: PropTypes.array,
  relationshipSet: PropTypes.array,
  filtersType: PropTypes.object.isRequired,
  items: PropTypes.array,
  itemsType: PropTypes.array,
  label: PropTypes.string,
  relationType: PropTypes.string,
  updateFilters: PropTypes.func,
}

export default FilterSpatial;
