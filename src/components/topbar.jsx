import React from 'react';
import { Link } from 'react-router-dom';

const Topbar = () => (
  <div className="container-fluid top-bar">
    <ul className="pull-left top-bar-list">
      {/* <li>
        <span className="social-icon">
          <i className="fa fa-facebook" />
        </span>
      </li> */}
      <li>
        <a href="https://twitter.com/MU_AHI" target="_blank" rel="noreferrer">
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

    {/* <ul className="pull-right top-bar-list">
      <li>
        <span className="top-bar-link">
          <i className="fa fa-user" /> <span>Login/Register</span>
        </span>
      </li>
    </ul> */}
  </div>
);
export default Topbar;
