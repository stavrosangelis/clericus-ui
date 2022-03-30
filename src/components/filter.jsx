import React, { useEffect, useRef, useState } from 'react';
import { FormGroup, Label, Input, Card, CardBody } from 'reactstrap';
import PropTypes from 'prop-types';
import LazyList from './lazylist';

const prepareOptions = (itemsParam = [], sepParam = '', filtersType = '') => {
  let output = [];
  itemsParam.forEach((item) => {
    const { children = [], _id, label, labelId } = item;
    let sep = sepParam !== '' ? `${sepParam}- ` : sepParam;
    const optionLabel = `${sep}${label}`;
    let value = _id;
    if (
      filtersType === 'organisations' ||
      filtersType === 'organisationType' ||
      filtersType === 'personType'
    ) {
      value = labelId;
    }
    const option = (
      <option key={_id} value={value}>
        {optionLabel}
      </option>
    );
    output.push(option);
    if (children.length > 0) {
      sep += '-';
      const childrenItems = prepareOptions(children, sep);
      output = [...output, ...childrenItems];
    }
  });
  return output;
};

const Filter = (props) => {
  // state
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState([]);
  const [filterItems, setFilterItems] = useState([]);
  const [filtersTypes, setFiltersTypes] = useState([]);
  const [filterType, setFilterType] = useState('');
  const prevFiltersSetRef = useRef(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const prevId = useRef(null);
  const prevRelationshipSet = useRef([]);

  // props
  const {
    items,
    filtersSet,
    relationshipSet,
    filtersType,
    loading: propsLoading,
    updateFilters,
    updateType: propsUpdateType,
    itemsType,
    label,
  } = props;

  useEffect(() => {
    const load = () => {
      const flattenItems = (itemsParam, parentId = null) => {
        let newItems = [];
        const { length } = itemsParam;
        for (let i = 0; i < length; i += 1) {
          const item = itemsParam[i];
          if (parentId !== null) {
            item.parentId = parentId;
          }
          const itemCopy = { ...item };
          if (typeof item.children !== 'undefined') {
            delete itemCopy.children;
          }
          newItems.push(itemCopy);
          let parentIds = [];
          if (parentId === null) {
            parentIds.push(item._id);
          } else {
            parentIds = [...parentId, item._id];
          }
          if (item.children?.length > 0) {
            newItems = [...newItems, ...flattenItems(item.children, parentIds)];
          }
        }
        return newItems;
      };

      const flatItems = flattenItems(items);

      const parentIds = [];
      if (Array.isArray(filtersSet)) {
        const selectedItems = flatItems.filter(
          (i) => filtersSet?.indexOf(i._id) > -1
        );
        if (typeof selectedItems !== 'undefined') {
          const { length: sLength } = selectedItems;
          for (let skey = 0; skey < sLength; skey += 1) {
            const selectedItem = selectedItems[skey];
            if (typeof selectedItem.parentId !== 'undefined') {
              for (
                let pkey = 0;
                pkey < selectedItem.parentId.length;
                pkey += 1
              ) {
                const pId = selectedItem.parentId[pkey];
                if (parentIds.indexOf(pId) === -1) {
                  parentIds.push(pId);
                }
              }
            }
          }
        }
      }
      const newFilterItems = [];
      const newFilterItemsIds = [];
      const { length: fLength } = flatItems;
      for (let i = 0; i < fLength; i += 1) {
        const item = flatItems[i];
        if (Array.isArray(filtersSet) && filtersSet.indexOf(item._id) > -1) {
          item.checked = true;
        } else {
          item.checked = false;
        }
        item.i = i;
        let skip = false;
        if (
          relationshipSet.length > 0 &&
          relationshipSet.indexOf(item._id) === -1 &&
          parentIds.indexOf(item._id) === -1
        ) {
          skip = true;
        }
        if (
          filtersType === 'organisations' &&
          filterType !== '' &&
          filterType !== item.organisationType &&
          parentIds.indexOf(item._id) === -1
        ) {
          skip = true;
        }
        if (!skip) {
          if (label === 'Events Types') {
            const { parentRef } = item || null;
            if (
              newFilterItemsIds.indexOf(parentRef) === -1 &&
              parentRef !== null
            ) {
              const parentItem =
                flatItems.find((f) => f._id === parentRef) || null;
              if (parentItem !== null) {
                newFilterItems.push(parentItem);
                newFilterItemsIds.push(parentItem._id);
              }
            }
          }
          newFilterItems.push(item);
          newFilterItemsIds.push(item._id);
        }
      }

      setFilterItems(newFilterItems);
      if (typeof itemsType !== 'undefined') {
        setFiltersTypes(itemsType);
      }
      setLoading(false);
    };
    if (!propsLoading && loading) {
      load();
    }
  }, [
    loading,
    propsLoading,
    items,
    filtersType,
    filtersSet,
    itemsType,
    relationshipSet,
    filterType,
    label,
  ]);

  useEffect(() => {
    if (
      relationshipSet.length > 0 &&
      relationshipSet.length !== prevRelationshipSet.current.length &&
      !loading
    ) {
      prevRelationshipSet.current = relationshipSet;
      setLoading(true);
    }
  }, [relationshipSet, loading]);

  useEffect(() => {
    if (prevFiltersSetRef.current > 0 && filtersSet.length === 0) {
      const newFilterItems = Object.assign([], filterItems);
      for (let i = 0; i < newFilterItems.length; i += 1) {
        newFilterItems[i].checked = false;
      }
      setFilterItems(newFilterItems);
      setFilters([]);
      updateFilters(filtersType, []);
    }
    prevFiltersSetRef.current = filtersSet.length;
  }, [updateFilters, filtersSet, filterItems, filtersType]);

  const over = (e) => {
    e.stopPropagation();
    const elem = e.currentTarget;
    const bbox = elem.getBoundingClientRect();
    const id = elem.dataset.target;
    prevId.current = id;
    const titleElem = document.getElementById(id);

    if (typeof titleElem !== 'undefined') {
      const left = bbox.left + 20;
      const top = bbox.top - 2;
      titleElem.style.left = `${left}px`;
      titleElem.style.top = `${top}px`;
    }
  };

  const cancelOver = () => {
    if (prevId.current !== null) {
      const titleElem = document.getElementById(prevId.current);
      if (typeof titleElem !== 'undefined' && titleElem !== null) {
        titleElem.style.left = '-100px';
        titleElem.style.top = '-100px';
      }
      prevId.current = null;
    }
  };

  useEffect(() => {
    const effCancelOver = () => {
      if (prevId.current !== null) {
        const titleElem = document.getElementById(prevId.current);
        if (typeof titleElem !== 'undefined' && titleElem !== null) {
          titleElem.style.left = '-100px';
          titleElem.style.top = '-100px';
        }
        prevId.current = null;
      }
    };
    window.addEventListener('scroll', effCancelOver);
    window.addEventListener('wheel', effCancelOver);
    return () => {
      window.removeEventListener('scroll', effCancelOver);
      window.removeEventListener('wheel', effCancelOver);
    };
  }, []);

  useEffect(() => {
    if (
      filtersType === 'organisationType' &&
      filtersSet.organisationType === '' &&
      filterType !== filtersSet.organisationType
    ) {
      setFilterType('');
    }
    if (
      filtersType === 'eventType' &&
      filtersSet.eventType === '' &&
      filterType !== filtersSet.eventType
    ) {
      setFilterType('');
    }
    if (
      filtersType === 'personType' &&
      filtersSet.personType === '' &&
      filterType !== filtersSet.personType
    ) {
      setFilterType('');
    }
  }, [filtersType, filtersSet, filterType]);

  const clearFilters = () => {
    if (filters.length > 0) {
      for (let i = 0; i < filterItems.length; i += 1) {
        filterItems[i].checked = false;
      }
      setFilters([]);
      updateFilters(filtersType, []);
    }
    if (
      (filtersType === 'organisationType' ||
        filtersType === 'eventType' ||
        filtersType === 'personType') &&
      filterType !== ''
    ) {
      setFilterType('');
      updateFilters(filtersType, '');
    }
  };

  const filterItemChildren = (item) => {
    const newItems = filterItems.filter(
      (i) => typeof i.parentId !== 'undefined' && i.parentId !== null
    );
    const childrenIds = [];
    if (typeof newItems !== 'undefined') {
      const children = newItems.filter(
        (i) => i.parentId.indexOf(item._id) > -1
      );
      if (typeof children !== 'undefined') {
        for (let key = 0; key < children.length; key += 1) {
          const c = children[key];
          c.checked = item.checked;
          childrenIds.push(c._id);
        }
      }
    }
    return childrenIds;
  };

  const toggleFilter = (item) => {
    const itemCopy = item;
    itemCopy.checked = !itemCopy.checked;
    let newFilters = filters;
    if (itemCopy.checked) {
      newFilters.push(itemCopy._id);
    } else {
      const index = newFilters.indexOf(itemCopy._id);
      newFilters.splice(index, 1);
    }
    const children = filterItemChildren(itemCopy);
    if (typeof children !== 'undefined' && children.length > 0) {
      if (itemCopy.checked) {
        newFilters = [...newFilters, ...children];
      } else {
        for (let ckey = 0; ckey < children.length; ckey += 1) {
          const cid = children[ckey];
          const newIndex = newFilters.indexOf(cid);
          newFilters.splice(newIndex, 1);
        }
      }
    }
    setFilters(newFilters);
    updateFilters(filtersType, newFilters);
  };

  const updateType = (e) => {
    const val = e.target.value;
    setFilterType(val);
    setScrollIndex(1);
    if (typeof propsUpdateType !== 'undefined') {
      propsUpdateType(val);
    }
    if (!loading) {
      setLoading(true);
    }

    setTimeout(() => {
      setScrollIndex(0);
    }, 750);
  };

  const renderFilterItem = (item) => {
    const sepIcon = [];
    let sepClass = '';
    let spanWidthStyle = { width: 'calc(100% - 5px)' };
    const parentId = item.parentId || null;
    if (parentId !== null) {
      let spanWidth = 15;
      for (let i = 0; i < item.parentId.length; i += 1) {
        sepIcon.push(<div className="filter-separator" key={i} />);
      }
      spanWidth += 15 * item.parentId.length;
      spanWidthStyle = { width: `calc(100% - ${spanWidth}px)` };
      sepClass = `sep-${item.parentId.length}`;
    }
    const output = (
      <FormGroup key={item._id} className={`filter-item ${sepClass}`}>
        <Label
          onMouseOver={(e) => over(e)}
          data-target={`${filtersType}-fi-${item._id}`}
        >
          <div className="title" id={`${filtersType}-fi-${item._id}`}>
            {item.label}
          </div>
          <div className="filter-separator-container">{sepIcon}</div>{' '}
          <Input
            type="checkbox"
            name={filtersType}
            onChange={() => toggleFilter(item, parentId)}
            checked={item.checked}
          />{' '}
          <span className="filter-span" style={spanWidthStyle}>
            {item.label}
          </span>
        </Label>
      </FormGroup>
    );
    return output;
  };

  let filtersTypesHTML = [];
  if (filtersTypes.length > 0) {
    const defaultOption = [
      <option value="" key="default">
        -- All --
      </option>,
    ];

    const filtersTypesOptions = prepareOptions(filtersTypes, '', filtersType);
    const options = [...defaultOption, ...filtersTypesOptions];
    filtersTypesHTML = (
      <Input
        type="select"
        name={`${filtersType}-type`}
        className="filter-type-dropdown"
        onChange={(e) => updateType(e)}
        value={filterType}
      >
        {options}
      </Input>
    );
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
          {filtersTypesHTML}
          <LazyList
            limit={50}
            range={25}
            items={filterItems}
            containerClass="filter-body"
            renderItem={renderFilterItem}
            onScroll={cancelOver}
            onWheel={cancelOver}
            scrollIndex={scrollIndex}
          />
        </CardBody>
      </Card>
    </div>
  );
};

Filter.defaultProps = {
  relationshipSet: [],
  filtersSet: [],
  items: [],
  filtersType: '',
  itemsType: [],
  label: '',
  updateFilters: () => {},
  updateType: () => {},
  loading: true,
};

Filter.propTypes = {
  relationshipSet: PropTypes.array,
  filtersSet: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  items: PropTypes.array,
  filtersType: PropTypes.string,
  itemsType: PropTypes.array,
  label: PropTypes.string,
  updateFilters: PropTypes.func,
  updateType: PropTypes.func,
  loading: PropTypes.bool,
};

export default Filter;
