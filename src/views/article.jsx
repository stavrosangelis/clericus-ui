import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import axios from 'axios';
import { Spinner, Card, CardBody } from 'reactstrap';
import { useSelector } from 'react-redux';
import dompurify from 'dompurify';
import { useParams } from 'react-router-dom';
import { updateDocumentTitle } from '../helpers';

import '../scss/article.scss';

const { REACT_APP_APIPATH: APIPath } = process.env;
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));

function Article() {
  const { permalink } = useParams();

  // state
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  const genericStats = useSelector((state) => state.genericStats);
  const [articleContent, setArticleContent] = useState(null);
  const prevGenericStats = useRef(null);
  const prevPermalink = useRef(null);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      prevPermalink.current = permalink;
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
          setArticleContent(data.content);
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
  }, [loading, permalink]);

  useEffect(() => {
    if (!loading && prevPermalink.current !== permalink) {
      prevPermalink.current = permalink;
      setLoading(true);
      setArticle(null);
    }
  }, [permalink, loading]);

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
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      {content}
    </div>
  );
}

export default Article;
