import React, { useEffect, useState, lazy, Suspense} from 'react';
import axios from 'axios';
import {Breadcrumbs} from '../../components/breadcrumbs';
import { Spinner } from 'reactstrap';
import { useSelector } from "react-redux";
import {updateDocumentTitle,renderLoader} from '../../helpers';
const PersonNetwork = lazy(() => import('../../components/visualisations/person-network-pixi'));
const APIPath = process.env.REACT_APP_APIPATH;

const ResourceGraph = props => {
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);

  const loadingResourcesType = useSelector(state => state.loadingResourcesType);
  const resourcesType = useSelector(state => state.resourcesType);

  useEffect(()=> {
    const load = async() => {
      let _id = props.match.params._id;
      if (typeof _id==="undefined" || _id===null || _id==="") {
        return false;
      }
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'ui-resource',
        crossDomain: true,
        params: {_id:_id}
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setResource(responseData);
    }
    if (loading && !loadingResourcesType) {
      load();
    }
  },[loading,props.match.params._id, loadingResourcesType]);

  const getSystemType = () => {
    for(let i=0;i<resourcesType.length;i++) {
      if(resource.systemType === resourcesType[i]._id) {
        return resourcesType[i].label;
      }
    }
  }

  let breadcrumbsItems = [{label: "Resources", icon: "pe-7s-photo", active: false, path: "/resources"}];
  let content = <div className="graph-container" id="graph-container">
    <div className="graph-loading"><i>Loading data...</i> <Spinner color="info" /></div>
  </div>;

  let heading = "";
  if (!loading && resource!==null) {
    let dataType = getSystemType();
    let _idGraph = props.match.params._id;
    if (dataType === "Thumbnail") {
      if(resource.status === "private") {
        _idGraph = resource.people[0].ref._id;
      }
    }
    let label = resource.label;
    heading = `${label} network`;
    breadcrumbsItems.push(
      {label: label, icon: "pe-7s-photo", active: false, path: `/resource/${props.match.params._id}`},
      {label: "Network", icon: "pe-7s-graph1", active: true, path: ""});
    let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
    updateDocumentTitle(documentTitle);
    content = <div className="graph-container" id="graph-container">
      <Suspense fallback={renderLoader()}>
        <PersonNetwork _id={_idGraph} relatedLinks={[]} relatedNodes={[]} />
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

export default ResourceGraph;
