import React, { useEffect, useState, lazy, Suspense} from 'react';
import axios from 'axios';
import {Breadcrumbs} from '../../components/breadcrumbs';
import { Spinner } from 'reactstrap';
import {updateDocumentTitle,renderLoader} from '../../helpers';
const PersonNetwork = lazy(() => import('../../components/visualisations/person-network-pixi'));
const APIPath = process.env.REACT_APP_APIPATH;

const SpatialGraph = props => {
  const [loading, setLoading] = useState(true);
  const [spatial, setSpatial] = useState(null);

  useEffect(()=> {
    const load = async() => {
      let _id = props.match.params._id;
      if (typeof _id==="undefined" || _id===null || _id==="") {
        return false;
      }
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'spatial',
        crossDomain: true,
        params: {_id:_id}
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setSpatial(responseData);
    }
    if (loading) {
      load();
    }
  },[loading,props.match.params._id]);

  let breadcrumbsItems = [{label: "Spatials", icon: "pe-7s-date", active: false, path: "/spatials"}];
  let content = <div className="graph-container" id="graph-container">
    <div className="graph-loading"><i>Loading data...</i> <Spinner color="info" /></div>
  </div>;

  let heading = "";
  if (!loading && spatial!==null) {
    let label = spatial.label;
    heading = `${label} network`;
    breadcrumbsItems.push(
      {label: label, icon: "pe-7s-date", active: false, path: `/spatial/${props.match.params._id}`},
      {label: "Network", icon: "pe-7s-graph1", active: true, path: ""});
    let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
    updateDocumentTitle(documentTitle);
    content = <div className="graph-container" id="graph-container">
      <Suspense fallback={renderLoader()}>
        <PersonNetwork _id={props.match.params._id} relatedLinks={[]} relatedNodes={[]} />
      </Suspense>
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

export default SpatialGraph;
