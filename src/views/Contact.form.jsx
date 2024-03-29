import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from 'reactstrap';
import { load } from 'recaptcha-v3';
import dompurify from 'dompurify';
import { updateDocumentTitle } from '../helpers';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));

const { REACT_APP_APIPATH: APIPath } = process.env;

function ContactForm() {
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [article, setArticle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [error, setError] = useState({ visible: false, text: '' });
  const [successMsg, setSuccessMsg] = useState(false);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const subjectRef = useRef(null);
  const messageRef = useRef(null);

  const breadcrumbsItems = [];

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const form = { ...formData };
    form[name] = value;
    setFormData(form);
  };

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const loadData = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}content-article`,
        crossDomain: true,
        params: { permalink: 'contact' },
        signal: controller.signal,
      })
        .then((response) => response.data)
        .catch((err) => console.log(err));
      if (!unmounted) {
        setLoading(false);
        const { data = null } = responseData;
        if (data !== null) {
          setArticle(data);
        }
      }
    };
    if (loading) {
      loadData();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading]);

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

  const validate = () => {
    const { name = '', email = '', subject = '', message = '' } = formData;
    if (name.length < 1) {
      setError({
        visible: true,
        text: 'Please enter your name to continue!',
      });
      nameRef.current.focus();
      return false;
    }
    const emailRegex =
      /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      setError({
        visible: true,
        text: 'Please enter a valid email address to continue!',
      });
      emailRef.current.focus();
      return false;
    }
    if (subject.length < 1) {
      setError({
        visible: true,
        text: 'Please enter your subject to continue!',
      });
      subjectRef.current.focus();
      return false;
    }
    if (message.length < 11) {
      setError({
        visible: true,
        text: 'Your message must contain at least 10 characters!',
      });
      messageRef.current.focus();
      return false;
    }
    setError({
      visible: false,
      text: '',
    });
    return true;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      if (posting) {
        return false;
      }
      const { name = '', email = '', subject = '', message = '' } = formData;
      // 1. get recaptcha token
      const recaptcha = await load('6Le0OqYZAAAAAIAYSVXlog4aUuvzLXObIg_QD1pj');
      const token = await recaptcha.execute('reCAPTCHA_site_key');
      const postData = {
        name,
        email,
        subject,
        message,
        token,
      };
      setPosting(true);
      const responseData = await axios({
        method: 'post',
        url: `${APIPath}contact`,
        crossDomain: true,
        data: postData,
      })
        .then((response) => response.data)
        .catch((err) => console.log(err));
      if (responseData.status) {
        setSuccessMsg(true);
      } else {
        setError({
          visible: true,
          text: responseData.msg,
        });
      }
      setPosting(false);
    }
    return false;
  };

  if (!loading && article !== null) {
    const heading = article.label;
    updateDocumentTitle(heading);
    breadcrumbsItems.push({
      label: heading,
      icon: 'pe-7s-mail',
      active: true,
      path: '',
    });

    let errorContainerClass = ' hidden';
    if (error.visible) {
      errorContainerClass = '';
    }
    const errorContainer = (
      <div className={`error-container${errorContainerClass}`}>
        {error.text}
      </div>
    );

    let form = (
      <div>
        {errorContainer}
        <Form onSubmit={(e) => submitForm(e)}>
          <FormGroup>
            <Label for="name">Full Name*</Label>
            <Input
              id="name"
              onChange={handleChange}
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              innerRef={nameRef}
            />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email*</Label>
            <Input
              id="email"
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              innerRef={emailRef}
            />
          </FormGroup>
          <FormGroup>
            <Label for="subject">Subject*</Label>
            <Input
              id="subject"
              onChange={handleChange}
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              innerRef={subjectRef}
            />
          </FormGroup>
          <FormGroup>
            <Label for="message">Message*</Label>
            <Input
              id="message"
              onChange={handleChange}
              type="textarea"
              name="message"
              placeholder="Message"
              value={formData.message}
              innerRef={messageRef}
            />
          </FormGroup>
          <Button>
            Submit <i className="pe-7s-paper-plane" />
          </Button>
        </Form>
        <div className="text-end">
          <small>*Fields marked with an asterisk are mandatory</small>
        </div>
      </div>
    );
    if (successMsg) {
      form = (
        <div className="contact-form-success">
          Thank you for your contact. We will get back to you as soon as
          possible.
        </div>
      );
    }
    let logoImg = [];
    if (article.featuredImage !== null) {
      const imgSrc = article.featuredImageDetails.paths.find(
        (p) => p.pathType === 'source'
      );
      if (typeof imgSrc !== 'undefined') {
        logoImg = <img src={imgSrc.path} className="contact-img-logo" alt="" />;
      }
    }
    const sanitizer = dompurify.sanitize;
    content = (
      <div>
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <h3>{article.label}</h3>
                <div className="row">
                  <div className="col-12 col-sm-6 col-md-5 order-sm-2">
                    {logoImg}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: sanitizer(article.content),
                      }}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-md-7 order-sm-1">
                    {form}
                  </div>
                </div>
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

export default ContactForm;
