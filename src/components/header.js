import React from 'react';
import ScrollEvent from 'react-onscroll';

import {
  Collapse,
  Navbar
} from 'reactstrap';
import { Link, Redirect } from 'react-router-dom';
import TopMenu from "./top-menu.js";
import logosrc from "../assets/images/cos-logo-bw.png";

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.oldOffsetTop = 0;

    this.state = {
      isOpen: false,
      searchVisible: false,
      search: "",
      redirect: false
    };

    this.toggle = this.toggle.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.handleScrollCallback = this.handleScrollCallback.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.searchSubmit = this.searchSubmit.bind(this);

    this.myRef = React.createRef();
    this.searchRef = React.createRef();
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  toggleSearch() {
    if (!this.state.searchVisible) {
      this.searchRef.current.focus();
    }
    this.setState({
      searchVisible: !this.state.searchVisible
    });
  }

  handleScrollCallback() {
    if((this.myRef.current.offsetTop > 0)&&
       (this.oldOffsetTop !== this.myRef.current.offsetTop)){
      this.oldOffsetTop = this.myRef.current.offsetTop;
    }
    if (window.pageYOffset > this.oldOffsetTop) {
      document.getElementById("headerNavbar").classList.add("headerNavbar-container");
    } else {
      if(document.getElementById("headerNavbar").classList.contains("headerNavbar-container"))
        document.getElementById("headerNavbar").classList.remove("headerNavbar-container");
    }
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  searchSubmit(e) {
    e.preventDefault();
    this.setState({
      redirect: true
    }, ()=> {
      this.toggleSearch();
      this.setState({
        search: ""
      });
    });

  }

  componentDidUpdate() {
    if (this.state.redirect) {
      this.setState({
        redirect: false
      })
    }
  }

  render() {
    let searchClass = "";
    if (this.state.searchVisible) {
      searchClass = "visible";
    }
    let redirect = [];
    if (this.state.redirect) {
      redirect = <Redirect to={`/search/${this.state.search}`} />
    }
    return (
      <div id="headerNavbar" ref={this.myRef}  className="container-fluid header main-nav">
        {redirect}
        <ScrollEvent handleScrollCallback={this.handleScrollCallback} />
        <div className="container">
          <Navbar expand="md">
            <Link to="/" href="/" className="logo-container">
                <div className="bw-logo">
                  <img src={logosrc} className="logo-img" alt="Clericus logo" />
                  <div className="simple-text bw-normal">Clericus</div>
                </div>
            </Link>
            <button type="button" className="navbar-toggler navbar-toggler-nopadding" onClick={this.toggle} aria-label="Toggle navigation">
              <span className="navbar-toggler-icon">
                  <i className="fa fa-navicon"></i>
              </span>
            </button>
            <Collapse isOpen={this.state.isOpen} navbar>
              <TopMenu toggle={this.toggle}/>
              <div className="search-trigger"><span onClick={this.toggleSearch}><i className="fa fa-search" /></span></div>
            </Collapse>
          </Navbar>
        </div>
        <div className={`generic-search-input ${searchClass}`}>
          <form onSubmit={this.searchSubmit}>
            <input ref={this.searchRef} name="search" type="text" placeholder="Search..." value={this.state.search} onChange={this.handleChange} />
            <i className="fa fa-search search-submit" onClick={this.searchSubmit}/>
          </form>
        </div>
      </div>
    )
  }
}
