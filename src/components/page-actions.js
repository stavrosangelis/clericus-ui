import React, {Component} from 'react';
import {
  Button,
  Input, InputGroup, InputGroupAddon,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  //Collapse
} from 'reactstrap';
import MainPagination from './pagination';
import PropTypes from 'prop-types';

export default class PageActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paginationItems: [],
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  render() {
    let limitActive0 = "";
    let limitActive1 = "";
    let limitActive2 = "";
    let limitActive3 = "";
    let props = this.props;
    if (props.limit===25) {
      limitActive0 = "active";
    }
    if (props.limit===50) {
      limitActive1 = "active";
    }
    if (props.limit===100) {
      limitActive2 = "active";
    }
    if (props.limit===500) {
      limitActive3 = "active";
    }
    let sortItem = null;
    if(props.sort) {
      if (props.pageType==="people") {
        let lastNameSortIcon = [];
        let lastNameActive = "";
        let firstNameSortIcon = [];
        let firstNameActive = "";
        if (props.orderField==="lastName" || props.orderField==="") {
          if (props.orderDesc) {
            lastNameSortIcon = <i className="fa fa-caret-down" />
          }
          else {
            lastNameSortIcon = <i className="fa fa-caret-up" />
          }
          lastNameActive = "active";
        }
        if (props.orderField==="firstName") {
          if (props.orderDesc) {
            firstNameSortIcon = <i className="fa fa-caret-down" />
          }
          else {
            firstNameSortIcon = <i className="fa fa-caret-up" />
          }
          firstNameActive = "active";
        }

        sortItem = <div className="page-action-item">
          <UncontrolledDropdown>
            <DropdownToggle caret size="sm" outline>
              Sort
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem className={lastNameActive} onClick={()=>props.updateSort("lastName")}>Last Name {lastNameSortIcon}</DropdownItem>
              <DropdownItem className={firstNameActive} onClick={()=>props.updateSort("firstName")}>First Name {firstNameSortIcon}</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      }
    }

    return (
      <div className="row">
      <div className="col-12">
        <div className="page-actions text-right">

          <div className="go-to-page">
            <form onSubmit={props.gotoPage}>
            <InputGroup size="sm">
              <Input name="gotoPage" onChange={props.handleChange} value={props.gotoPageValue} placeholder="0" />
              <InputGroupAddon addonType="append"><div className="total-pages">/ {props.total_pages}</div></InputGroupAddon>
              <InputGroupAddon addonType="append"><Button type="submit" outline color="secondary" className="go-to-page-btn"><i className="fa fa-angle-right"></i></Button></InputGroupAddon>
            </InputGroup>
            </form>
          </div>

          <MainPagination
            limit={props.limit}
            current_page={props.current_page}
            total_pages={props.total_pages}
            pagination_function={props.updatePage}
            />

          <div className="page-action-item">
            <UncontrolledDropdown>
              <DropdownToggle caret size="sm" outline>
                Limit
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem className={limitActive0} onClick={props.updateLimit.bind(this,25)}>25</DropdownItem>
                <DropdownItem className={limitActive1} onClick={props.updateLimit.bind(this,50)}>50</DropdownItem>
                <DropdownItem className={limitActive2} onClick={props.updateLimit.bind(this,100)}>100</DropdownItem>
                <DropdownItem className={limitActive3} onClick={props.updateLimit.bind(this,500)}>500</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>

          {sortItem}

        </div>
      </div>
    </div>

    )
  }

}

PageActions.defaultProps = {
  sort: false,
  orderField: "",
  orderDesc: false,
}

PageActions.propTypes = {
  sort: PropTypes.bool,
  orderField: PropTypes.string,
  orderDesc: PropTypes.bool,
}
