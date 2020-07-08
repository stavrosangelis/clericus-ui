import React from 'react';
import {Link} from 'react-router-dom';
import {outputDate} from '../../helpers';

const Block = props => {
  let propsEvents = props.events;
  let eventsRow = [];
  if (propsEvents.length>0) {
    let eventsData = propsEvents.map(eachItem =>{
      let label = [<span key="label">{eachItem.ref.label}</span>];
      if (typeof eachItem.temporal!=="undefined" && eachItem.temporal.length>0) {
        let temporalLabels = eachItem.temporal.map((t,i)=>{
          let temp = t.ref;
          let tLabel = "";
          if (typeof temp.startDate!=="undefined" && temp.startDate!=="") {
            tLabel = outputDate(temp.startDate)
          }
          if (typeof temp.endDate!=="undefined" && temp.endDate!=="" && temp.endDate!==temp.startDate) {
            tLabel += " - "+outputDate(temp.endDate);
          }
          return `[${tLabel}]`;
        });
        if (temporalLabels.length>0) {
          let temporalLabel = temporalLabels.join(" | ");
          label.push(<span key="dates">{temporalLabel}</span>);
        }
      }
      let url = "/event/"+eachItem.ref._id;
      return <li key={eachItem.ref.label}><Link className="tag-bg tag-item" href={url} to={url}>{label}</Link></li>
    })
    eventsRow = <div key="events">
    <h5>Events <small>[{propsEvents.length}]</small>
    <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{props.toggleTable(e,"events")}}>
      <i className={"fa fa-angle-down"+props.hidden}/>
    </div>
    </h5>
    <div className={props.visible}><ul className="tag-list">{eventsData}</ul></div>
    </div>;
  }
  return (eventsRow)
}
export default Block;
