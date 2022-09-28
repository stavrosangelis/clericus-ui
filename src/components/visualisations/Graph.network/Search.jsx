import React, { useEffect, useState } from 'react';
import { Badge, Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import Results from './Search.results';

export default function GraphSearch(props) {
  const [visible, setVisible] = useState(false);
  const [tabs, setTabs] = useState({
    nodes: true,
    paths: false,
  });
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [error, setError] = useState({
    visible: false,
    text: '',
  });

  const {
    center,
    clearSelectedNode,
    error: propsError = '',
    searchPaths,
    selectNode,
    success,
  } = props;

  useEffect(() => {
    if (visible && propsError !== '') {
      setError({
        visible: true,
        text: propsError,
      });
    }
  }, [propsError, visible]);

  useEffect(() => {
    if (visible && success) {
      setVisible(false);
    }
  }, [success, visible]);

  const toggle = () => {
    setVisible(!visible);
  };

  const toggleTabs = (tab) => {
    const copy = { ...tabs };
    // eslint-disable-next-line no-restricted-syntax
    for (const [key] of Object.entries(copy)) {
      copy[key] = false;
    }
    copy[tab] = true;
    setTabs(copy);
  };

  const { nodes: tnodes = false, paths: tpaths = false } = tabs;
  const tab1 = tnodes ? ' active' : '';
  const tab2 = tpaths ? ' active' : '';

  const selectedNode = (node = null, type = 'source') => {
    selectNode(node, type);
    const { _id = '', label = '' } = node;
    if (type === 'source') {
      setSelectedSource({
        _id,
        label,
      });
    } else if (type === 'target') {
      setSelectedTarget({
        _id,
        label,
      });
    }
  };

  const clearSelectedNodes = () => {
    setSelectedSource(null);
    setSelectedTarget(null);
    clearSelectedNode('source');
    clearSelectedNode('target');
  };

  const submitSearchPaths = () => {
    if (selectedSource === null) {
      setError({
        visible: true,
        text: (
          <span>
            Please select a &quot;<b>Source</b>&quot; Node to continue.
          </span>
        ),
      });
    } else if (selectedTarget === null) {
      setError({
        visible: true,
        text: (
          <span>
            Please select a &quot;<b>Target </b>&quot; Node to continue.
          </span>
        ),
      });
    } else {
      setError({
        visible: false,
        text: '',
      });
      setSelectedSource(null);
      setSelectedTarget(null);
      searchPaths();
    }
  };

  const centerNode = (_id) => {
    setVisible(false);
    center(_id);
  };

  const sourceSel =
    selectedSource !== null ? (
      <Badge color="info" pill>
        {selectedSource._id}. {selectedSource.label}
      </Badge>
    ) : null;

  const arrow =
    selectedSource !== null ? (
      <i className="fa fa-long-arrow-alt-right" />
    ) : null;

  const targetSel =
    selectedTarget !== null ? (
      <Badge color="info" pill>
        {selectedTarget._id}. {selectedTarget.label}
      </Badge>
    ) : null;

  const selectedSourcesTitle =
    selectedSource !== null || selectedTarget !== null ? (
      <h4>Selected sources</h4>
    ) : null;

  const errorContainerClass = error.visible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{error.text}</div>
  );

  return (
    <>
      <div
        className="graph-search-toggle"
        title="Search"
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle search"
        onClick={() => toggle()}
      >
        <i className="fa fa-search" />
      </div>
      <Modal isOpen={visible} toggle={toggle} centered>
        <ModalHeader toggle={toggle}>Search</ModalHeader>
        <ModalBody>
          <div className="tabs-container">
            <div className="tabs-header">
              <div
                className={`tab-header${tab1}`}
                onClick={() => toggleTabs('nodes')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle nodes tab"
              >
                Nodes
              </div>
              <div
                className={`tab-header${tab2}`}
                onClick={() => toggleTabs('paths')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle paths tab"
              >
                Paths
              </div>
            </div>
            <div className={`tab-content${tab1}`}>
              <Results submitType="simple" centerNode={centerNode} />
            </div>
            <div className={`tab-content${tab2}`}>
              {errorContainer}
              <Results
                submitType="source"
                selectNode={selectedNode}
                clearSelectedNode={clearSelectedNode}
              />
              <Results
                submitType="target"
                selectNode={selectedNode}
                clearSelectedNode={clearSelectedNode}
              />
              <div className="graph-search-paths-selected">
                {selectedSourcesTitle}
                {sourceSel} {arrow} {targetSel}
              </div>
              <div className="graph-search-paths-footer">
                <Button
                  size="sm"
                  type="button"
                  onClick={() => clearSelectedNodes()}
                >
                  Clear search <i className="fa fa-times" />
                </Button>
                <Button
                  size="sm"
                  type="button"
                  color="success"
                  onClick={() => submitSearchPaths()}
                >
                  Search for paths <i className="fa fa-search" />
                </Button>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
GraphSearch.defaultProps = {
  error: '',
};

GraphSearch.propTypes = {
  error: PropTypes.string,
  center: PropTypes.func.isRequired,
  selectNode: PropTypes.func.isRequired,
  clearSelectedNode: PropTypes.func.isRequired,
  searchPaths: PropTypes.func.isRequired,
  success: PropTypes.bool.isRequired,
};
