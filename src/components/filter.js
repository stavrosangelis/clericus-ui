import React, {useState, useEffect} from 'react';
import {
  FormGroup, Label, Input,
  Card, CardBody
} from 'reactstrap';
import PropTypes from 'prop-types';

const Filter = props => {
  const [loading, setLoading] = useState(true);
  const [organisationType,setOrganisationType] = useState("all");
  const [itemsOrdered,setItemsOrdered] = useState({});
  const [itemsUpdated,setItemsUpdated] = useState({});
  useEffect(()=> {
    const orderDataItems = (typeOnly=null, dataItems=null) => {
      let dataOrdered = {};
      let dataTypeNum = 0;
      for (let dataIndex=0;dataIndex<dataItems.length; dataIndex++) {
        for (let typeIndex=0;typeIndex<props.itemsType.length; typeIndex++) {
          if(dataItems[dataIndex][`${props.filtersType.compareData.dataSet}`] === props.itemsType[typeIndex][`${props.filtersType.compareData.typeSet}`]) {
            if(typeof dataOrdered[`${props.itemsType[typeIndex].label}`] === "undefined") {
              dataOrdered[`${props.itemsType[typeIndex].label}`] = {};
              dataOrdered[`${props.itemsType[typeIndex].label}`]._id = props.itemsType[typeIndex]._id;
              dataOrdered[`${props.itemsType[typeIndex].label}`].label = props.itemsType[typeIndex].label;
              dataOrdered[`${props.itemsType[typeIndex].label}`].dataArray = [];
              dataTypeNum++;
            }
            
            dataOrdered[`${props.itemsType[typeIndex].label}`].dataArray.push(dataItems[dataIndex]);
            
            if((dataTypeNum === props.itemsType.length) && (typeOnly)) {
              break;
            }
          }
        }
        
      }
      return dataOrdered;
    }
    const prepareOrderDataItems = () => {
      let itemsOrdered = []
      if(props.filtersType.layer.includes("type") && (props.filtersType.layer.length === 1)) {
        itemsOrdered = orderDataItems(true, props.items);
      }else {
        itemsOrdered = orderDataItems(false, props.items);
      }
      setItemsOrdered(itemsOrdered);
    }
    
    prepareOrderDataItems();
  },[props.filtersType, props.itemsType, props.items])
  
  useEffect(()=> {
    const updateInfo = (itemsOrdered=null) => {
      let disabled = "", checked = "", hidden="";
      let preFilterSet = props.filtersSet;
      let inputType = "ckeckbox";
      for(var property in itemsOrdered) {
        inputType = "ckeckbox";
        disabled = "";
        checked = "";
        hidden="";
        
        if(props.filtersType.typeFilterDisable === true) {
          inputType = "radio";
          disabled = "disabled";
        }
        
        itemsOrdered[property].inputType = inputType;
        itemsOrdered[property].disabled = disabled;
        itemsOrdered[property].checked = checked;
        itemsOrdered[property].hidden = hidden;
        
        for(let i=0;i<itemsOrdered[property].dataArray.length;i++) {
          inputType = "checkbox";
          disabled = "";
          checked = "";
          hidden="";
          
          if(props.relationshipSet.includes(itemsOrdered[property].dataArray[i]._id)===false) {
            hidden = "hidden";
          }
          
          if(preFilterSet.length > 0) {
            if(preFilterSet.includes(itemsOrdered[property].dataArray[i]._id)===true) {
              checked = "defaultChecked";
            }
          }
          
          itemsOrdered[property].dataArray[i].inputType = inputType;
          itemsOrdered[property].dataArray[i].disabled = disabled;
          itemsOrdered[property].dataArray[i].checked = checked;
          itemsOrdered[property].dataArray[i].hidden = hidden;
        }
      }
      return itemsOrdered;
    }

    if (!props.loading) {
      let itemsUpdated = updateInfo(itemsOrdered);
      setItemsUpdated(itemsUpdated);
      setLoading(false);
    }
  },[props.loading, props.filtersType, props.filtersSet, props.relationshipSet, itemsOrdered])
  
  const updateOrganisationType = (e) => {
    let val = e.target.value;
    setOrganisationType(val);
  }

  const toggleFilter = (_id=null) => {
    let filters = props.filtersSet;
    if (filters.includes(_id)===false) {
      filters.push(_id);
    }
    else{
      filters.splice(filters.indexOf(_id), 1);
    }
    props.updateFilters(props.filtersType.name,filters);
    setLoading(true);
  }
    
  const clearFilters = () => {
    props.updateFilters(props.filtersType.name,[]);
    setLoading(true);
  }
  
  let optionType = [];
  if(Object.keys(itemsUpdated).length > 0) {
    optionType.push(<option key="all" value="all">All</option>);
    for(var propertyData in itemsUpdated) {
      optionType.push(<option key={propertyData} value={propertyData}>{propertyData}</option>);
    }
  }
  let optionTypeSelection = <FormGroup>
        <Input type="select" name="organisationType" value={organisationType} onChange={(e)=>updateOrganisationType(e)} /*bsSize="sm"*/>
          {optionType}
        </Input>
      </FormGroup>
  
  let filterItemsSeleted = [];
  let filterItemsUnseleted = [];
  if(loading !== true) {
    if(Object.keys(itemsUpdated).length > 0) {
      let dataLabelType = "";
      if(props.filtersType.layer[1] === "data") {
        dataLabelType = " filter-label";
      }
      for(var property in itemsUpdated) {
        let dataItemsUnSeleted = [];
        let dataItemsSeleted = [];
        for(let i=0;i<itemsUpdated[property].dataArray.length;i++) {
          let item = itemsUpdated[property].dataArray[i];
          if(item.checked === "defaultChecked") {
            dataItemsSeleted.push(
              <FormGroup key={item._id}>
                <Label className={item.hidden+dataLabelType}>
                  <Input type={item.inputType} name={props.filtersType.name} onClick={()=>toggleFilter(item._id)} onChange={()=>{}} disabled={item.disabled} checked={item.checked}/>{' '}
                  <span className="filter-span">{item.label}</span>
                </Label>
              </FormGroup>
            );
          }
          else {
            if ((organisationType === "all") || (organisationType === property)) {
              dataItemsUnSeleted.push(
                <FormGroup key={item._id}>
                  <Label className={item.hidden}>
                    <Input type={item.inputType} name={props.filtersType.name} onClick={()=>toggleFilter(item._id)} onChange={()=>{}} disabled={item.disabled} checked={item.checked}/>{' '}
                    <span className="filter-span">{item.label}</span>
                  </Label>
                </FormGroup>
              );
            }
          }
        }
        if(dataItemsSeleted.length > 0) {
          if(filterItemsSeleted.length === 0) {
            filterItemsSeleted.push(
              <FormGroup key="Seleted">
                <label>Seleted</label>
              </FormGroup>
            );
          }
          let item = itemsUpdated[property];
          filterItemsSeleted.push(
            <FormGroup key={item._id}>
              <Label className={item.hidden}>
                <Input type={item.inputType} name={props.filtersType.name} onClick={()=>toggleFilter(item._id)} onChange={()=>{}} disabled={item.disabled} checked={item.checked}/>{' '}
                <span className="filter-span">{item.label}</span>
              </Label>
              {dataItemsSeleted}
            </FormGroup>
          );
        }
        
        if(dataItemsUnSeleted.length > 0) {
          filterItemsUnseleted.push(dataItemsUnSeleted);
        }
      }
    }
  }
  return (
    <div className="filter-block">
      <Card>
        <CardBody>
          <h4>{props.label}
            <small className="pull-right clear-filters" onClick={()=>{clearFilters()}}>clear <i className="fa fa-times-circle"/></small>
          </h4>
          <div className="filter-body">
            {filterItemsSeleted}
            <div className="filter-options-container">
              {optionTypeSelection}
            </div>
            <div className="filter-unseleted-container">
              {filterItemsUnseleted}
            </div>
          </div>
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
  filtersSet: PropTypes.array,
  relationshipSet: PropTypes.array,
  filtersType: PropTypes.object.isRequired,
  items: PropTypes.array,
  itemsType: PropTypes.array,
  label: PropTypes.string,
  relationType: PropTypes.string,
  updateFilters: PropTypes.func,
}

export default Filter;
