import React, {Component} from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

export default class MainPagination extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paginationItems: []
    };
  }

  createPagination() {
    if (this.props) {
      let currentPage = this.props.current_page;
      let lastPage = this.props.total_pages;
      let prevPage = 0;
      let nextPage = 0;

      if (currentPage<lastPage) {
        nextPage = currentPage+1;
      }
      if (currentPage>1) {
        prevPage = currentPage-1;
      }
      let paginationItems = [];
      let paginationFirstItem = <li key="first">
        <PaginationLink className='href-btn' onClick={this.props.pagination_function.bind(this,1)}><i className="fa-step-backward fa"/></PaginationLink>
        </li>;
      let paginationPrevItem = <li key="prev"><PaginationLink className='href-btn' onClick={this.props.pagination_function.bind(this,prevPage)}><i className="fa-backward fa"/></PaginationLink></li>;
      paginationItems.push(paginationFirstItem);
      paginationItems.push(paginationPrevItem);

      for (let j=0; j<parseInt(lastPage,10);j++) {
        let pageNum = j+1;
        let pageActive = "";

        if (currentPage===pageNum) {
          pageActive = "active";
        }

        let paginationItem =  <PaginationItem key={pageNum} className={pageActive}><PaginationLink className='href-btn' onClick={this.props.pagination_function.bind(this,pageNum)}>{pageNum}</PaginationLink></PaginationItem>;
        if (pageActive === "active") {
          paginationItem = <PaginationItem key={pageNum} className={pageActive}><PaginationLink>{pageNum}</PaginationLink></PaginationItem>;
        }

        // normalize first page
        if (currentPage<6 && j<9) {
          paginationItems.push(paginationItem);
        }
        // noprmalize last page
        else if(currentPage>=lastPage-4 && j>lastPage-10 ) {
          paginationItems.push(paginationItem);
        }
        // the rest
        else if (j>currentPage-6 && j<currentPage+4 ){
          paginationItems.push(paginationItem);
        }
      }

      let paginationNextItem = <PaginationItem key="next"><PaginationLink className='href-btn' onClick={this.props.pagination_function.bind(this,nextPage)}><i className="fa-forward fa"/></PaginationLink></PaginationItem>;
      let paginationLastItem = <PaginationItem key="last"><PaginationLink className='href-btn' onClick={this.props.pagination_function.bind(this,lastPage)}><i className="fa-step-forward fa"/></PaginationLink></PaginationItem>;
      paginationItems.push(paginationNextItem);
      paginationItems.push(paginationLastItem);

      return paginationItems;
    }
  }
  render() {
    let paginationItems = this.createPagination();
    return (
      <div className="pagination-container">
        <Pagination>
          {paginationItems}
        </Pagination>
      </div>
    )
  }

}
