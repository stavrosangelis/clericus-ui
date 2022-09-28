import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardBody,
  Button,
} from 'reactstrap';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { renderLoader } from '../helpers';

const DatePicker = lazy(() => import('react-datepicker'));

function FilterTemporal(props) {
  // state
  const [loading, setLoading] = useState(true);
  const [dateType, setDateType] = useState('exact');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const prevFiltersSetRef = useRef(null);

  // props
  const { label, filtersType, filtersSet, updateFilters } = props;

  const updateDateType = (e) => {
    const { value } = e.target;
    setDateType(value);
    if (value !== 'exact') {
      setEndDate('');
    }
  };

  const normalizeDate = (date) => {
    const dateArr = date.split('/');
    const m = dateArr[0];
    const d = dateArr[1];
    const y = dateArr[2];
    return `${d}/${m}/${y}`;
  };

  const updateStartDate = (value = '') => {
    setStartDate(value);
    let val = new Intl.DateTimeFormat('en-US').format(value);
    val = normalizeDate(val);
    prevFiltersSetRef.current = val;
  };

  useEffect(() => {
    const load = () => {
      setLoading(false);
      if (filtersSet.startDate !== '') {
        const newSD = moment(filtersSet.startDate, 'DD-MM-YYYY').valueOf();
        setStartDate(newSD);
      }
      if (filtersSet.endDate !== '') {
        const newED = moment(filtersSet.endDate, 'DD-MM-YYYY').valueOf();
        setEndDate(newED);
      }
      setDateType(filtersSet.dateType);
      prevFiltersSetRef.current = filtersSet.startDate;
    };
    if (loading) {
      load();
    }
  }, [loading, filtersSet]);

  useEffect(() => {
    if (
      prevFiltersSetRef.current !== null &&
      prevFiltersSetRef.current !== filtersSet.startDate &&
      filtersSet.startDate === ''
    ) {
      prevFiltersSetRef.current = filtersSet.startDate;
      setDateType('exact');
      setStartDate('');
      setEndDate('');
      const payload = {
        dateType: 'exact',
        startDate: '',
        endDate: '',
      };
      updateFilters(filtersType, payload);
    }
  }, [updateFilters, filtersSet, filtersType]);

  const clearFilters = () => {
    setDateType('exact');
    setStartDate('');
    setEndDate('');
    const payload = {
      dateType: 'exact',
      startDate: '',
      endDate: '',
    };
    updateFilters('temporals', payload);
  };

  const submit = (e) => {
    e.preventDefault();

    let newStartDate = startDate;
    if (newStartDate !== '') {
      newStartDate = new Intl.DateTimeFormat('en-US').format(startDate);
      newStartDate = normalizeDate(newStartDate);
    }
    let newEndDate = endDate;
    if (newEndDate !== '') {
      newEndDate = new Intl.DateTimeFormat('en-US').format(endDate);
      newEndDate = normalizeDate(newEndDate);
    }
    const payload = {
      dateType,
      startDate: newStartDate,
      endDate: newEndDate,
    };
    updateFilters('temporals', payload);
  };
  let endDateVisible = ' hidden';
  let endDateHidden = '';
  if (dateType === 'range') {
    endDateVisible = '';
    endDateHidden = ' hidden';
  }
  return (
    <div className="filter-block">
      <Card>
        <CardBody>
          <h4>
            {label}
            <small
              className="pull-right clear-filters"
              onClick={() => {
                clearFilters();
              }}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear filters"
            >
              clear <i className="fa fa-times-circle" />
            </small>
          </h4>
          <Form onSubmit={(e) => submit(e)}>
            <FormGroup>
              <Input
                type="select"
                name="dateType"
                value={dateType}
                onChange={(e) => updateDateType(e)}
                className="filter-type-dropdown"
              >
                <option value="exact">Exact</option>
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="range">In range</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label className={endDateHidden}>Date</Label>
              <Label className={endDateVisible}>Start date</Label>
              <Suspense fallback={renderLoader()}>
                <DatePicker
                  selected={startDate}
                  onChange={(value) => updateStartDate(value)}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                />
              </Suspense>
            </FormGroup>
            <FormGroup className={endDateVisible}>
              <Label>End date</Label>
              <Suspense fallback={renderLoader()}>
                <DatePicker
                  selected={endDate}
                  onChange={(val) => setEndDate(val)}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                />
              </Suspense>
            </FormGroup>
            <div className="text-center">
              <Button size="sm" outline>
                Submit
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}

FilterTemporal.defaultProps = {
  filtersSet: {},
  label: '',
  updateFilters: () => {},
};

FilterTemporal.propTypes = {
  filtersSet: PropTypes.object,
  filtersType: PropTypes.string.isRequired,
  label: PropTypes.string,
  updateFilters: PropTypes.func,
};

export default FilterTemporal;
