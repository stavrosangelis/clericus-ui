import React, { useState } from 'react';
import PropTypes from 'prop-types';
import parseMetadata from '../../helpers/parse-metadata';

function Block(props) {
  // state
  const [visible, setVisible] = useState(true);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  // props
  const { metadata } = props;

  let visibleClass = '';
  let visibleIcon = '';
  if (!visible) {
    visibleClass = ' item-hidden';
    visibleIcon = ' closed';
  }

  const { image = null } = metadata;
  const output =
    image === null ? null : (
      <>
        <h5 className="item-block-heading">
          <span>Technical metadata</span>
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
          <div style={{ marginBottom: '10px' }}>{parseMetadata(image)}</div>
        </div>
      </>
    );
  return output;
}

Block.defaultProps = {
  metadata: null,
};
Block.propTypes = {
  metadata: PropTypes.object,
};
export default Block;
