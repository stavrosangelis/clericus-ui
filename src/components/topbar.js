import React, {Component} from 'react';
import {Link} from 'react-router-dom';

export default class Topbar extends Component {
  render() {
    return (
      <div className="container-fluid top-bar">
        <ul className="pull-left top-bar-list">
          <li>
            <span className="social-icon">
              <i className="fa fa-facebook" />
            </span>
          </li>
          <li>
            <span className="social-icon">
              <i className="fa fa-twitter" />
            </span>
          </li>
          <li>
            <Link href="/contact" to="/contact">
              <span className="social-icon">
                <i className="fa fa-envelope" />
              </span>
            </Link>
          </li>
        </ul>

        {/*<ul className="pull-right top-bar-list">
          <li>
            <span className="top-bar-link">
              <i className="fa fa-user" /> <span>Login/Register</span>
            </span>
          </li>
        </ul>*/}
      </div>
    );
  }
}
