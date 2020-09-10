import React, { Component } from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import {Link} from 'react-router-dom';

import '../scss/breadcrumbs.scss';

export class Breadcrumbs extends Component {
  render() {

    let breadcrumbItems = [];
    let homeItem = <BreadcrumbItem key={0}><Link to="/" href="/"><i className="pe-7s-home" /> Home</Link></BreadcrumbItem>;

    if (this.props.items.length===0) {
      homeItem = <BreadcrumbItem active key={0}><i className="pe-7s-home" /> Home</BreadcrumbItem>;
    }
    breadcrumbItems.push(homeItem);
    let items = this.props.items;
    for (let i=0; i<items.length; i++) {
      let count = i+1;
      let item = items[i];
      let itemIcon = [];
      if (typeof item.icon!=="undefined" && item.icon!=="") {
        itemIcon = <i className={item.icon} />;
      }
      let breadcrumbItem = <BreadcrumbItem active={item.active} key={count}>{itemIcon} {item.label}</BreadcrumbItem>;
      if (!item.active) {
        breadcrumbItem = <BreadcrumbItem active={item.active} key={count}><Link to={item.path} href={item.path}>{itemIcon} {item.label}</Link></BreadcrumbItem>;
      }
      breadcrumbItems.push(breadcrumbItem);
    }
    return (
      <Breadcrumb>
        {breadcrumbItems}
      </Breadcrumb>
    )
  }
}
