import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from 'prop-types';

const { REACT_APP_APIPATH: APIPath } = process.env;

const cancelToken = axios.CancelToken;
const source = cancelToken.source();

function HelpArticle(props) {
  // state
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  // props
  const { permalink, visible, toggle } = props;

  const loadData = useCallback(async () => {
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}content-article`,
      crossDomain: true,
      params: { permalink },
      cancelToken: source.token,
    })
      .then((response) => response.data)
      .catch((error) => console.log(error));
    return responseData;
  }, [permalink]);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}content-article`,
        crossDomain: true,
        params: { permalink },
        signal: controller.signal,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (!unmounted) {
        setLoading(false);
        const { data = null } = responseData;
        if (data !== null) {
          setArticle(data);
        }
      }
    };
    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading, loadData, permalink]);

  let label = '';
  let content = '';
  if (!loading && article !== null) {
    label = article.label;
    content = article.content;
  }
  return (
    <Modal isOpen={visible} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>{label}</ModalHeader>
      <ModalBody dangerouslySetInnerHTML={{ __html: content }} />
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
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
