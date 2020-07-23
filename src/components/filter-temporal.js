import React, {useState, useEffect, useRef, lazy, Suspense} from 'react';
import {
  Form,FormGroup, Input,
  Card, CardBody,
  Button,
} from 'reactstrap';
import PropTypes from 'prop-types';
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import {renderLoader} from '../helpers';
const DatePicker = lazy(() => import("react-datepicker"));

const FilterTemporal = props => {
  const [loading, setLoading] = useState(true);
  const [dateType,setDateType] = useState("exact");
  const [startDate,setStartDate] = useState("");
  const [endDate,setEndDate] = useState("");
  const prevFiltersSetRef = useRef(null);
  const updateDateType = (e) => {
    let val = e.target.value;
    setDateType(val);
    if (val!=="exact") {
      setEndDate("");
    }
  }

  let filtersType = props.filtersType;
  let filtersSet = props.filtersSet;
  let updateFilters = props.updateFilters;

  useEffect(()=>{
    const load = () => {
      setLoading(false);
      if (filtersSet.startDate!=="") {
        let newSD = moment(filtersSet.startDate, "DD-MM-YYYY").valueOf();
        setStartDate(newSD);
      }
      if (filtersSet.endDate!=="") {
        let newED = moment(filtersSet.endDate, "DD-MM-YYYY").valueOf();
        setEndDate(newED);
      }
      setDateType(filtersSet.dateType);
    }
    if (loading) {
      load();
    }
  },[loading, filtersSet]);

  useEffect(()=>{
    if (prevFiltersSetRef.current!==null && filtersSet.startDate==="") {
      setDateType("exact");
      setStartDate("");
      setEndDate("");
      let payload = {
        dateType: "exact",
        startDate: "",
        endDate: "",
      }
      updateFilters(filtersType,payload);
    }
    prevFiltersSetRef.current = filtersSet.startDate;
  },[updateFilters,filtersSet,filtersType]);

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

  const normalizeDate = (date) => {
    let dateArr = date.split("/");
    let m = dateArr[0];
    let d = dateArr[1];
    let y = dateArr[2];
    return `${d}/${m}/${y}`;
  }

  const submit = (e) => {
    e.preventDefault();

    let newStartDate = startDate;
    if(newStartDate!==""){
      newStartDate = new Intl.DateTimeFormat('en-US').format(startDate);
      newStartDate = normalizeDate(newStartDate);
    }
    let newEndDate = endDate;
    if(newEndDate!==""){
      newEndDate = new Intl.DateTimeFormat('en-US').format(endDate);
      newEndDate = normalizeDate(newEndDate);
    }
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
              <Input type="select" name="dateType" value={dateType} onChange={(e)=>updateDateType(e)} className="filter-type-dropdown">
                <option value="exact">Exact</option>
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="range">In range</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <label className={endDateHidden}>Date</label>
              <label className={endDateVisible}>Start date</label>
              <Suspense fallback={renderLoader()}>
                <DatePicker
                  selected={startDate}
                  onChange={(val)=>setStartDate(val)}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  />
              </Suspense>
            </FormGroup>
            <FormGroup className={endDateVisible}>
              <label>End date</label>
              <Suspense fallback={renderLoader()}>
                <DatePicker
                  selected={endDate}
                  onChange={(val)=>setEndDate(val)}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  />
              </Suspense>
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
  filtersType: "",
  items: [],
  itemsType: [],
  label: "",
  relationType: "",
}

FilterTemporal.propTypes = {
  filtersSet: PropTypes.object,
  relationshipSet: PropTypes.array,
  filtersType: PropTypes.string.isRequired,
  items: PropTypes.array,
  itemsType: PropTypes.array,
  label: PropTypes.string,
  relationType: PropTypes.string,
  updateFilters: PropTypes.func,
}

export default FilterTemporal;
