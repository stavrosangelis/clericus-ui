import React, { useState, useEffect } from 'react';
import { FormGroup, Input } from 'reactstrap';
import PropTypes from 'prop-types';

import LazyList from '../../Lazylist';

function HeatmapSearch(props) {
  const { data, openPopup, setCenter, toggle, visible } = props;

  const [listData, setListData] = useState([]);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (data.length > 0) {
      setListData(data);
    }
  }, [data]);

  const centerNode = (_id) => {
    const node = data.find((n) => n._id === _id) || null;
    if (node !== null) {
      if (node.features.length > 0) {
        const { label = '' } = node;
        const { ref: addressPoint } = node.features[0];
        const { latitude = '', longitude = '' } = addressPoint;
        if (latitude !== '' && longitude !== '') {
          const newAddressPoint = [latitude, longitude];
          setCenter(newAddressPoint);
          openPopup({ _id, label, position: newAddressPoint });
        }
      }
    }
  };

  const searchNode = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setSearchInput(value);
    const visibleNodes = data.filter((n) =>
      n.label.toLowerCase().includes(value.toLowerCase())
    );
    setListData(visibleNodes);
  };

  const clearSearchNode = () => {
    setSearchInput('');
    setListData(data);
  };

  const searchContainerVisibleClass = visible ? ' visible' : '';

  const searchContainerNodes = listData.length > 0 ? listData : [];

  const renderSearchLItem = (item = null, i = 0) => {
    if (item === null || item.features === null) {
      return null;
    }
    const {
      _id: iId = '',
      label: iLabel = '',
      count: iCount = 0,
      visible: iVisible = true,
      organisationType: iOrganisationType = '',
    } = item;
    if (iVisible) {
      return (
        <div
          key={i}
          onClick={() => centerNode(iId)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="center to node"
        >
          {iLabel}{' '}
          <small>
            ({iCount}) [{iOrganisationType}]
          </small>
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
  openPopup: PropTypes.func.isRequired,
  setCenter: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};
export default HeatmapSearch;
