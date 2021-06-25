import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import dompurify from 'dompurify';

import '../../scss/news.scss';

const APIPath = process.env.REACT_APP_APIPATH;

const News = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const load = async () => {
      const params = {
        categoryName: 'News',
        page: 1,
        limit: 6,
        orderField: 'createdAt',
        orderDesc: 'true',
      };
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}content-articles`,
        crossDomain: true,
        params,
        cancelToken: source.token,
      })
        .then((response) => response.data.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined') {
        setArticles(responseData.data);
        setLoading(false);
      }
    };
    if (loading) {
      load();
    }
    return () => {
      source.cancel('api request cancelled');
    };
  }, [loading]);

  let content = [];
  const { length } = articles;
  if (!loading && length > 0) {
    let item1 = null;
    const items = [];
    for (let i = 0; i < length; i += 1) {
      const article = articles[i];
      let thumbPath = [];
      const featuredImage = article.featuredImageDetails;
      if (featuredImage !== null) {
        thumbPath = featuredImage.paths.find((p) => p.pathType === 'thumbnail')
          .path;
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
      const link = `/article/${article.permalink}`;
      const date = `${y}-${m}-${d}`;
      if (i === 0) {
        const sanitizer = dompurify.sanitize;
        item1 = (
          <div className="news-item">
            <div className="news-item-image">
              <Link href={link} to={link} title={article.label}>
                <img
                  className="img-fluid"
                  alt={article.label}
                  src={thumbPath}
                />
              </Link>
            </div>
            <div className="news-item-details">
              <h4>
                <Link href={link} to={link}>
                  {article.label}
                </Link>
              </h4>
              <div className="news-item-date">
                <i className="pe-7s-user" /> {article.author}{' '}
                <i className="pe-7s-clock" /> {date}
              </div>
              <div
                className="news-item-teaser"
                dangerouslySetInnerHTML={{ __html: sanitizer(article.teaser) }}
              />
            </div>
          </div>
        );
      } else {
        const item = (
          <div className="news-item-small" key={i}>
            <Link
              href={link}
              to={link}
              title={article.label}
              className="news-item-small-link"
            >
              <span
                className="news-item-image"
                style={{ backgroundImage: `url("${thumbPath}")` }}
              />
            </Link>
            <div className="news-item-details">
              <h4>
                <Link href={link} to={link}>
                  {article.label}
                </Link>
              </h4>
            </div>
            <div className="news-item-date">
              <div className="item">
                <i className="pe-7s-user" /> {article.author}
              </div>
              <div className="item">
                <i className="pe-7s-clock" /> {date}
              </div>
            </div>
          </div>
        );
        items.push(item);
      }
    }
    content = (
      <div className="news-container">
        <h4 className="section-title">
          <span>
            <span>N</span>ews
          </span>
        </h4>
        <div className="row">
          <div className="col-12 col-sm-6">{item1}</div>
          <div className="col-12 col-sm-6">{items}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="row">
      <div className="col-12">{content}</div>
    </div>
  );
};

export default News;
