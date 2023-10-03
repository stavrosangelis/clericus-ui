import React, { useState } from 'react';
import PropTypes from 'prop-types';

function Block(props) {
  // state
  const [visible, setVisible] = useState(true);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  // props
  const { description } = props;

  let visibleClass = '';
  let visibleIcon = '';
  if (!visible) {
    visibleClass = ' item-hidden';
    visibleIcon = ' closed';
  }
  const output =
    description === '' ? null : (
      <>
        <h5 className="item-block-heading">
          <span>Description</span>
          <div
            className="btn btn-default btn-xs pull-icon-middle toggle-info-btn"
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
          <div style={{ marginBottom: '10px' }}>{description}</div>
        </div>
      </>
    );
  return output;
}

Block.defaultProps = {
  description: '',
};
Block.propTypes = {
  description: PropTypes.string,
};
export default Block;
