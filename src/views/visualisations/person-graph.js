import React, { useEffect, useState} from 'react';
import axios from 'axios';
import PersonNetwork from '../../components/visualisations/person-network-pixi';
import {Breadcrumbs} from '../../components/breadcrumbs';
import { Spinner } from 'reactstrap';

const APIPath = process.env.REACT_APP_APIPATH;

const PersonGraph = props => {
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState(null);

  useEffect(()=> {
    const load = async() => {
      let _id = props.match.params._id;
      if (typeof _id==="undefined" || _id===null || _id==="") {
        return false;
      }
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'ui-person',
        crossDomain: true,
        params: {_id:_id}
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setPerson(responseData);
    }
    if (loading) {
      load();
    }
  },[loading,props.match.params._id]);

  let breadcrumbsItems = [{label: "People", icon: "pe-7s-users", active: false, path: "/people"}];
  let content = <div className="graph-container" id="graph-container">
    <div className="graph-loading"><i>Loading data...</i> <Spinner color="info" /></div>
  </div>;

  let heading = "";
  if (!loading && person!==null) {
    let label = person.firstName;
    if (typeof person.middleName!=="undefined" && person.middleName!==null && person.middleName!=="") {
      label += " "+person.middleName;
    }
    label += " "+person.lastName;
    heading = `${label} network`;
    breadcrumbsItems.push(
      {label: label, icon: "pe-7s-user", active: false, path: `/person/${props.match.params._id}`},
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

export default PersonGraph;
