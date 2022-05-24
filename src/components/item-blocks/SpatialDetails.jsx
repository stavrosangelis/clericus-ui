import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Label } from 'reactstrap';

function Block(props) {
  // state
  const [visible, setVisible] = useState(true);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  // props
  const { item } = props;

  let visibleClass = '';
  let visibleIcon = '';
  if (!visible) {
    visibleClass = ' item-hidden';
    visibleIcon = ' closed';
  }
  let output = null;
  if (item !== null) {
    const {
      streetAddress = '',
      locality = '',
      region = '',
      postalCode = '',
      country = '',
      locationType = '',
      latitude = '',
      longitude = '',
    } = item;
    const addressBlock =
      streetAddress !== '' ? (
        <div key="streetAddress">
          <Label>Street address: </Label> {streetAddress}
        </div>
      ) : null;
    const localityBlock =
      locality !== '' ? (
        <div key="locality">
          <Label>Locality: </Label> {locality}
        </div>
      ) : null;
    const regionBlock =
      region !== '' ? (
        <div key="region">
          <Label>Region: </Label> {region}
        </div>
      ) : null;
    const postalCodeBlock =
      postalCode !== '' ? (
        <div key="postalCode">
          <Label>Postal Code: </Label> {postalCode}
        </div>
      ) : null;
    const countryBlock =
      country !== '' ? (
        <div key="country">
          <Label>Country: </Label> {country}
        </div>
      ) : null;
    const locationTypeBlock =
      locationType !== '' ? (
        <div key="locationType">
          <Label>Type: </Label> {locationType}
        </div>
      ) : null;
    const coordsBlock =
      latitude !== '' && longitude !== '' ? (
        <div key="coordinates">
          <Label>lat: </Label> {latitude}, <Label>lng: </Label> {longitude}
        </div>
      ) : null;
    output = (
      <>
        <h5>
          Details
          <div
            className="btn btn-default btn-xs pull-right toggle-info-btn"
            onClick={toggleVisible}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle description visibility"
          >
            <i className={`fa fa-angle-down${visibleIcon}`} />
          </div>
        </h5>
        <div className={`item-block${visibleClass}`}>
          <div style={{ marginBottom: '10px' }}>
            {addressBlock}
            {localityBlock}
            {regionBlock}
            {postalCodeBlock}
            {countryBlock}
            {locationTypeBlock}
            {coordsBlock}
          </div>
        </div>
      </>
    );
  }

  return output;
}

Block.defaultProps = {
  item: null,
};
Block.propTypes = {
  item: PropTypes.object,
};
export default Block;
