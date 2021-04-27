import React, { Component } from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import PropTypes from 'prop-types';

export default class MainPagination extends Component {
  constructor(props) {
    super(props);
    this.createPagination = this.createPagination.bind(this);
  }

  createPagination() {
    if (this.props) {
      const {
        current_page: currentPage,
        total_pages: lastPage,
        pagination_function: paginationFn,
      } = this.props;
      let prevPage = 0;
      let nextPage = 0;

      if (currentPage < lastPage) {
        nextPage = currentPage + 1;
      }
      if (currentPage > 1) {
        prevPage = currentPage - 1;
      }
      const paginationItems = [];
      const paginationFirstItem = (
        <li key="first">
          <PaginationLink className="href-btn" onClick={() => paginationFn(1)}>
            <i className="fa-step-backward fa" />
          </PaginationLink>
        </li>
      );
      const paginationPrevItem = (
        <li key="prev">
          <PaginationLink
            className="href-btn"
            onClick={() => paginationFn(prevPage)}
          >
            <i className="fa-backward fa" />
          </PaginationLink>
        </li>
      );
      paginationItems.push(paginationFirstItem);
      paginationItems.push(paginationPrevItem);

      for (let j = 0; j < parseInt(lastPage, 10); j += 1) {
        const pageNum = j + 1;
        let pageActive = '';

        if (currentPage === pageNum) {
          pageActive = 'active';
        }

        let paginationItem = (
          <PaginationItem key={pageNum} className={pageActive}>
            <PaginationLink
              className="href-btn"
              onClick={() => paginationFn(pageNum)}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        );
        if (pageActive === 'active') {
          paginationItem = (
            <PaginationItem key={pageNum} className={pageActive}>
              <PaginationLink>{pageNum}</PaginationLink>
            </PaginationItem>
          );
        }

        // normalize first page
        if (currentPage < 6 && j < 9) {
          paginationItems.push(paginationItem);
        }
        // noprmalize last page
        else if (currentPage >= lastPage - 4 && j > lastPage - 10) {
          paginationItems.push(paginationItem);
        }
        // the rest
        else if (j > currentPage - 6 && j < currentPage + 4) {
          paginationItems.push(paginationItem);
        }
      }

      const paginationNextItem = (
        <PaginationItem key="next">
          <PaginationLink
            className="href-btn"
            onClick={() => paginationFn(nextPage)}
          >
            <i className="fa-forward fa" />
          </PaginationLink>
        </PaginationItem>
      );
      const paginationLastItem = (
        <PaginationItem key="last">
          <PaginationLink
            className="href-btn"
            onClick={() => paginationFn(lastPage)}
          >
            <i className="fa-step-forward fa" />
          </PaginationLink>
        </PaginationItem>
      );
      paginationItems.push(paginationNextItem);
      paginationItems.push(paginationLastItem);

      return paginationItems;
    }
    return false;
  }

  render() {
    const { className } = this.props;
    const paginationItems = this.createPagination();
    return (
      <div className={`pagination-container ${className}`}>
        <Pagination>{paginationItems}</Pagination>
      </div>
    );
  }
}

MainPagination.defaultProps = {
  current_page: 1,
  total_pages: 1,
  pagination_function: () => {},
  className: '',
};
MainPagination.propTypes = {
  current_page: PropTypes.number,
  total_pages: PropTypes.number,
  pagination_function: PropTypes.func,
  className: PropTypes.string,
};
