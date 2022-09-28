import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Button,
  FormGroup,
  InputGroup,
  Input,
  Label,
  Spinner,
} from 'reactstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  outputEvent,
  outputOrganisation,
  outputPerson,
  outputResource,
} from '../../../helpers';
import Pagination from '../../Pagination';

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function Results(props) {
  const { centerNode, selectNode, submitType } = props;

  const [input, setInput] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [items, setItems] = useState([]);
  const [searching, setSearching] = useState(false);

  const [resultsOpen, setResultsOpen] = useState(true);

  const prevPage = useRef();

  const handleChange = (e) => {
    const { target } = e;
    const { value = '', name = '' } = target;
    switch (name) {
      case 'search-input':
        setInput(value);
        break;
      case 'search-type':
        setType(value);
        break;
      default:
        break;
    }
  };

  const clearInput = () => {
    setInput('');
    setType('');
  };

  const search = useCallback(
    async (e = null) => {
      if (e !== null) {
        e.preventDefault();
      }
      if (input.length > 0) {
        if (!searching) {
          setSearching(true);
          const responseData = await axios({
            method: 'get',
            url: `${APIPath}network-find-node`,
            crossDomain: true,
            params: {
              label: input,
              type,
              page,
            },
          })
            .then((response) => response.data)
            .catch((error) => console.log(error));
          const { data: Rdata = null } = responseData;
          setItems(Rdata.data);
          setTotal(Rdata.totalPages);
          setTotalItems(Rdata.count);
          setResultsOpen(true);
          setSearching(false);
        }
      }
    },
    [input, page, type, searching]
  );

  useEffect(() => {
    if (prevPage.current !== page) {
      prevPage.current = page;
      search();
    }
  }, [page, search]);

  const toggleVisible = useCallback(() => {
    setResultsOpen(!resultsOpen);
  }, [resultsOpen]);

  const clickNode = useCallback(
    (_id) => {
      centerNode(_id);
      setInput('');
      setItems([]);
    },
    [centerNode]
  );

  const selectedNode = useCallback(
    (_id, nodeType) => {
      const copy = [...items];
      const { length } = copy;
      for (let i = 0; i < length; i += 1) {
        copy[i].selected = false;
      }
      const idx = copy.findIndex((item) => item._id === _id);
      const copyItem = { ...copy[idx] };
      copyItem.selected = true;
      copy[idx] = copyItem;
      selectNode(copyItem, nodeType);
      setInput('');
      setItems(copy);
      toggleVisible();
    },
    [selectNode, items, toggleVisible]
  );

  const outputResult = useCallback(
    (n) => {
      const { _id, label, systemLabel, selected = false } = n;
      let outputLabel;
      let color;
      switch (systemLabel) {
        case 'Classpiece':
          outputLabel = outputResource(n);
          color = '#1ed8bf';
          break;
        case 'Event':
          outputLabel = outputEvent(n);
          color = '#f9cd1b';
          break;
        case 'Organisation':
          outputLabel = outputOrganisation(n);
          color = '#9b8cf2';
          break;
        case 'Person':
          outputLabel = outputPerson(n);
          color = '#5dc910';
          break;
        case 'Resource':
          outputLabel = outputResource(n);
          color = '#00cbff';
          break;
        default:
          outputLabel = label;
          color = '#1ed8bf';
          break;
      }
      let output = null;
      const selectedClass = selected ? ' selected' : '';
      const link = (
        <Link
          to={`/${systemLabel}/${_id}`}
          target="_blank"
          className="btn btn-outline-secondary btn-sm d-block w-100"
        >
          Details <i className="fa fa-external-link-alt" />
        </Link>
      );
      switch (submitType) {
        case 'simple':
          output = (
            <li key={_id}>
              <div className="details">
                <div
                  className="color-code"
                  style={{ backgroundColor: color }}
                />
                <div className="label">{outputLabel}</div>
                <div className="actions">
                  <Button
                    color="secondary"
                    outline
                    size="sm"
                    onClick={() => clickNode(_id)}
                    block
                  >
                    Go to node <i className="fa fa-chevron-right" />
                  </Button>
                  {link}
                </div>
              </div>
            </li>
          );
          break;
        case 'source':
          output = (
            <li key={_id} className={selectedClass}>
              <div className="details">
                <div
                  className="color-code"
                  style={{ backgroundColor: color }}
                />
                <div className="label">{outputLabel}</div>
                <div className="actions">
                  <Button
                    color="secondary"
                    outline
                    size="sm"
                    onClick={() => selectedNode(_id, 'source')}
                    block
                  >
                    Select node <i className="fa fa-double-check" />
                  </Button>
                  {link}
                </div>
              </div>
            </li>
          );
          break;
        case 'target':
          output = (
            <li key={_id} className={selectedClass}>
              <div className="color-code" style={{ backgroundColor: color }} />
              <div className="details">
                <div className="label">{outputLabel}</div>
                <div className="actions">
                  <Button
                    color="secondary"
                    outline
                    size="sm"
                    onClick={() => selectedNode(_id, 'target')}
                    block
                  >
                    Select node <i className="fa fa-double-check" />
                  </Button>
                  {link}
                </div>
              </div>
            </li>
          );
          break;
        default:
          output = null;
      }
      return output;
    },
    [submitType, clickNode, selectedNode]
  );

  let searchResultsOutput = null;
  if (items.length > 0 && !searching) {
    let visibleClass = '';
    let visibleIcon = '';
    if (!resultsOpen) {
      visibleClass = ' item-hidden';
      visibleIcon = ' closed';
    }
    searchResultsOutput = (
      <>
        <div className="graph-search-results-container">
          <div style={{ textAlign: 'left', flexGrow: 1 }}>
            Total: {totalItems}
          </div>
          <Pagination
            limit={25}
            currentPage={page}
            totalPages={total}
            paginationFn={setPage}
            className="mini"
          />
          <button
            className="btn btn-default btn-xs pull-right toggle-info-btn"
            onClick={toggleVisible}
            type="button"
          >
            <i className={`fa fa-angle-down${visibleIcon}`} />
          </button>
        </div>
        <ul className={`graph-search-results${visibleClass}`}>
          {items.map((n) => outputResult(n))}
        </ul>
      </>
    );
  } else if (items.length > 0 && searching) {
    searchResultsOutput = (
      <div
        style={{
          padding: '40pt',
          textAlign: 'center',
          height: '328px',
          display: 'block',
        }}
      >
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>
    );
  }
  const chk1 = type === '';

  let formLabel;
  switch (submitType) {
    case 'simple':
      formLabel = 'Label';
      break;
    case 'source':
      formLabel = 'Source label';
      break;
    case 'target':
      formLabel = 'Target label';
      break;
    default:
      formLabel = 'Label';
      break;
  }

  const searchingSpinner = searching ? (
    <Spinner color="primary" size="sm" className="graph-search-spinner">
      Loading...
    </Spinner>
  ) : null;

  return (
    <>
      <form onSubmit={(e) => search(e, 'simple')} style={{ paddingTop: '4px' }}>
        <FormGroup>
          <Label>{formLabel}</Label>
          <InputGroup>
            <Input
              type="text"
              name="search-input"
              value={input}
              placeholder="Enter search term..."
              onChange={(e) => handleChange(e)}
            />
            {searchingSpinner}
            <Button
              type="button"
              color="secondary"
              outline
              size="sm"
              onClick={() => clearInput()}
            >
              <i className="fa fa-times-circle" />
            </Button>
            <Button type="submit" color="success" size="sm">
              <i className="fa fa-search" />
            </Button>
          </InputGroup>
        </FormGroup>
        <FormGroup className="graph-search-checkboxes">
          <Label>
            <Input
              name="search-type"
              type="radio"
              value=""
              onChange={(e) => handleChange(e)}
              checked={chk1}
            />{' '}
            All
          </Label>
          <Label>
            <span
              className="radio-color-code"
              style={{ backgroundColor: '#1ed8bf' }}
            />
            <Input
              name="search-type"
              type="radio"
              value="Classpiece"
              onChange={(e) => handleChange(e)}
            />{' '}
            Classpiece
          </Label>
          <Label>
            <span
              className="radio-color-code"
              style={{ backgroundColor: '#f9cd1b' }}
            />
            <Input
              name="search-type"
              type="radio"
              value="Event"
              onChange={(e) => handleChange(e)}
            />{' '}
            Event
          </Label>
          <Label>
            <span
              className="radio-color-code"
              style={{ backgroundColor: '#9b8cf2' }}
            />
            <Input
              name="search-type"
              type="radio"
              value="Organisation"
              onChange={(e) => handleChange(e)}
            />{' '}
            Organisation
          </Label>
          <Label>
            <span
              className="radio-color-code"
              style={{ backgroundColor: '#5dc910' }}
            />
            <Input
              name="search-type"
              type="radio"
              value="Person"
              onChange={(e) => handleChange(e)}
            />{' '}
            Person
          </Label>
          <Label>
            <span
              className="radio-color-code"
              style={{ backgroundColor: '#00cbff' }}
            />
            <Input
              name="search-type"
              type="radio"
              value="Resource"
              onChange={(e) => handleChange(e)}
            />{' '}
            Resource
          </Label>
        </FormGroup>
      </form>
      {searchResultsOutput}
    </>
  );
}

Results.defaultProps = {
  submitType: 'simple',
  centerNode: () => {},
  selectNode: () => {},
};
Results.propTypes = {
  submitType: PropTypes.string,
  centerNode: PropTypes.func,
  selectNode: PropTypes.func,
};
