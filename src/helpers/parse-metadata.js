import React from 'react';

const parseMetadata = (metadata = null) => {
  if (metadata === null) {
    return null;
  }
  const output = [];
  const keys = Object.keys(metadata);
  const { length } = keys;
  for (let i = 0; i < length; i += 1) {
    const key = keys[i];
    const row = metadata[key];
    if (row !== null) {
      if (typeof row === 'object') {
        const children = parseMetadata(row);
        output.push(
          <div key={key} className="technical-metadata">
            <b>{key}</b>: {children}
          </div>
        );
      }
      if (typeof row === 'string' || typeof row === 'number') {
        output.push(
          <div key={key}>
            <b>{key}</b>: {row}
          </div>
        );
      }
    }
  }
  return output;
};

export default parseMetadata;
