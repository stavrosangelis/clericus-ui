import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { outputDate } from '../../helpers';

function Block(props) {
  // state
  const [visible, setVisible] = useState(true);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  // props
  const { items } = props;
  const { length } = items;

  const temporalData = items.map((item) => {
    const { ref = null } = item;
    if (ref !== null) {
      const { _id = '', label = '', startDate = '', endDate = '' } = ref;
      const tempLabel = [<span key="label">{label}</span>];
      let tLabel = '';
      if (startDate !== '') {
        tLabel = outputDate(startDate);
      }
      if (endDate !== '' && endDate !== startDate) {
        tLabel += ` - ${outputDate(endDate)}`;
      }
      tempLabel.push(<span key="dates">[{tLabel}]</span>);
      const url = `/temporal/${_id}`;
      return (
        <li key={_id}>
          <Link className="tag-bg tag-item" href={url} to={url}>
            {tempLabel}
          </Link>
        </li>
      );
    }
    return null;
  });

  let visibleClass = '';
  let visibleIcon = '';
  if (!visible) {
    visibleClass = ' item-hidden';
    visibleIcon = ' closed';
  }

  const output =
    length > 0 ? (
      <>
        <h5 className="item-block-heading">
          <span>
            Dates <small>[{length}]</small>
          </span>
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
          <ul className="tag-list">{temporalData}</ul>
        </div>
      </>
    ) : null;
  return output;
}

Block.defaultProps = {
  items: [],
};
Block.propTypes = {
  items: PropTypes.array,
};
export default Block;
