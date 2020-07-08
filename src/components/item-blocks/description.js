import React from 'react';

const Block = props => {
  return (
    <div style={{minHeight: "25px"}}>
      <div className="btn btn-default btn-xs pull-right toggle-info-btn" onClick={(e)=>{props.toggleTable(e,"description")}}>
        <i className={"fa fa-angle-down"+props.hidden}/>
      </div>
      <div className={props.visible}>{props.description}</div>
    </div>
  )
}
export default Block;
