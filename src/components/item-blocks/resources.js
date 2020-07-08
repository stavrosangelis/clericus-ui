import React from 'react';
import {Link} from 'react-router-dom';

const Block = props => {
  let propsResources = props.resources;
  let classpieces = [];
  let resources = [];
  let classpiecesRow = [];
  let resourcesRow = [];
  for (let i=0;i<propsResources.length; i++) {
    let resource = propsResources[i];
    if(resource.term.label==="isDepictedOn"){
      let url = "/classpiece/"+resource.ref._id;
      classpieces.push(<li key={resource.ref._id}><Link className="tag-bg tag-item" to={url} href={url}>{resource.ref.label}</Link></li>);
    }
    else if (resource.term.label!=="hasRepresentationObject") {
      let url = "/resource/"+resource.ref._id;
      resources.push(<li key={resource.ref._id}><Link className="tag-bg tag-item" href={url} to={url}>{resource.ref.label}</Link></li>)
    }
  }
  if (classpieces.length>0) {
    classpiecesRow = <div key="classpiecesRow">
      <h5>Classpieces <small>[{classpieces.length}]</small>
        <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{props.toggleTable(e,"classpieces")}}>
          <i className={"fa fa-angle-down"+props.classpiecesHidden}/>
        </div>
      </h5>
      <div className={props.classpiecesVisible}><ul className="tag-list">{classpieces}</ul></div>
    </div>;
  }
  if (resources.length>0) {
    resourcesRow = <div key="resourcesRow">
      <h5>Resources <small>[{resources.length}]</small>
        <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{props.toggleTable(e,"resources")}}>
          <i className={"fa fa-angle-down"+props.resourcesHidden}/>
        </div>
      </h5>
      <div className={props.resourcesVisible}><ul className="tag-list">{resources}</ul></div>
    </div>;
  }
  let output = [classpiecesRow, resourcesRow];
  return (output)
}
export default Block;
