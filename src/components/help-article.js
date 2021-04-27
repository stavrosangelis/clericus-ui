import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from 'prop-types';

const APIPath = process.env.REACT_APP_APIPATH;

const HelpArticle = (props) => {
  // state
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  // props
  const { permalink, visible, toggle } = props;

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}content-article`,
        crossDomain: true,
        params: { permalink },
        cancelToken: source.token,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined') {
        setArticle(responseData.data);
        setLoading(false);
      }
    };
    if (loading) {
      load();
    }
    return () => {
      source.cancel('api request cancelled');
    };
  }, [loading, permalink]);

  let content = [];
  if (!loading && article !== null) {
    content = (
      <Modal isOpen={visible} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>{article.label}</ModalHeader>
        <ModalBody dangerouslySetInnerHTML={{ __html: article.content }} />
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return <div style={{ padding: '0 15px' }}>{content}</div>;
};
HelpArticle.defaultProps = {
  permalink: '',
  visible: false,
  toggle: () => {},
};
HelpArticle.propTypes = {
  permalink: PropTypes.string,
  visible: PropTypes.bool,
  toggle: PropTypes.func,
};
export default HelpArticle;
