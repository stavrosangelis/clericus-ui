import React, { useState, useEffect } from 'react';
import axios from 'axios';

const APIPath = process.env.REACT_APP_APIPATH;

const About = props => {
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'article',
        crossDomain: true,
        params: {permalink: 'about'}
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
  },[loading]);

  let content = [];
  if (!loading && article!==null) {
    content = <div>
      <h3>{article.label}</h3>
      <div dangerouslySetInnerHTML={{__html: article.teaser}}></div>
    </div>
  }
  return(
    <div className="row">
      <div className="col-12">
        {content}
      </div>
    </div>
  );
}

export default About;
