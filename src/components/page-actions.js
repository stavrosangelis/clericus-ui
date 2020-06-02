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
    if (this.props.limit===25) {
      limitActive0 = "active";
    }
    if (this.props.limit===50) {
      limitActive1 = "active";
    }
    if (this.props.limit===100) {
      limitActive2 = "active";
    }
    if (this.props.limit===500) {
      limitActive3 = "active";
    }
    
    let sortItem = null;
    if(this.props.sort !== "") {
      let sortActive0 = "";
      let sortActive1 = "";
      let sortActive2 = "";
      let sortActive3 = "";
      if (this.props.sort==="asc_firstName") {
        sortActive0 = "active";
      }
      if (this.props.sort==="asc_lastName") {
        sortActive1 = "active";
      }
      if (this.props.sort==="desc_firstName") {
        sortActive2 = "active";
      }
      if (this.props.sort==="desc_lastName") {
        sortActive3 = "active";
      }
      
      sortItem = <div className="filter-item">
        <UncontrolledDropdown>
          <DropdownToggle caret size="sm" outline>
            Sort
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem className={sortActive0} onClick={this.props.updateSort.bind(this,"asc_firstName")}>ASC by First Name</DropdownItem>
            <DropdownItem className={sortActive1} onClick={this.props.updateSort.bind(this,"asc_lastName")}>ASC by Last Name</DropdownItem>
            <DropdownItem className={sortActive2} onClick={this.props.updateSort.bind(this,"desc_firstName")}>Desc by First Name</DropdownItem>
            <DropdownItem className={sortActive3} onClick={this.props.updateSort.bind(this,"desc_lastName")}>Desc by Last Name</DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    }

    return (
      <div className="row">
      <div className="col-12">
        <div className="page-actions text-right">

          <div className="go-to-page">
            <form onSubmit={this.props.gotoPage}>
            <InputGroup size="sm">
              <Input name="gotoPage" onChange={this.props.handleChange} value={this.props.gotoPageValue} placeholder="0" />
              <InputGroupAddon addonType="append"><div className="total-pages">/ {this.props.total_pages}</div></InputGroupAddon>
              <InputGroupAddon addonType="append"><Button type="submit" outline color="secondary" className="go-to-page-btn"><i className="fa fa-angle-right"></i></Button></InputGroupAddon>
            </InputGroup>
            </form>
          </div>

          <MainPagination
            limit={this.props.limit}
            current_page={this.props.current_page}
            total_pages={this.props.total_pages}
            pagination_function={this.props.updatePage}
            />

          <div className="filter-item">
            <UncontrolledDropdown>
              <DropdownToggle caret size="sm" outline>
                Limit
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem className={limitActive0} onClick={this.props.updateLimit.bind(this,25)}>25</DropdownItem>
                <DropdownItem className={limitActive1} onClick={this.props.updateLimit.bind(this,50)}>50</DropdownItem>
                <DropdownItem className={limitActive2} onClick={this.props.updateLimit.bind(this,100)}>100</DropdownItem>
                <DropdownItem className={limitActive3} onClick={this.props.updateLimit.bind(this,500)}>500</DropdownItem>
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
  sort: "",
}

PageActions.propTypes = {
  sort: PropTypes.string,
}