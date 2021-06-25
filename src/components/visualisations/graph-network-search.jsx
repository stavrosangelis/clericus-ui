import React, { useEffect, useState, useRef } from 'react';

const GraphSearch = (props) => {
  const limit = 50;
  const range = 25;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const container = useRef(null);
  const nodesLength = props.nodes.length;
  const prevNodes = useRef(null);

  useEffect(() => {
    if (props.reload) {
      setLoading(true);
    }
  }, [props.reload]);

  useEffect(() => {
    if (prevNodes.current !== props.nodes) {
      setLoading(true);
      prevNodes.current = props.nodes;
    }
  }, [props.nodes]);

  useEffect(() => {
    const load = () => {
      let newData = props.nodes.filter((n) => {
        if (typeof n.visible === 'undefined' || n.visible === true) {
          return true;
        }
        return false;
      });
      if (typeof newData !== 'undefined') {
        newData = newData.slice(0, limit);
      } else {
        newData = [];
      }
      setData(newData);
      setLoading(false);
    };
    if (loading && props.nodes.length > 0) {
      load();
    }
  }, [loading, props.nodes]);

  const reDrawList = () => {
    const wrapper = container.current;
    let newStartIndex = startIndex;
    let update = false;
    let elem = null;
    if (wrapper.scrollHeight === wrapper.scrollTop + wrapper.clientHeight) {
      if (startIndex + range < nodesLength - limit) {
        newStartIndex = startIndex + range;
        update = true;
        const lastIndex = data.length - 1 - range;
        elem = data[lastIndex];
      }
    }
    if (wrapper.scrollTop === 0) {
      if (startIndex >= range) {
        newStartIndex = startIndex - range;
        update = true;
        elem = data[0];
      }
    }
    if (update) {
      const endIndex = newStartIndex + limit;
      const newData = props.nodes.slice(newStartIndex, endIndex);
      setData(newData);
      setStartIndex(newStartIndex);
      const domElem = wrapper.querySelector(`*[data-id="${elem.id}"]`);
      if (domElem !== null) {
        const scrollPos = domElem.offsetTop;
        wrapper.scrollTop = scrollPos;
      }
    }
  };

  const list = [];
  if (!loading && data.length > 0) {
    let length = limit;
    if (length > data.length) {
      length = data.length;
    }
    for (let i = 0; i < length; i += 1) {
      const n = data[i];
      if (typeof n.visible === 'undefined' || n.visible === true) {
        list.push(
          <div key={i} data-id={n.id} onClick={() => props.centerNode(n.id)}>
            {n.label} <small>[{n.type}]</small>
          </div>
        );
      }
    }
  }
  return (
    <div
      className="graph-search-container-nodes"
      ref={container}
      onScroll={() => reDrawList()}
      onWheel={() => reDrawList()}
    >
      {list}
    </div>
  );
};
export default GraphSearch;
