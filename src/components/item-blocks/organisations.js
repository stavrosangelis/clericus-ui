import React from 'react';
import {Link} from 'react-router-dom';

const Block = props => {
  let propsOrganisations = props.organisations;
  let organisationsRow = [];
  if (propsOrganisations.length>0) {
    let organisationsData = propsOrganisations.map(eachItem =>{

      let url = "/organisation/"+eachItem.ref._id;
      return <li key={eachItem.ref.label}><Link className="tag-bg tag-item" href={url} to={url}>{eachItem.ref.label}</Link></li>
    })
    organisationsRow = <div key="organisations">
      <h5>Organisations <small>[{propsOrganisations.length}]</small>
        <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{props.toggleTable(e,"organisations")}}>
          <i className={"fa fa-angle-down"+props.hidden}/>
        </div>
      </h5>
      <div className={props.visible}><ul className="tag-list">{organisationsData}</ul></div>
    </div>;
  }

  return (
    organisationsRow
  )
}
export default Block;
