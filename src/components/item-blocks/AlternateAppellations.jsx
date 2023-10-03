import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { jsonStringToObject, personLabel } from '../../helpers';

function Block(props) {
  // state
  const [visible, setVisible] = useState(true);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  // props
  const { items } = props;
  const { length } = items;

  let output = null;

  if (length > 0) {
    let visibleClass = '';
    let visibleIcon = '';
    if (!visible) {
      visibleClass = ' item-hidden';
      visibleIcon = ' closed';
    }

    const appellations = [];
    for (let i = 0; i < length; i += 1) {
      const a = items[i];
      const obj = jsonStringToObject(a);
      const {
        appelation = '',
        label: aLabel = '',
        language = null,
        note = '',
      } = obj;
      let label = '';
      let lang = '';
      let noteText = '';
      if (appelation !== '') {
        label = appelation;
      } else if (aLabel !== '') {
        label = aLabel;
      } else {
        label = personLabel(obj);
      }
      if (language !== null && language !== '' && language.label !== '') {
        lang = ` [${language.label}]`;
      }
      if (noteText !== '') {
        noteText = <i>{` ${note}`}</i>;
      }
      const key = `a${i}`;
      if (label !== '') {
        appellations.push(
          <div key={key}>
            {label}
            {lang}
            {noteText}
          </div>
        );
      }
    }
    if (appellations.length > 0) {
      output = (
        <>
          <h5 className="item-block-heading">
            <span>Alternate appellations</span>
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
            <div style={{ marginBottom: '10px' }}>{appellations}</div>
          </div>
        </>
      );
    }
  }

  return output;
}

Block.defaultProps = {
  items: [],
};
Block.propTypes = {
  items: PropTypes.array,
};
export default Block;
