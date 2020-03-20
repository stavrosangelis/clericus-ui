import React from 'react';

export const parseMetadata = (metadata) => {
  if (metadata===null) {
    return false;
  }
  let metadataOutput = [];
  let i = 0;
  for (let key in metadata) {
    let metaItems = metadata[key];
    let metadataOutputItems = [];
    if (metaItems!==null && typeof metaItems.length==="undefined") {
      metadataOutputItems = parseMetadataItems(metaItems);
    }
    else {
      if (metaItems!==null) {
        let newItems = parseMetadata(metaItems[0]);
        metadataOutputItems.push(newItems)
      }
    }
    metadataOutputItems = <div className="list-items">{metadataOutputItems}</div>;
    let metaRow = <div key={i}>
        <div className="metadata-title">{key}</div>
        {metadataOutputItems}
      </div>
    metadataOutput.push(metaRow);
    i++;
  }
  return metadataOutput;
}

const parseMetadataItems = (metaItems) => {
  let i=0;
  let items = [];
  for (let metaKey in metaItems) {
    let value = metaItems[metaKey];
    let newRow = [];
    if (typeof value!=="object") {
      newRow = <div key={i}><label>{metaKey}</label> : {metaItems[metaKey]}</div>
    }
    else {
      let newRows = <div className="list-items">{parseMetadataItems(value)}</div>;
      newRow = <div key={i}><div className="metadata-title">{metaKey}</div>{newRows}</div>
    }
    items.push(newRow);
    i++
  }
  return items;
}