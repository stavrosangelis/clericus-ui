import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function Topbar(props) {
  const { pRef } = props;
  return (
    <div ref={pRef} className="container-fluid top-bar">
      <ul className="pull-left top-bar-list">
        <li>
          <a
            href="https://twitter.com/clericusDH"
            target="_blank"
            rel="noreferrer"
          >
            <span className="social-icon">
              <i className="fa fa-twitter" />
            </span>
          </a>
        </li>
        <li>
          <Link href="/contact" to="/contact" title="contact" alt="contact">
            <span className="social-icon">
              <i className="fa fa-envelope" />
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

Topbar.defaultProps = {
  pRef: null,
};
Topbar.propTypes = {
  pRef: PropTypes.object,
};
export default Topbar;
