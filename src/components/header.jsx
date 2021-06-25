import React from 'react';
import ScrollEvent from 'react-onscroll';

import { Collapse, Navbar } from 'reactstrap';
import { Link, Redirect } from 'react-router-dom';
import TopMenu from './top-menu';
import logosrc from '../assets/images/cos-logo-bw.png';

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.oldOffsetTop = 0;

    this.state = {
      isOpen: false,
      searchVisible: false,
      search: '',
      redirect: false,
    };

    this.stopRedirect = this.stopRedirect.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.handleScrollCallback = this.handleScrollCallback.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.searchSubmit = this.searchSubmit.bind(this);

    this.myRef = React.createRef();
    this.searchRef = React.createRef();
  }

  componentDidUpdate() {
    const { redirect } = this.state;
    if (redirect) {
      this.stopRedirect();
    }
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  handleScrollCallback() {
    if (
      this.myRef.current.offsetTop > 0 &&
      this.oldOffsetTop !== this.myRef.current.offsetTop
    ) {
      this.oldOffsetTop = this.myRef.current.offsetTop;
    }
    if (window.pageYOffset > this.oldOffsetTop) {
      document
        .getElementById('headerNavbar')
        .classList.add('headerNavbar-container');
    } else if (
      document
        .getElementById('headerNavbar')
        .classList.contains('headerNavbar-container')
    )
      document
        .getElementById('headerNavbar')
        .classList.remove('headerNavbar-container');
  }

  stopRedirect() {
    this.setState({
      redirect: false,
    });
  }

  toggle() {
    const { isOpen } = this.state;
    this.setState({
      isOpen: !isOpen,
    });
  }

  toggleSearch() {
    const { searchVisible } = this.state;
    if (!searchVisible) {
      this.searchRef.current.focus();
    }
    this.setState({
      searchVisible: !searchVisible,
    });
  }

  searchSubmit(e) {
    e.preventDefault();
    this.setState(
      {
        redirect: true,
      },
      () => {
        this.toggleSearch();
        this.setState({
          search: '',
        });
      }
    );
  }

  render() {
    const {
      searchVisible,
      redirect: stateRedirect,
      search,
      isOpen,
    } = this.state;
    let searchClass = '';
    if (searchVisible) {
      searchClass = 'visible';
    }
    let redirect = [];
    if (stateRedirect) {
      redirect = <Redirect to={`/search/${search}`} />;
    }
    return (
      <div
        id="headerNavbar"
        ref={this.myRef}
        className="container-fluid header main-nav"
      >
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
            <button
              type="button"
              className="navbar-toggler navbar-toggler-nopadding"
              onClick={this.toggle}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon">
                <i className="fa fa-navicon" />
              </span>
            </button>
            <Collapse isOpen={isOpen} navbar>
              <TopMenu toggle={this.toggle} />
              <div className="search-trigger">
                <span
                  onClick={() => this.toggleSearch()}
                  onKeyDown={() => false}
                  role="button"
                  tabIndex={0}
                  aria-label="toggle search"
                >
                  <i className="fa fa-search" />
                </span>
              </div>
            </Collapse>
          </Navbar>
        </div>
        <div className={`generic-search-input ${searchClass}`}>
          <form onSubmit={this.searchSubmit}>
            <input
              ref={this.searchRef}
              name="search"
              type="text"
              placeholder="Search..."
              value={search}
              onChange={this.handleChange}
            />
            <i
              className="fa fa-search search-submit"
              onClick={this.searchSubmit}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="submit search"
            />
          </form>
        </div>
      </div>
    );
  }
}
