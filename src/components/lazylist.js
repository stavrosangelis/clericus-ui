import React, { useEffect, useState, useRef} from 'react';
import PropTypes from 'prop-types';

const LazyList = props => {
  let limit = props.limit || 50;
  let range = props.range || 25;
  let itemsLength = props.items.length || 0;
  const [loading,setLoading] = useState(true);
  const [items,setItems] = useState([]);
  const [startIndex,setStartIndex] = useState(0);
  const container = useRef(null);
  const prevNodes = useRef([]);
  const prevScrollIndex = useRef(0);

  useEffect(()=>{
    if (props.reload) {
      setLoading(true);
    }
  },[props.reload]);

  useEffect(()=>{
    if (prevNodes.current!==props.items) {
      setLoading(true);
      prevNodes.current=props.items;
    }
  },[props.items]);

  useEffect(()=>{
    const load = () => {
      let newData = props.items.slice(0,limit);
      setItems(newData);
      setLoading(false);
    }
    if (loading) {
      load();
    }
  },[loading, props.items, limit, items]);

  useEffect(()=> {
    let scrollIndex = props.scrollIndex;
    if (scrollIndex!==null) {
      if (scrollIndex!==prevScrollIndex.current) {
        prevScrollIndex.current = scrollIndex;
        let newStartIndex = 0;
        if (props.items.length>limit) {
          newStartIndex = scrollIndex - (limit/2);
        }
        let endIndex = newStartIndex+limit;
        if (endIndex>props.items.length) {
          endIndex = props.items.length;
        }
        let newData = props.items.slice(newStartIndex,endIndex);
        setItems(newData);
        setStartIndex(newStartIndex);
      }
    }
  },[props.scrollIndex, props.items, prevScrollIndex, limit, range]);

  useEffect(()=>{
    let wrapper = container.current;
    let domElem = document.querySelector(`*[data-lazylist-index="${props.scrollIndex-2}"]`);
    if (domElem===null) {
      domElem = document.querySelector(`*[data-lazylist-index="${props.scrollIndex-1}"]`);
    }
    if (domElem===null) {
      domElem = document.querySelector(`*[data-lazylist-index="${props.scrollIndex}"]`);
    }
    if (domElem!==null) {
      let scrollPos = domElem.offsetTop;
      wrapper.scrollTop = scrollPos;
    }
  },[props.scrollIndex, range]);

  const onScroll = () => {
    if (props.onScroll!==null) {
      return props.onScroll();
    }
  }

  const reDrawList = () => {
    let wrapper = container.current;
    let newStartIndex = startIndex;
    let update = false;
    if (wrapper.scrollHeight === (wrapper.scrollTop + wrapper.clientHeight)) {
      if ((startIndex+range)<=(itemsLength-limit+range)) {
        newStartIndex = startIndex+range;
        update = true;
      }
    }
    if (wrapper.scrollTop===0) {
      if (startIndex>range) {
        newStartIndex = startIndex-range;
        update = true;
      }
      else if (startIndex>0) {
        newStartIndex = 0;
        update = true;
      }
    }
    if (update) {
      let endIndex = newStartIndex+limit;
      let newData = props.items.slice(newStartIndex,endIndex+1);
      setItems(newData);
      setStartIndex(newStartIndex);
      let domElem = wrapper.querySelector(`*[data-lazylist-index="${newStartIndex+range}"]`);
      if (domElem!==null) {
        let scrollPos = domElem.offsetTop;
        wrapper.scrollTop = scrollPos;
      }
    }
  }

  let list = [];
  if (!loading && items.length>0) {
    let length = limit;
    if (length>items.length) {
      length = items.length;
    }
    for (let i=0;i<=length; i++) {
      let item = items[i];
      if (typeof item==="undefined" || item===null) {
        continue;
      }
      let index = i+startIndex;
      let order = "";
      if (props.ordered) {
        order = `${i+startIndex+1}. `;
      }
      list.push(<li key={index} data-lazylist-index={index}>{order}{props.renderItem(item)}</li>);
    }
  }


  let className="lazylist", listClassName="";
  if (props.containerClass!=="") {
    className += ` ${props.containerClass}`;
  }
  if (props.listClass!=="") {
    listClassName += ` ${props.listClass}`;
  }
  return <div className={className} ref={container} onScroll={()=>{
    reDrawList();
    onScroll();
  }}>
    <ul className={listClassName}>{list}</ul>
  </div>;
}

LazyList.defaultProps = {
  limit: 50,
  range: 25,
  items: [],
  containerClass: "",
  listClass: "",
  scrollIndex: null,
  onScroll: null,
  ordered: false
}

LazyList.propTypes = {
  limit: PropTypes.number,
  range: PropTypes.number,
  items: PropTypes.array,
  containerClass: PropTypes.string,
  listClass: PropTypes.string,
  renderItem: PropTypes.func.isRequired,
  onScroll: PropTypes.func,
  scrollIndex: PropTypes.number,
  ordered: PropTypes.bool,
}

export default LazyList;
