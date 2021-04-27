import React, { Component } from 'react';
import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  // Collapse
} from 'reactstrap';
import PropTypes from 'prop-types';
import MainPagination from './pagination';

export default class PageActions extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  render() {
    let limitActive0 = '';
    let limitActive1 = '';
    let limitActive2 = '';
    let limitActive3 = '';
    const {
      limit,
      sort,
      pageType,
      orderField,
      orderDesc,
      updateSort,
      gotoPage,
      gotoPageValue,
      handleChange,
      total_pages: totalPages,
      current_page: currentPage,
      updatePage,
      updateLimit,
    } = this.props;
    if (limit === 25) {
      limitActive0 = 'active';
    }
    if (limit === 50) {
      limitActive1 = 'active';
    }
    if (limit === 100) {
      limitActive2 = 'active';
    }
    if (limit === 500) {
      limitActive3 = 'active';
    }
    let sortItem = null;
    if (sort) {
      if (pageType === 'people') {
        let lastNameSortIcon = [];
        let lastNameActive = '';
        let firstNameSortIcon = [];
        let firstNameActive = '';
        if (orderField === 'lastName' || orderField === '') {
          if (orderDesc) {
            lastNameSortIcon = <i className="fa fa-caret-down" />;
          } else {
            lastNameSortIcon = <i className="fa fa-caret-up" />;
          }
          lastNameActive = 'active';
        }
        if (orderField === 'firstName') {
          if (orderDesc) {
            firstNameSortIcon = <i className="fa fa-caret-down" />;
          } else {
            firstNameSortIcon = <i className="fa fa-caret-up" />;
          }
          firstNameActive = 'active';
        }

        sortItem = (
          <div className="page-action-item">
            <UncontrolledDropdown>
              <DropdownToggle caret size="sm" outline>
                Sort
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem
                  className={lastNameActive}
                  onClick={() => updateSort('lastName')}
                >
                  Last Name {lastNameSortIcon}
                </DropdownItem>
                <DropdownItem
                  className={firstNameActive}
                  onClick={() => updateSort('firstName')}
                >
                  First Name {firstNameSortIcon}
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        );
      }
    }

    return (
      <div className="row">
        <div className="col-12">
          <div className="page-actions text-right">
            <div className="go-to-page">
              <form onSubmit={gotoPage}>
                <InputGroup size="sm">
                  <Input
                    name="gotoPage"
                    onChange={handleChange}
                    value={gotoPageValue}
                    placeholder="0"
                  />
                  <InputGroupAddon addonType="append">
                    <div className="total-pages">/ {totalPages}</div>
                  </InputGroupAddon>
                  <InputGroupAddon addonType="append">
                    <Button
                      type="submit"
                      outline
                      color="secondary"
                      className="go-to-page-btn"
                    >
                      <i className="fa fa-angle-right" />
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </form>
            </div>

            <MainPagination
              limit={limit}
              current_page={currentPage}
              total_pages={totalPages}
              pagination_function={updatePage}
            />

            <div className="page-action-item">
              <UncontrolledDropdown>
                <DropdownToggle caret size="sm" outline>
                  Limit
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem
                    className={limitActive0}
                    onClick={() => updateLimit(25)}
                  >
                    25
                  </DropdownItem>
                  <DropdownItem
                    className={limitActive1}
                    onClick={() => updateLimit(50)}
                  >
                    50
                  </DropdownItem>
                  <DropdownItem
                    className={limitActive2}
                    onClick={() => updateLimit(100)}
                  >
                    100
                  </DropdownItem>
                  <DropdownItem
                    className={limitActive3}
                    onClick={() => updateLimit(500)}
                  >
                    500
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>

            {sortItem}
          </div>
        </div>
      </div>
    );
  }
}

PageActions.defaultProps = {
  limit: 25,
  sort: false,
  pageType: '',
  orderField: '',
  orderDesc: false,
  updateSort: () => {},
  gotoPage: () => {},
  gotoPageValue: 1,
  handleChange: () => {},
  total_pages: 1,
  current_page: 1,
  updatePage: () => {},
  updateLimit: () => {},
};

PageActions.propTypes = {
  limit: PropTypes.number,
  sort: PropTypes.bool,
  pageType: PropTypes.string,
  orderField: PropTypes.string,
  orderDesc: PropTypes.bool,
  updateSort: PropTypes.func,
  gotoPage: PropTypes.func,
  gotoPageValue: PropTypes.number,
  handleChange: PropTypes.func,
  total_pages: PropTypes.number,
  current_page: PropTypes.number,
  updatePage: PropTypes.func,
  updateLimit: PropTypes.func,
};
