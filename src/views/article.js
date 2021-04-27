import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Spinner, Card, CardBody } from 'reactstrap';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import dompurify from 'dompurify';

import Breadcrumbs from '../components/breadcrumbs';
import { updateDocumentTitle } from '../helpers';

import '../scss/article.scss';

const APIPath = process.env.REACT_APP_APIPATH;

const Article = (props) => {
  // props
  const { match } = props;

  // state
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  const prevPermalink = useRef(match.params.permalink);
  const genericStats = useSelector((state) => state.genericStats);
  const [articleContent, setArticleContent] = useState(null);
  const prevGenericStats = useRef(null);

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const { permalink } = match.params;
    if (prevPermalink.current !== permalink) {
      prevPermalink.current = permalink;
      setLoading(true);
    }
    const load = async () => {
      setLoading(false);
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}content-article`,
        crossDomain: true,
        params: { permalink },
        cancelToken: source.token,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined' && responseData.status) {
        const newArticle = responseData.data;
        setArticle(newArticle);
        setArticleContent(newArticle.content);
      }
    };
    if (loading) {
      load();
    }
    return () => {
      if (!loading) {
        source.cancel('api request cancelled');
      }
    };
  }, [loading, match.params]);

  useEffect(() => {
    const updateArticleContent = () => {
      let newArticleContent = articleContent;
      const regex = /%(.*?)%/gm;
      const replaceStats = newArticleContent.match(regex);
      if (replaceStats !== null && replaceStats.length > 0) {
        for (let i = 0; i < replaceStats.length; i += 1) {
          const stat = replaceStats[i];
          const statElem = stat.replace(/%/g, '');
          const value = genericStats[statElem];
          const regexp = new RegExp(`${stat}`);
          newArticleContent = newArticleContent.replace(regexp, value);
        }
      }
      setArticleContent(newArticleContent);
    };
    if (
      articleContent !== null &&
      prevGenericStats !== genericStats &&
      genericStats.people > 0
    ) {
      updateArticleContent();
      prevGenericStats.current = genericStats;
    }
  }, [articleContent, genericStats]);

  let breadcrumbsItems = [];

  let content = (
    <div>
      <div className="row">
        <div className="col-12">
          <div style={{ padding: '40pt', textAlign: 'center' }}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>
  );

  if (!loading && article !== null) {
    updateDocumentTitle(article.label);
    const categories = article.categories.map((c) => ({
      label: c.label,
      icon: '',
      active: false,
      path: `/article-category/${c.permalink}`,
    }));
    breadcrumbsItems = [...categories, ...breadcrumbsItems];
    breadcrumbsItems.push({
      label: article.label,
      icon: 'pe-7s-newspaper',
      active: true,
      path: '',
    });
    const featuredImage = article.featuredImageDetails;
    let thumbnail = [];
    if (featuredImage !== null) {
      const thumbPath = featuredImage.paths.find(
        (p) => p.pathType === 'thumbnail'
      ).path;
      thumbnail = (
        <img
          className="img-fluid article-thumbnail"
          alt={article.label}
          src={thumbPath}
        />
      );
    }
    const newDate = new Date(article.updatedAt);
    const y = newDate.getFullYear();
    let m = newDate.getMonth();
    if (m < 10) {
      m = `0${m}`;
    }
    let d = newDate.getDay();
    if (d < 10) {
      d = `0${d}`;
    }
    const date = `${y}-${m}-${d}`;
    const sanitizer = dompurify.sanitize;
    content = (
      <div>
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <h3>{article.label}</h3>
                <div className="article-date">
                  <i className="pe-7s-user" /> {article.author}{' '}
                  <i className="pe-7s-clock" /> {date}
                </div>
                {thumbnail}
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{
                    __html: sanitizer(articleContent),
                  }}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <Breadcrumbs items={breadcrumbsItems} />
      {content}
    </div>
  );
};

Article.defaultProps = {
  match: null,
};
Article.propTypes = {
  match: PropTypes.object,
};

export default Article;
