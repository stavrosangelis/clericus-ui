import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import moment from 'moment';

const outputTime = (time = '0ms') => {
  const t = time.replace('ms', '');
  const tTime = moment.duration(Number(t));
  let h = tTime.hours();
  let m = tTime.minutes();
  let s = tTime.seconds();
  let out = '';
  if (h > 0) {
    if (h < 10) {
      h = `0${h}`;
    }
    out += `${h}:`;
  }
  if (m > 0) {
    if (m < 10) {
      m = `0${m}`;
    }
    out += `${m}:`;
  } else {
    out += `00:`;
  }
  if (s > 0) {
    if (s < 10) {
      s = `0${s}s`;
    }
    out += `${s}s`;
  } else {
    out += `00s`;
  }
  return out;
};

export default function StatisticsModal(props) {
  const { stats = null } = props;
  const { fileCreateTime, links, nodes, simulationTime } = stats;
  const [visible, setVisible] = useState(false);
  const toggle = () => setVisible(!visible);

  const fcout = outputTime(fileCreateTime);
  const stout = outputTime(simulationTime);

  return (
    <>
      <div
        className="graph-statistics-button"
        title="Statistics"
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle statistics"
        onClick={() => toggle()}
      >
        <i className="fa fa-info" />
      </div>
      <Modal isOpen={visible} toggle={toggle} centered>
        <ModalHeader toggle={toggle}>Statistics</ModalHeader>
        <ModalBody>
          This graph network contains <b>{nodes}</b> nodes and <b>{links}</b>{' '}
          edges. <br /> The calculations for the network took <b>{fcout}</b>.{' '}
          <br />
          The graph force simulation took <b>{stout}</b>.
        </ModalBody>
        <ModalFooter className="justify-content-center">
          <Button
            color="secondary"
            size="sm"
            onClick={() => toggle()}
            aria-label="Close statistics modal"
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

StatisticsModal.defaultProps = {
  stats: {
    fileCreateTime: '0ms',
    links: 0,
    nodes: 0,
    simulationTime: '0ms',
  },
};
StatisticsModal.propTypes = {
  stats: PropTypes.shape({
    fileCreateTime: PropTypes.string,
    links: PropTypes.number,
    nodes: PropTypes.number,
    simulationTime: PropTypes.string,
  }),
};
