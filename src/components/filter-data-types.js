import React, {useState, useEffect} from 'react';
import {
  FormGroup, Label, Input,
  Card, CardBody
} from 'reactstrap';
import PropTypes from 'prop-types';

const FilterDataTypes = props => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState([]);
  const [filterItems, setFilterItems] = useState([]);

  useEffect(()=>{
    const load = () => {
      for (let i=0;i<props.itemsType.length; i++) {
        let itemType = props.itemsType[i];
        if (props.filtersSet.indexOf(itemType[`${props.filtersType.compareData.typeSet}`])>-1) {
          itemType.checked = true;
          itemType.hidden = "";
        }
        else {
          itemType.hidden = "hidden";
          itemType.checked = false;
          let typeSet = itemType[`${props.filtersType.compareData.typeSet}`];
          for (let j=0;j<props.items.length;j++) {
            let dataSet = props.items[j][`${props.filtersType.compareData.dataSet}`];
            if (dataSet === typeSet) {
              itemType.hidden = "";
              break;
            }
          }
          
        }
      }
      setFilterItems(props.itemsType);
      setLoading(false);
    }
    if (!props.loading && !props.loadingType && loading) {
      load();
    }
  },[loading, props.loading, props.loadingType, props.items, props.itemsType, props.filtersType, props.filtersSet]);

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
    setLoading(true);
  }

  const toggleFilter = (item) => {
    item.checked = !item.checked;
    
    // update render
    let itemIndex = filterItems.indexOf(item);
    filterItems[itemIndex].checked = item.checked;
    
    let newFilters = filters;
    if (item.checked) {
      newFilters.push(item[`${props.filtersType.compareData.typeSet}`]);
      
      let newFilterItems = filterItems.map((data,index)=>{
        if(index!==itemIndex) {
          data.hidden = "hidden";
        }
        return data;
      });
      setFilterItems(newFilterItems);
    }
    else {
      let index = newFilters.indexOf(item[`${props.filtersType.compareData.typeSet}`]);
      newFilters.splice(index, 1);
    }
    //setFilters(newFilters);
    props.updateFilters(props.name,filters);

    
    
    setLoading(true);
  }
  
  const resetState = () => {
    setFilters([]);
    setLoading(true);
  }
  
  props.resetStateForwardRef(() => resetState());
  
  let filterItemsHTML = filterItems.map((item,i)=>{
    let disabled = false;
    return <FormGroup key={i} className={item.hidden}>
      <Label>
        <Input type="checkbox" name={props.name} onChange={()=>toggleFilter(item)} disabled={disabled} checked={item.checked} />{' '}
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

FilterDataTypes.defaultProps = {
  filtersSet: [],
  filtersType: {},
  items: [],
  itemsType: [],
  label: "",
}

FilterDataTypes.propTypes = {
  filtersSet: PropTypes.array,
  filtersType: PropTypes.object.isRequired,
  items: PropTypes.array,
  itemsType: PropTypes.array,
  label: PropTypes.string,
  updateFilters: PropTypes.func,
}

export default FilterDataTypes;
