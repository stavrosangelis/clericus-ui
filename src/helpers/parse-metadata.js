import React from 'react';
import { Label } from 'reactstrap';

const parseMetadataItems = (metaItems) => {
  let i = 0;
  const items = [];
  for (let metaKey = 0; metaKey < metaItems.length; metaKey += 1) {
    const value = metaItems[metaKey];
    let newRow = [];
    if (typeof value !== 'object') {
      newRow = (
        <div key={i}>
          <Label>{metaKey}</Label> : {metaItems[metaKey]}
        </div>
      );
    } else {
      const newRows = (
        <div className="list-items">{parseMetadataItems(value)}</div>
      );
      newRow = (
        <div key={i}>
          <div className="metadata-title">{metaKey}</div>
          {newRows}
        </div>
      );
    }
    items.push(newRow);
    i += 1;
  }
  return items;
};

const parseMetadata = (metadata) => {
  if (metadata === null) {
    return false;
  }
  const metadataOutput = [];
  let i = 0;
  for (let key = 0; key < metadata.length; key += 1) {
    const metaItems = metadata[key];
    let metadataOutputItems = [];
    if (metaItems !== null && typeof metaItems.length === 'undefined') {
      metadataOutputItems = parseMetadataItems(metaItems);
    } else if (metaItems !== null) {
      const newItems = parseMetadata(metaItems[0]);
      metadataOutputItems.push(newItems);
    }
    metadataOutputItems = (
      <div className="list-items">{metadataOutputItems}</div>
    );
    const metaRow = (
      <div key={i}>
        <div className="metadata-title">{key}</div>
        {metadataOutputItems}
      </div>
    );
    metadataOutput.push(metaRow);
    i += 1;
  }
  return metadataOutput;
};

export default parseMetadata;
