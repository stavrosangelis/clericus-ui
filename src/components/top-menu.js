import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavItem, Nav,
  DropdownMenu,
  UncontrolledDropdown
} from 'reactstrap';
import {NavLink} from 'react-router-dom';

const APIPath = process.env.REACT_APP_APIPATH;

const TopMenu = props => {
  const [loading, setLoading] = useState(true);
  let defaultItem = <NavItem key={1}>
    <NavLink to="/" href="/">Home</NavLink>
  </NavItem>
  const [items, setItems] = useState(defaultItem);

  useEffect(()=> {
    const setHovered = (e) => {
      e.stopPropagation();
      let elem = e.target;
      let rect = elem.getBoundingClientRect();
      let num = rect.x+rect.width+100;
      if (num>=window.innerWidth) {
        let parent = elem.parentNode;
        parent.classList.add("right");
      }
    }
    const toggleActive = (item) => {
      let elem = document.getElementById(`menu-item-${item._id}`);
      elem.classList.toggle("active");
    }

    const toggle = () => {
      if (window.innerWidth<767) {
        props.toggle();
      }
    }

    const returnMenuItem = (item, i) =>{
      let url = "#";
      if (item.link!=="") {
        url = item.link;
      }
      if (item.type!=="link" && item.type!=="home") {
        url = `/${item.type}/${item.link}`;
      }
      if (url.charAt(0)!=="/") {
        url = `/${url}`;
      }
      let menuItem;

      if (item.children.length===0) {
        menuItem = <NavItem key={i}>
          <NavLink key={i} to={url} href={url} onClick={()=>toggle()}>{item.label}</NavLink>
        </NavItem>;
      }
      else {
        let menuItemChildren = item.children.map((item,i)=>{
          let menuItem = returnMenuItem(item,i);
          return menuItem;
        });
        menuItem = <UncontrolledDropdown nav key={i} id={`menu-item-${item._id}`}>
          <div className="nav-item-wc">
            <NavLink to={url} href={url} onMouseOver={(e)=>setHovered(e)}  onClick={()=>toggle()}>{item.label}</NavLink>
            <div className="nav-item-wct" onClick={()=>toggleActive(item)}>
              <i className="fa fa-chevron-down" />
            </div>
          </div>
          <DropdownMenu tag="ul" id={`menu-dropdown-${item._id}`}>
            {menuItemChildren}
          </DropdownMenu>
        </UncontrolledDropdown>;
      }
      return menuItem;
    }

    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'ui-menu',
        crossDomain: true,
        params: {templatePosition: "top"}
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      if (responseData.status) {
        let menuItems = responseData.data.items.map((item,i)=>{
          let menuItem = returnMenuItem(item,i);
          return menuItem;
        });
        setItems(menuItems);
      }
    }
    if (loading) {
      load();
    }
  },[loading, props]);


  return (
    <Nav className="ml-auto nav" navbar>
      {items}
    </Nav>
  )
}

export default TopMenu;
