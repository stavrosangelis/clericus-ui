import React, { useEffect, useState} from 'react';
import axios from 'axios';
import ClasspieceNetwork from '../../components/visualisations/classpiece-network';
import {Breadcrumbs} from '../../components/breadcrumbs';
import { Spinner } from 'reactstrap';

const APIPath = process.env.REACT_APP_APIPATH;

const ClasspieceGraph = props => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);

  useEffect(()=> {
    const load = async() => {
      let _id = props.match.params._id;
      if (typeof _id==="undefined" || _id===null || _id==="") {
        return false;
      }
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'classpiece',
        crossDomain: true,
        params: {_id:_id}
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setItem(responseData);
    }
    if (loading) {
      load();
    }
  },[loading,props.match.params._id]);

  let breadcrumbsItems = [{label: "Classpieces", icon: "pe-7s-photo", active: false, path: "/classpieces"}];
  let content = <div className="graph-container" id="graph-container">
    <div className="graph-loading"><i>Loading data...</i> <Spinner color="info" /></div>
  </div>;

  let heading = "";
  if (!loading && item!==null) {
    let label = item.label;
    heading = `${label} network`;
    breadcrumbsItems.push(
      {label: label, icon: "pe-7s-photo", active: false, path: `/classpiece/${props.match.params._id}`},
      {label: "Network", icon: "pe-7s-graph1", active: true, path: ""});

    content = <div className="graph-container" id="graph-container">
      <ClasspieceNetwork _id={props.match.params._id} relatedLinks={[]} relatedNodes={[]} />
    </div>;
  }
  return (
    <div className="container">
      <Breadcrumbs items={breadcrumbsItems} />
      <h3>{heading}</h3>
      {content}
    </div>
  )
}

export default ClasspieceGraph;
