import React from 'react';
import PropTypes from 'prop-types';

const Block = (props) => {
  const { toggleTable, hidden, description } = props;
  return (
    <div key="description" style={{ minHeight: '25px' }}>
      <h5>
        Description
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
      </h5>
      <div className={`people-info-container ${hidden}`}>{description}</div>
    </div>
  );
};

Block.defaultProps = {
  hidden: '',
  description: '',
  toggleTable: () => {},
};
Block.propTypes = {
  hidden: PropTypes.string,
  description: PropTypes.string,
  toggleTable: PropTypes.func,
};
export default Block;
