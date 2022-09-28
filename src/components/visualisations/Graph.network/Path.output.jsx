import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'reactstrap';

const colors = {
  Classpiece: 'graph-classpiece',
  Event: 'graph-event',
  Organisation: 'graph-organisation',
  Person: 'graph-person',
  Resource: 'graph-resource',
};
export default function PathOutput(props) {
  const { path, moveToNode } = props;

  const output = path.map((p, idx) => {
    const { start, relationship, end } = p;
    let startNode = null;
    if (idx === 0) {
      const {
        identity: sId = '',
        labels: sLabels = '',
        properties: sProperties = null,
      } = start;
      const [sType] = sLabels;
      const { label: sLabel = '' } = sProperties;
      startNode = (
        <Badge className={colors[sType]} onClick={() => moveToNode(sId)}>
          {sLabel}
        </Badge>
      );
    }

    const {
      identity: eId = '',
      labels: eLabels = '',
      properties: eProperties = null,
    } = end;
    const { identity: rId, type: rType = '' } = relationship;
    const [eType] = eLabels;
    const { label: eLabel = '' } = eProperties;
    return (
      <div key={`${rId}.${eId}`} className="graph-path">
        {startNode}
        <div className="graph-path-rel">
          <i className="fa fa-minus" /> [{rType}]{' '}
          <i className="fa fa-long-arrow-alt-right" />
        </div>
        <Badge className={colors[eType]} onClick={() => moveToNode(eId)}>
          {eLabel}
        </Badge>
      </div>
    );
  });
  return <div className="graph-paths">{output}</div>;
}

PathOutput.defaultProps = {
  path: [],
};

PathOutput.propTypes = {
  path: PropTypes.array,
  moveToNode: PropTypes.func.isRequired,
};
