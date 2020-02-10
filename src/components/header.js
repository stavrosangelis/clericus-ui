import React from 'react';
import ReactDOM from 'react-dom';
import ScrollEvent from 'react-onscroll';

import {
  Collapse,
  Navbar,
  Nav,
  NavItem
  /*NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem*/ } from 'reactstrap';
import { Link } from 'react-router-dom';

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.handleScrollCallback = this.handleScrollCallback.bind(this);
    this.myRef = React.createRef();
    
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleScrollCallback() {
    if (window.pageYOffset > this.myRef.current.offsetTop) {
      document.getElementById("headerNavbar").classList.add("headerNavbar-container");
    } else {
      if(document.getElementById("headerNavbar").classList.contains("headerNavbar-container"))
        document.getElementById("headerNavbar").classList.remove("headerNavbar-container");
    }

  }
  
  render() {
    return (
      <div id="headerNavbar" ref={this.myRef}  className="container-fluid header main-nav">
        <ScrollEvent handleScrollCallback={this.handleScrollCallback} />
        <div className="container">
          <Navbar expand="md">
            <Link to="/" href="/" className="logo-container">

                <div className="bw-logo">
                  <div className="simple-text icon">
                    <div className="bw-container">
                      <div className="triangle-left"></div>
                      <div className="triangle-left-inner"></div>
                      <div className="triangle-right"></div>
                      <div className="triangle-right-inner"></div>
                    </div>
                  </div>
                  <div className="simple-text bw-normal">Clericus</div>
                </div>

            </Link>
            <button type="button" className="navbar-toggler" onClick={this.toggle}>
              <span className="navbar-toggler-icon">
                  <i className="fa fa-navicon"></i>
              </span>
            </button>
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
                <NavItem>
                  <Link to="/about" href="/about/">About</Link>
                </NavItem>
                <NavItem>
                  <Link to="/classpieces/" href="/classpieces/">Classpieces</Link>
                </NavItem>
                <NavItem>
                  <Link to="/people/" href="/people/">People</Link>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </div>
      </div>
    )
  }
}
