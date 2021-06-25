import React from 'react';
import PropTypes from 'prop-types';

const Block = (props) => {
  const { toggleTable, hidden, visible, description } = props;
  return (
    <div style={{ minHeight: '25px' }}>
      <div
        className="btn btn-default btn-xs pull-right toggle-info-btn"
        onClick={(e) => {
          toggleTable(e, 'description');
        }}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle description visibility"
      >
        <i className={`fa fa-angle-down${hidden}`} />
      </div>
      <div className={visible}>{description}</div>
    </div>
  );
};

Block.defaultProps = {
  hidden: '',
  visible: false,
  description: '',
  toggleTable: () => {},
};
Block.propTypes = {
  hidden: PropTypes.string,
  visible: PropTypes.bool,
  description: PropTypes.string,
  toggleTable: PropTypes.func,
};
export default Block;
