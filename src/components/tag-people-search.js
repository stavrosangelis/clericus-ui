import React, { useState } from 'react';
import {
  Button,
  Form, Input, InputGroup, InputGroupAddon,
  Collapse,
} from 'reactstrap';

const TagPeopleSearch = props => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [peopleDataVisible, setPeopleDataVisible] = useState(false);
  const [simpleSearchSet, setSimpleSearchSet] = useState('');
  const [simpleSearchTerm, setSimpleSearchTerm] = useState('');
  let nameComponent = props.name+"_";

  const handleSearchTermChange = e => {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    if(name === "simpleSearchTerm"){
      setSimpleSearchTerm(value);
    }
  }
  
  const simpleSearch = e =>{
    e.preventDefault();
    document.getElementById("simpleSearchTerm").blur();
    setSimpleSearchSet(simpleSearchTerm);
  }
  
  const clearSearch = e =>{
    setSimpleSearchTerm('');
    setSimpleSearchSet('');
  }

  const toggleTable = (e, dataType=null) =>{
    if(dataType === "peopleData") {
      setPeopleDataVisible(!peopleDataVisible);
    }
  }
  
  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  }

  let peopleRow = [];
  if (typeof props.peopleItem!=="undefined" && props.peopleItem!==null && props.peopleItem!=="") {
    //props.peopleItem = []
    if(Object.keys(props.peopleItem).length === 0) {
      peopleRow = <tr key={nameComponent+"peopleRow"}>
                  <th>People</th>
                  <td/>
                </tr>;
    }
    //props.peopleItem = {...} 
    else {
      let peopleDataHiden_container = "";
      let peopleDataHiden_icon = "";
      if(!peopleDataVisible){
        peopleDataHiden_container = " closed";
        peopleDataHiden_icon = " closed";
        if(searchVisible){
          peopleDataHiden_container = " closedWithSearch";
        }
      }
      
      let peopleDataExpand = [];
      if(!peopleDataVisible){
        peopleDataExpand = <li key={nameComponent+"dot"} ><i className="tag-bg tag-item" onClick={(e)=>{toggleTable(e,"peopleData")}}>...</i></li>;
      }
      
      let peopleData = props.peopleItem.map(eachItem=>{
        if(!eachItem.ref.label.toLowerCase().includes(simpleSearchSet.toLowerCase())){
          return null;
        }
        return <li key={nameComponent+eachItem.ref._id} ><a className="tag-bg tag-item" href={"/person/"+eachItem.ref._id}>{eachItem.ref.label}</a></li>
      })
      
      peopleRow = <tr key={nameComponent+"peopleRow"}>
                    <th>People</th>
                    <td>
                      <div className={"people-info-container"+peopleDataHiden_container}>
                        <div className="btn btn-default btn-xs pull-right toggle-info-btn pull-icon-middle" onClick={(e)=>{toggleTable(e,"peopleData")}}>
                          <i className={"fa fa-angle-down"+peopleDataHiden_icon}/>
                        </div>
                        
                        <div className="tool-box pull-right classpiece-search">
                          <div className="action-trigger" onClick={()=>toggleSearch()} id="search-tooltip">
                            <i className="fa fa-search" />
                          </div>
                        </div>
                        
                        <Collapse isOpen={searchVisible}>
                          <Form>
                            <InputGroup size="sm" className="search-dropdown-inputgroup classpiece-people-search-input">
                                <Input className="simple-search-input" list="data" type="text" id="simpleSearchTerm" name="simpleSearchTerm" onChange={handleSearchTermChange} placeholder="Search..." value={simpleSearchTerm}/>
                                  <datalist id="data">
                                    {props.peopleItem.map((item, key) =>
                                      <option key={nameComponent+key} value={item.ref.label} />
                                    )}
                                  </datalist>
                                
                                <InputGroupAddon addonType="append">
                                  <Button size="sm" outline type="button" onClick={clearSearch} className="clear-search">
                                    <i className="fa fa-times-circle" />
                                  </Button>
                                  <Button size="sm" type="submit" onClick={simpleSearch}>
                                    <i className="fa fa-search" />
                                  </Button>
                              </InputGroupAddon>
                            </InputGroup>
                          </Form>
                        </Collapse>
                        
                        <ul className="tag-list tag-list-people">
                          {peopleDataExpand}{peopleData}
                        </ul>
                      </div>
                    </td>
                  </tr>;
    }
  }
  return (
    peopleRow
  )
}

export default TagPeopleSearch;
