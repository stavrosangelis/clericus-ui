import React from 'react';
import PropTypes from 'prop-types';
import PathOutput from './Path.output';

export default function DetailsCard(props) {
  const { clear, path, open, setOpen, moveToNode } = props;

  const toggle = () => {
    if (open) {
      clear();
    }
    setOpen(!open);
  };

  const visibleClass = open ? '' : 'hidden';

  return (
    <div className={`card graph-details-card${visibleClass}`}>
      <div
        className="graph-details-card-close"
        onClick={() => toggle()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle details"
      >
        <i className="fa fa-times" />
      </div>
      <div className="card-title">
        <h4>Shortest path</h4>
      </div>
      <div className="card-body">
        <PathOutput path={path} moveToNode={moveToNode} />
      </div>
    </div>
  );
}

DetailsCard.defaultProps = {
  path: [],
};

DetailsCard.propTypes = {
  clear: PropTypes.func.isRequired,
  path: PropTypes.array,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  moveToNode: PropTypes.func.isRequired,
};
