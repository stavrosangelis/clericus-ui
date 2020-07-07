import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const APIPath = process.env.REACT_APP_APIPATH;

const HelpArticle = props => {
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'content-article',
        crossDomain: true,
        params: {permalink: props.permalink}
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      setArticle(responseData.data);
    }
    if (loading) {
      load();
    }
  },[loading,props.permalink]);

  let content = [];
  if (!loading && article!==null) {
    content = <Modal isOpen={props.visible} toggle={props.toggle} size="lg">
      <ModalHeader toggle={props.toggle}>{article.label}</ModalHeader>
      <ModalBody dangerouslySetInnerHTML={{__html: article.content}}></ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={props.toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  }

  return(
    <div style={{padding: "0 15px"}}>{content}</div>
  );
}

export default HelpArticle;
