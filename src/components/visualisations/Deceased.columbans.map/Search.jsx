import React, { useState, useEffect } from 'react';
import { FormGroup, Input } from 'reactstrap';
import PropTypes from 'prop-types';

import LazyList from '../../Lazylist';

const locationLabel = (location = null) => {
  if (location !== null) {
    const { label = '', locationType = '', region = '' } = location;
    let outputLabel = label;
    if (locationType !== '' && !label.includes(locationType)) {
      if (outputLabel !== '') {
        outputLabel += ' ';
      }
      outputLabel += `(${locationType})`;
    }
    if (region !== '') {
      if (outputLabel !== '') {
        outputLabel += ', ';
      }
      outputLabel += region;
    }
    return outputLabel;
  }
  return '';
};

function HeatmapSearch(props) {
  const { data, updateSearchResult, setCenter, toggle, visible } = props;

  const [spatials, setSpatials] = useState([]);
  const [listData, setListData] = useState([]);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const { length } = data;
    if (length > 0) {
      const newSpatials = [];
      const sIds = [];
      for (let i = 0; i < length; i += 1) {
        const item = data[i];
        const [spatial = null] = item.spatial;
        if (spatial !== null) {
          const { ref: s = null } = spatial;
          if (s !== null) {
            const { _id: sId = '' } = s;
            if (sIds.indexOf(sId) === -1) {
              sIds.push(sId);
              newSpatials.push(s);
            }
          }
        }
      }
      newSpatials.sort((a, b) => {
        const akey = a.label;
        const bkey = b.label;
        if (akey < bkey) {
          return -1;
        }
        if (bkey < akey) {
          return 1;
        }
        return 0;
      });
      setSpatials(newSpatials);
      setListData(newSpatials);
    }
  }, [data]);

  const centerNode = (_id) => {
    const node = spatials.find((n) => n._id === _id) || null;
    if (node !== null) {
      const { latitude = '', longitude = '' } = node;
      if (latitude !== '' && longitude !== '') {
        const newAddressPoint = [latitude, longitude];
        setCenter(newAddressPoint);
        updateSearchResult(true, newAddressPoint);
      }
    }
  };

  const searchNode = (e) => {
    const { value = '' } = e.target;
    setSearchInput(value);
    const visibleNodes = spatials.filter((n) =>
      n.label.toLowerCase().includes(value.toLowerCase())
    );
    setListData(visibleNodes);
  };

  const clearSearchNode = () => {
    setSearchInput('');
    setListData(spatials);
    updateSearchResult(false, []);
  };

  const searchContainerVisibleClass = visible ? ' visible' : '';

  const searchContainerNodes = listData.length > 0 ? listData : [];

  const renderSearchLItem = (item = null, i = 0) => {
    if (item === null || item.features === null) {
      return null;
    }
    const { _id: iId = '', visible: iVisible = true } = item;
    if (iVisible) {
      const label = locationLabel(item);
      return (
        <div
          key={i}
          onClick={() => centerNode(iId)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="center to node"
        >
          {label}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`map-search-container${searchContainerVisibleClass}`}>
      <div
        className="close-map-search-container"
        onClick={() => toggle()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle search container"
      >
        <i className="fa fa-times" />
      </div>
      <FormGroup className="map-search-input">
        <Input
          type="text"
          name="text"
          placeholder="Search location..."
          value={searchInput}
          onChange={(e) => searchNode(e)}
        />
        <i
          className="fa fa-times-circle"
          onClick={() => clearSearchNode()}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="clear search node"
        />
      </FormGroup>
      <LazyList
        limit={30}
        range={15}
        items={searchContainerNodes}
        containerClass="map-search-container-nodes"
        renderItem={renderSearchLItem}
      />
    </div>
  );
}
HeatmapSearch.propTypes = {
  data: PropTypes.array.isRequired,
  updateSearchResult: PropTypes.func.isRequired,
  setCenter: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};
export default HeatmapSearch;
