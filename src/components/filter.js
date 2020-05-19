import React, {useState, useEffect} from 'react';
import {
  FormGroup, Label, Input,
  Card, CardBody
} from 'reactstrap';
import PropTypes from 'prop-types';

const Filter = props => {
  const [filterItems,setFilterItems] = useState([]);
  useEffect(()=> {
    const toggleFilter = (arrayName="", layer="", _id=null, label) => {
      let filters = props.filtersSet;
      if(typeof filters[layer][arrayName] === "undefined") {
        filters[layer][arrayName] = [];
        if(layer === "data") {
          filters["dataName"][arrayName] = [];
        }
      }
      if (filters[layer][arrayName].includes(_id)===false) {
        filters[layer][arrayName].push(_id);
        if(layer === "data") {
          filters["dataName"][arrayName].push(label);
        }
      }
      else{
        filters[layer][arrayName].splice(filters[layer][arrayName].indexOf(_id), 1);
        if(layer === "data") {
          filters["dataName"][arrayName].splice(filters["dataName"][arrayName].indexOf(label), 1);
        }
      }
      props.updateFilters(props.filtersType.name,filters);
    }
    const prepareFilterItemsByLayer = (layerIndex=null, itemsOrdered=null, relationItems=null, itemType = null) => {
      if(layerIndex >= props.filtersType.layer.length) {
        return null;
      }
      
      let output = [];
      let disabled = "", checked = "";
      let preFilterSet = props.filtersSet;
      let labelType = "";
      for(var property in itemsOrdered[`${props.filtersType.layer[layerIndex]}`]) {
        if((itemType !== null) && (itemType !== property)) {
          continue;
        }
        let arrayName = property;
        let item = {
          label: property, 
          _id: itemsOrdered[`${props.filtersType.layer[layerIndex]}`][property],
        }
        if(props.filtersType.layer[layerIndex] === "data") {
          item.label = itemsOrdered["dataName"][property];
        }
        let hidden = "";
        for(let i=0;i<item._id.length;i++) {
          let inputType="checkbox";
          disabled = "";
          checked="";
          hidden = "";
          let label = "";
          if(item._id.length > 1) {
            label = item.label[i];
          }else {
            label = item.label;
          }

          if(props.filtersType.layer[layerIndex] !== "type") {
            if(relationItems.includes(item._id[i])===false) {
              disabled = "disabled";
              hidden = "hidden";
            }else {
              labelType = " filter-label";
            }
          }else {
            if(props.filtersType.typeFilterDisable === true) {
              inputType = "radio";
              disabled = "disabled";
            }
          }

          if(Object.keys(preFilterSet).length > 0) {
            if(typeof preFilterSet[`${props.filtersType.layer[layerIndex]}`][property] !== "undefined") {
              if(Object.keys(preFilterSet[`${props.filtersType.layer[layerIndex]}`]).length > 0){
                if(preFilterSet[`${props.filtersType.layer[layerIndex]}`][property].includes(item._id[i])!==false) {
                  checked = "defaultChecked";
                }
              }
            }
          }

          let filterItem = <FormGroup key={item._id[i]}>
                <Label className={hidden+labelType}>
                  <Input type={inputType} name={props.filtersType.name} onClick={()=>toggleFilter(arrayName,props.filtersType.layer[layerIndex],item._id[i], label)} onChange={()=>{}} disabled={disabled} checked={checked}/>{' '}
                  <span className="filter-span">{label}</span>
                </Label>
                {prepareFilterItemsByLayer(layerIndex+1, itemsOrdered, relationItems, property)}
              </FormGroup>
          output.push(filterItem);
        }
      }
      return output;
    }
    const orderDataItems = (typeOnly=null, dataItems=null) => {
      let dataOrdered = {
        type: {},
        data: {},
        dataName: {},
      };
      let dataTypeNum = 0;
      for (let dataIndex=0;dataIndex<dataItems.length; dataIndex++) {
        for (let typeIndex=0;typeIndex<props.itemsType.length; typeIndex++) {
          if(dataItems[dataIndex][`${props.filtersType.compareData.dataSet}`] === props.itemsType[typeIndex][`${props.filtersType.compareData.typeSet}`]) {
            if(typeof dataOrdered.type[`${props.itemsType[typeIndex].label}`] === "undefined") {
              dataOrdered.type[`${props.itemsType[typeIndex].label}`] = [];
            }
            if(!dataOrdered.type[`${props.itemsType[typeIndex].label}`].includes(props.itemsType[typeIndex][`${props.filtersType.compareData.typeSet}`])) {
              dataOrdered.type[`${props.itemsType[typeIndex].label}`].push(props.itemsType[typeIndex][`${props.filtersType.compareData.typeSet}`]);
              dataOrdered.data[`${props.itemsType[typeIndex].label}`]=[];
              dataOrdered.dataName[`${props.itemsType[typeIndex].label}`]=[];
              dataTypeNum++;
            }
            dataOrdered.data[`${props.itemsType[typeIndex].label}`].push(dataItems[dataIndex]._id);
            dataOrdered.dataName[`${props.itemsType[typeIndex].label}`].push(dataItems[dataIndex].label);

            continue;
          }
        }
        if((dataTypeNum === props.itemsType.length) && (typeOnly)) {
          break;
        }
      }
      return dataOrdered;
    }
    const prepareFilterItems = () => {
      let itemsOrdered = []

      if(props.filtersType.layer.includes("type") && (props.filtersType.layer.length === 1)) {
        itemsOrdered = orderDataItems(true, props.items);
      }else {
        itemsOrdered = orderDataItems(false, props.items);
      }

      let layerIndex = 0;
      let filterItem = prepareFilterItemsByLayer(layerIndex, itemsOrdered, props.relationshipSet, null);
      setFilterItems(filterItem);
    }
    prepareFilterItems();
  },[props])

  const clearFilters = () => {
    props.updateFilters(props.filtersType.name,{type: [], data: [], dataName: []});
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
  filtersSet: {},
  relationshipSet: [],
  filtersType: {},
  items: [],
  itemsType: [],
  label: "",
  relationType: "",
}

Filter.propTypes = {
  filtersSet: PropTypes.object,
  relationshipSet: PropTypes.array,
  filtersType: PropTypes.object.isRequired,
  items: PropTypes.array,
  itemsType: PropTypes.array,
  label: PropTypes.string,
  relationType: PropTypes.string,
  updateFilters: PropTypes.func,
}

export default Filter;
