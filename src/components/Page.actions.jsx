import React from 'react';
import {
  Button,
  Input,
  InputGroup,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  // Collapse
} from 'reactstrap';
import PropTypes from 'prop-types';
import MainPagination from './Pagination';

import '../scss/page.actions.scss';

function PageActions(props) {
  // props
  const {
    current_page: currentPage,
    defaultLimit,
    gotoPage,
    gotoPageValue,
    handleChange,
    limit,
    orderDesc,
    orderField,
    pageType,
    sort,
    total_pages: totalPages,
    updateSort,
    updatePage,
    updateLimit,
  } = props;

  let limitActive0 = '';
  let limitActive1 = '';
  let limitActive2 = '';
  let limitActive3 = '';
  switch (limit) {
    case defaultLimit:
      limitActive0 = 'active';
      break;
    case defaultLimit * 2:
      limitActive1 = 'active';
      break;
    case defaultLimit * 4:
      limitActive2 = 'active';
      break;
    case defaultLimit * 20:
      limitActive3 = 'active';
      break;
    default:
      limitActive0 = 'active';
  }
  let sortItem = null;
  if (sort && pageType === 'people') {
    let lastNameSortIcon = [];
    let lastNameActive = '';
    let firstNameSortIcon = [];
    let firstNameActive = '';
    switch (orderField) {
      case 'lastName':
        if (orderDesc) {
          lastNameSortIcon = <i className="fa fa-caret-down" />;
        } else {
          lastNameSortIcon = <i className="fa fa-caret-up" />;
        }
        lastNameActive = 'active';
        break;
      case 'firstName':
        if (orderDesc) {
          firstNameSortIcon = <i className="fa fa-caret-down" />;
        } else {
          firstNameSortIcon = <i className="fa fa-caret-up" />;
        }
        firstNameActive = 'active';
        break;
      default:
        if (orderDesc) {
          lastNameSortIcon = <i className="fa fa-caret-down" />;
        } else {
          lastNameSortIcon = <i className="fa fa-caret-up" />;
        }
        lastNameActive = 'active';
        break;
    }
    sortItem = (
      <div className="page-action-item">
        <UncontrolledDropdown>
          <DropdownToggle caret size="sm" outline>
            Sort
          </DropdownToggle>
          <DropdownMenu end>
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
  if (
    sort &&
    (pageType === 'events' ||
      pageType === 'organisations' ||
      pageType === 'resources')
  ) {
    const sortIcon = orderDesc ? (
      <i className="fa fa-caret-down" />
    ) : (
      <i className="fa fa-caret-up" />
    );
    sortItem = (
      <div className="page-action-item">
        <UncontrolledDropdown>
          <DropdownToggle caret size="sm" outline>
            Sort
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem
              className="active"
              onClick={() => updateSort('label')}
            >
              Label {sortIcon}
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12">
        <div className="page-actions">
          <div className="go-to-page">
            <form onSubmit={gotoPage}>
              <InputGroup size="sm">
                <Input
                  name="gotoPage"
                  onChange={(e) => handleChange(e)}
                  value={gotoPageValue}
                  placeholder="0"
                />
                <div className="total-pages">/ {totalPages}</div>
                <Button
                  type="submit"
                  outline
                  color="secondary"
                  className="go-to-page-btn"
                >
                  <i className="fa fa-angle-right" />
                </Button>
              </InputGroup>
            </form>
          </div>

          <MainPagination
            limit={limit}
            currentPage={currentPage}
            totalPages={totalPages}
            paginationFn={updatePage}
          />

          <div className="page-action-item last">
            <UncontrolledDropdown>
              <DropdownToggle caret size="sm" outline>
                Limit
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem
                  className={limitActive0}
                  onClick={() => updateLimit(defaultLimit)}
                >
                  {defaultLimit}
                </DropdownItem>
                <DropdownItem
                  className={limitActive1}
                  onClick={() => updateLimit(defaultLimit * 2)}
                >
                  {defaultLimit * 2}
                </DropdownItem>
                <DropdownItem
                  className={limitActive2}
                  onClick={() => updateLimit(defaultLimit * 4)}
                >
                  {defaultLimit * 4}
                </DropdownItem>
                <DropdownItem
                  className={limitActive3}
                  onClick={() => updateLimit(defaultLimit * 20)}
                >
                  {defaultLimit * 20}
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

PageActions.defaultProps = {
  current_page: 1,
  defaultLimit: 25,
  gotoPage: () => {},
  gotoPageValue: 1,
  handleChange: () => {},
  limit: 25,
  orderDesc: false,
  orderField: '',
  pageType: '',
  sort: false,
  total_pages: 1,
  updateSort: () => {},
  updatePage: () => {},
  updateLimit: () => {},
};

PageActions.propTypes = {
  current_page: PropTypes.number,
  defaultLimit: PropTypes.number,
  gotoPage: PropTypes.func,
  gotoPageValue: PropTypes.number,
  handleChange: PropTypes.func,
  limit: PropTypes.number,
  orderDesc: PropTypes.bool,
  orderField: PropTypes.string,
  pageType: PropTypes.string,
  sort: PropTypes.bool,
  total_pages: PropTypes.number,
  updatePage: PropTypes.func,
  updateLimit: PropTypes.func,
  updateSort: PropTypes.func,
};

export default PageActions;
