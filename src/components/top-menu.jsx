import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavItem, Nav, DropdownMenu, UncontrolledDropdown } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

const APIPath = process.env.REACT_APP_APIPATH;

const TopMenu = (props) => {
  // state
  const [loading, setLoading] = useState(true);
  const defaultItem = (
    <NavItem key={1}>
      <NavLink to="/" href="/">
        Home
      </NavLink>
    </NavItem>
  );
  const [items, setItems] = useState(defaultItem);

  // props
  const { toggle: propsToggle } = props;

  useEffect(() => {
    const setHovered = (e) => {
      e.stopPropagation();
      const elem = e.target;
      const rect = elem.getBoundingClientRect();
      const num = rect.x + rect.width + 100;
      if (num >= window.innerWidth) {
        const parent = elem.parentNode;
        parent.classList.add('right');
      }
    };
    const toggleActive = (item) => {
      const elem = document.getElementById(`menu-item-${item._id}`);
      elem.classList.toggle('active');
    };

    const toggle = () => {
      if (window.innerWidth < 767) {
        propsToggle();
      }
    };

    const returnMenuItem = (item, i) => {
      let url = '#';
      if (item.link !== '') {
        url = item.link;
      }
      if (item.type !== 'link' && item.type !== 'home') {
        url = `/${item.type}/${item.link}`;
      }
      if (url.charAt(0) !== '/') {
        url = `/${url}`;
      }
      let menuItem;

      if (item.children.length === 0) {
        menuItem = (
          <NavItem key={i}>
            <NavLink key={i} to={url} href={url} onClick={() => toggle()}>
              {item.label}
            </NavLink>
          </NavItem>
        );
      } else {
        const menuItemChildren = item.children.map((citem, j) =>
          returnMenuItem(citem, j)
        );
        menuItem = (
          <UncontrolledDropdown nav key={i} id={`menu-item-${item._id}`}>
            <div className="nav-item-wc">
              <NavLink
                to={url}
                href={url}
                onMouseOver={(e) => setHovered(e)}
                onClick={() => toggle()}
              >
                {item.label}
              </NavLink>
              <div
                className="nav-item-wct"
                onClick={() => toggleActive(item)}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="remove item from list"
              >
                <i className="fa fa-chevron-down" />
              </div>
            </div>
            <DropdownMenu tag="ul" id={`menu-dropdown-${item._id}`}>
              {menuItemChildren}
            </DropdownMenu>
          </UncontrolledDropdown>
        );
      }
      return menuItem;
    };

    const load = async () => {
      setLoading(false);
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}ui-menu`,
        crossDomain: true,
        params: { templatePosition: 'top' },
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (responseData.status) {
        const menuItems = responseData.data.items.map((item, i) => {
          const menuItem = returnMenuItem(item, i);
          return menuItem;
        });
        setItems(menuItems);
      }
    };
    if (loading) {
      load();
    }
  }, [loading, propsToggle]);

  return (
    <Nav className="ml-auto nav" navbar>
      {items}
    </Nav>
  );
};
TopMenu.defaultProps = {
  toggle: () => {},
};
TopMenu.propTypes = {
  toggle: PropTypes.func,
};

export default TopMenu;
