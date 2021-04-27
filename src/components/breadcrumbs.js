import React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../scss/breadcrumbs.scss';

const Breadcrumbs = (props) => {
  const { items } = props;
  const breadcrumbItems = [];
  let homeItem = (
    <BreadcrumbItem key={0}>
      <Link to="/" href="/">
        <i className="pe-7s-home" /> Home
      </Link>
    </BreadcrumbItem>
  );
  if (items.length === 0) {
    homeItem = (
      <BreadcrumbItem active key={0}>
        <i className="pe-7s-home" /> Home
      </BreadcrumbItem>
    );
  }
  breadcrumbItems.push(homeItem);
  for (let i = 0; i < items.length; i += 1) {
    const count = i + 1;
    const item = items[i];
    let itemIcon = [];
    if (typeof item.icon !== 'undefined' && item.icon !== '') {
      itemIcon = <i className={item.icon} />;
    }
    let breadcrumbItem = (
      <BreadcrumbItem active={item.active} key={count}>
        {itemIcon} {item.label}
      </BreadcrumbItem>
    );
    if (!item.active) {
      breadcrumbItem = (
        <BreadcrumbItem active={item.active} key={count}>
          <Link to={item.path} href={item.path}>
            {itemIcon} {item.label}
          </Link>
        </BreadcrumbItem>
      );
    }
    breadcrumbItems.push(breadcrumbItem);
  }
  return <Breadcrumb>{breadcrumbItems}</Breadcrumb>;
};
export default Breadcrumbs;
Breadcrumbs.defaultProps = {
  items: [],
};
Breadcrumbs.propTypes = {
  items: PropTypes.array,
};
