import React, {useState} from 'react';
import DatePicker from "react-datepicker";
import {
  Form,FormGroup, Input,
  Card, CardBody,
  Button,
} from 'reactstrap';
import PropTypes from 'prop-types';

import "react-datepicker/dist/react-datepicker.css";

const FilterTemporal = props => {
  const [dateType,setDateType] = useState("exact");
  const [startDate,setStartDate] = useState();
  const [endDate,setEndDate] = useState();

  const updateDateType = (e) => {
    let val = e.target.value;
    setDateType(val);
    if (val!=="exact") {
      setEndDate("");
    }
  }
  const clearFilters = () => {
    setDateType("exact");
    setStartDate("");
    setEndDate("");
    let payload = {
      dateType: "exact",
      startDate: "",
      endDate: "",
    }
    props.updateFilters("temporals",payload);
  }

  const submit = (e) => {
    e.preventDefault();

    let newStartDate = new Intl.DateTimeFormat('en-US').format(startDate);
    let newEndDate = new Intl.DateTimeFormat('en-US').format(endDate);
    let payload = {
      dateType: dateType,
      startDate: newStartDate,
      endDate: newEndDate,
    }
    props.updateFilters("temporals",payload);
  }

  let endDateVisible = " hidden";
  let endDateHidden = "";
  if (dateType==="range") {
    endDateVisible = "";
    endDateHidden = " hidden";
  }
  return (
    <div className="filter-block">
      <Card>
        <CardBody>
          <h4>{props.label}
            <small className="pull-right clear-filters" onClick={()=>{clearFilters()}}>clear <i className="fa fa-times-circle"/></small>
          </h4>
          <Form onSubmit={(e)=>submit(e)}>
            <FormGroup>
              <Input type="select" name="dateType" onChange={(e)=>updateDateType(e)}>
                <option value="exact">Exact</option>
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="range">In range</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <label className={endDateHidden}>Date</label>
              <label className={endDateVisible}>Start date</label>
              <DatePicker
                selected={startDate}
                onChange={(val)=>setStartDate(val)}
                dateFormat="dd/MM/yyyy"
                showMonthDropdown
                showYearDropdown
                />
            </FormGroup>
            <FormGroup className={endDateVisible}>
              <label>End date</label>
              <DatePicker
                selected={endDate}
                onChange={(val)=>setEndDate(val)}
                dateFormat="dd/MM/yyyy"
                showMonthDropdown
                showYearDropdown
                />
            </FormGroup>
            <div className="text-center">
              <Button size="sm" outline>Submit</Button>
            </div>
          </Form>
        </CardBody>
      </Card>

    </div>
  )
}

FilterTemporal.defaultProps = {
  filtersSet: {},
  relationshipSet: [],
  filtersType: {},
  items: [],
  itemsType: [],
  label: "",
  relationType: "",
}

FilterTemporal.propTypes = {
  filtersSet: PropTypes.object,
  relationshipSet: PropTypes.array,
  filtersType: PropTypes.object.isRequired,
  items: PropTypes.array,
  itemsType: PropTypes.array,
  label: PropTypes.string,
  relationType: PropTypes.string,
  updateFilters: PropTypes.func,
}

export default FilterTemporal;
