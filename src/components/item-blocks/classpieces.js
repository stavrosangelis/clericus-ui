import React, {useState} from 'react';
import {
  Button,
  Form, Input, InputGroup, InputGroupAddon,
} from 'reactstrap';
import {Link} from 'react-router-dom';
import Pagination from '../pagination';

const Block = props => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [simpleSearchSet, setSimpleSearchSet] = useState('');
  const [simpleSearchTerm, setSimpleSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 100;
  let pageIndex = page-1;
  let firstIndex = (pageIndex*limit)-1;
  let lastIndex = firstIndex+limit;

  const handleSearchTermChange = (e) => {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    setSimpleSearchTerm(value);
    setSimpleSearchSet(value);
  }

  const simpleSearch = (e) =>{
    if (typeof e!=="undefined") {
      e.preventDefault();
    }
    setSimpleSearchSet(simpleSearchTerm);
  }

  const clearSearch = e =>{
    setSimpleSearchTerm('');
    setSimpleSearchSet('');
  }

  const toggleSearch = () => {
    if(searchVisible) {
      setSearchVisible(!searchVisible);
    }
    else {
      setSearchVisible(!searchVisible);
    }
  }

  const updatePage = (e) => {
    if (e>0 && e!==page) {
      setPage(e);
    }
  }

  let propsClasspieces = props.items;
  let classpiecesRow = [];
  if (propsClasspieces.length>0) {
    let classpieces = propsClasspieces.filter(p=>p.ref.label.toLowerCase().includes(simpleSearchSet.toLowerCase()));
    let classPiecesData = [];
    for (let i=0;i<classpieces.length; i++) {
      if (i<=firstIndex) {
        continue;
      }
      if (i>lastIndex) {
        break;
      }
      let classpiece = classpieces[i];
      let url = "/classpiece/"+classpiece.ref._id;
      classPiecesData.push(<li key={classpiece.ref._id}><Link className="tag-bg tag-item" to={url} href={url}><i>{classpiece.term.label}</i> {classpiece.ref.label}</Link></li>);
    }
    let searchVisibleClass = "";
    if (searchVisible) {
      searchVisibleClass = "visible";
    }
    let searchBar = <div className={`tags-search-container ${searchVisibleClass}`}>
        <Form onSubmit={(e)=>simpleSearch(e)}>
          <InputGroup size="sm" className="search-dropdown-inputgroup classpiece-people-search-input">
            <Input className="simple-search-input" type="text" name="simpleSearchTerm" onChange={handleSearchTermChange} placeholder="Search..." value={simpleSearchTerm}/>
            <InputGroupAddon addonType="append">
              <Button size="sm" outline type="button" onClick={clearSearch} className="clear-search">
                <i className="fa fa-times-circle" />
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Form>
    </div>

    let totalPages = Math.ceil(classpieces.length/limit);
    let newPage = page;
    if (totalPages<newPage) {
      if (totalPages===0) {
        totalPages = 1;
      }
      newPage = totalPages;
    }
    let pagination = [];
    if (totalPages>1) {
      pagination = <div className="tag-list-pagination">
        <Pagination
        limit={limit}
        current_page={newPage}
        total_pages={totalPages}
        pagination_function={updatePage}
        className="mini people-tags-pagination"
      />
      <span>of {totalPages}</span>
      </div>
    }

    classpiecesRow = <div key="classpiecesRow">
      <h5>Classpieces <small>[{classpieces.length}]</small>
        <div className="btn btn-default btn-xs pull-right toggle-info-btn pull-icon-middle" onClick={(e)=>{props.toggleTable(e,"classpieces")}}>
          <i className={"fa fa-angle-down"+props.hidden}/>
        </div>
        <div className="tool-box pull-right classpiece-search">
          <div className="action-trigger" onClick={()=>toggleSearch()} id="search-tooltip">
            <i className="fa fa-search" />
          </div>
        </div>
      </h5>
      <div className={props.visible}>
        {searchBar}
        <ul className="tag-list">{classPiecesData}</ul>
        {pagination}
      </div>
    </div>;
  }
  return (classpiecesRow)
}
export default Block;
