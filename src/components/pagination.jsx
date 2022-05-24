import React, { useEffect, useState } from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import PropTypes from 'prop-types';

import '../scss/pagination.scss';

function MainPagination(props) {
  // props
  const { currentPage, totalPages, paginationFn, className } = props;

  // state
  const [paginationItems, setPaginationItems] = useState([]);
  useEffect(() => {
    const createPagination = () => {
      let prevPage = 0;
      let nextPage = 0;

      if (currentPage < totalPages) {
        nextPage = currentPage + 1;
      }
      if (currentPage > 1) {
        prevPage = currentPage - 1;
      }
      const newPaginationItems = [];
      const paginationFirstItem = (
        <li key="first">
          <PaginationLink onClick={() => paginationFn(1)}>
            <i className="fa-step-backward fa" />
          </PaginationLink>
        </li>
      );
      const paginationPrevItem = (
        <li key="prev">
          <PaginationLink onClick={() => paginationFn(prevPage)}>
            <i className="fa-backward fa" />
          </PaginationLink>
        </li>
      );
      newPaginationItems.push(paginationFirstItem);
      newPaginationItems.push(paginationPrevItem);

      for (let j = 0; j < Number(totalPages); j += 1) {
        const pageNum = j + 1;
        const pageActive = currentPage === pageNum ? 'active' : '';
        let paginationItem = (
          <PaginationItem key={pageNum} className={pageActive}>
            <PaginationLink onClick={() => paginationFn(pageNum)}>
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
          newPaginationItems.push(paginationItem);
        }
        // normalize last page
        else if (currentPage >= totalPages - 4 && j > totalPages - 10) {
          newPaginationItems.push(paginationItem);
        }
        // the rest
        else if (j > currentPage - 6 && j < currentPage + 4) {
          newPaginationItems.push(paginationItem);
        }
      }

      const paginationNextItem = (
        <PaginationItem key="next">
          <PaginationLink onClick={() => paginationFn(nextPage)}>
            <i className="fa-forward fa" />
          </PaginationLink>
        </PaginationItem>
      );
      const paginationLastItem = (
        <PaginationItem key="last">
          <PaginationLink onClick={() => paginationFn(totalPages)}>
            <i className="fa-step-forward fa" />
          </PaginationLink>
        </PaginationItem>
      );
      newPaginationItems.push(paginationNextItem);
      newPaginationItems.push(paginationLastItem);

      return newPaginationItems;
    };
    setPaginationItems(createPagination());
  }, [currentPage, totalPages, paginationFn]);

  const classNameString = className !== '' ? ` ${className}` : '';
  return (
    <div className={`pagination-container${classNameString}`}>
      <Pagination>{paginationItems}</Pagination>
    </div>
  );
}

MainPagination.defaultProps = {
  className: '',
  currentPage: 1,
  totalPages: 1,
  paginationFn: () => {},
};

MainPagination.propTypes = {
  className: PropTypes.string,
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  paginationFn: PropTypes.func,
};

export default MainPagination;
