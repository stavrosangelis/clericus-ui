import React, { useEffect, useState} from 'react';
import axios from 'axios';
import PersonNetwork from '../../components/visualisations/person-network-pixi';
import {Breadcrumbs} from '../../components/breadcrumbs';
import { Spinner } from 'reactstrap';

const APIPath = process.env.REACT_APP_APIPATH;

const OrganisationGraph = props => {
  const [loading, setLoading] = useState(true);
  const [organisation, setOrganisation] = useState(null);

  useEffect(()=> {
    const load = async() => {
      let _id = props.match.params._id;
      if (typeof _id==="undefined" || _id===null || _id==="") {
        return false;
      }
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'ui-organisation',
        crossDomain: true,
        params: {_id:_id}
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setOrganisation(responseData);
    }
    if (loading) {
      load();
    }
  },[loading,props.match.params._id]);

  let breadcrumbsItems = [{label: "Organisations", icon: "pe-7s-culture", active: false, path: "/organisations"}];
  let content = <div className="graph-container" id="graph-container">
    <div className="graph-loading"><i>Loading data...</i> <Spinner color="info" /></div>
  </div>;

  let heading = "";
  if (!loading && organisation!==null) {
    let label = organisation.label;
    heading = `${label} network`;
    breadcrumbsItems.push(
      {label: label, icon: "pe-7s-culture", active: false, path: `/organisation/${props.match.params._id}`},
      {label: "Network", icon: "pe-7s-graph1", active: true, path: ""});

    content = <div className="graph-container" id="graph-container">
      <PersonNetwork _id={props.match.params._id} relatedLinks={[]} relatedNodes={[]} />
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

export default OrganisationGraph;
