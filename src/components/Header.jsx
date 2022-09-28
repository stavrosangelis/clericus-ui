import React, { Fragment, useEffect, useState, useRef } from 'react';
import { Collapse, Navbar } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';

import Topbar from './Topbar';
import TopMenu from './Top.menu';

import logosrc from '../assets/images/cos-logo-bw.png';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const topRef = useRef(null);
  const navRef = useRef(null);
  const searchRef = useRef(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { value } = e.target;
    setSearchInput(value);
  };

  useEffect(() => {
    const windowScroll = () => {
      if (topRef.current !== null) {
        const { height } = topRef.current.getBoundingClientRect();
        const scrollYPosition = document.documentElement.scrollTop;
        const headerNavbar = navRef.current || null;
        if (headerNavbar !== null) {
          if (
            scrollYPosition > height &&
            !headerNavbar.classList.contains('headerNavbar-container')
          ) {
            headerNavbar.classList.add('headerNavbar-container');
          } else if (
            scrollYPosition <= height &&
            headerNavbar.classList.contains('headerNavbar-container')
          ) {
            headerNavbar.classList.remove('headerNavbar-container');
          }
        }
      }
    };
    window.addEventListener('scroll', windowScroll);
    return () => {
      window.removeEventListener('scroll', windowScroll);
    };
  }, []);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleSearch = () => {
    if (!searchVisible) {
      searchRef.current.focus();
    }
    setSearchVisible(!searchVisible);
  };

  const searchSubmit = (e) => {
    e.preventDefault();
    toggleSearch();
    navigate(`/search/${searchInput}`);
    setSearchInput('');
  };

  const searchClass = searchVisible ? 'visible' : '';

  return (
    <>
      <Topbar pRef={topRef} />
      <div
        id="headerNavbar"
        ref={navRef}
        className="container-fluid header main-nav"
      >
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
              onClick={() => toggle()}
              aria-label="Toggle navigation"
            />
            <Collapse isOpen={isOpen} navbar>
              <TopMenu toggle={closeMenu} />
              <div className="search-trigger">
                <span
                  onClick={() => toggleSearch()}
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
          <form onSubmit={(e) => searchSubmit(e)}>
            <input
              ref={searchRef}
              name="search"
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => handleChange(e)}
            />
            <i
              className="fa fa-search search-submit"
              onClick={(e) => searchSubmit(e)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="submit search"
            />
          </form>
        </div>
      </div>
    </>
  );
}

export default Header;
