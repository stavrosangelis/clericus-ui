import React, {useEffect,useState} from 'react';
import {getCookie, setCookie} from '../helpers';
import {Button} from 'reactstrap';
const CookiesConsent = props => {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    const isVisible = () => {
      setLoading(false);
      let accepted = getCookie("clericus_cookies_consent");
      if (accepted==="true") {
        setVisible(false)
      }
    }
    if (loading) {
      isVisible();
    }
  },[loading]);

  const acceptConsent = () => {
    let currentDate = new Date();
    let nextMonth = new Date();
    nextMonth.setDate(currentDate.getDate() + 30);
    setCookie("clericus_cookies_consent", "true", nextMonth);
    setVisible(false)
  }

  let hiddenClass="";
  if (!visible) {
    hiddenClass = " hidden";
  }
  return(
    <div className={"cookies-consent-container"+hiddenClass}>
      <div className="cookies-consent-content">
        <p>The Clericus website uses cookies to ensure the best experience for our visitors. By continuing to use the Clericus website you are agreeing to our <a href="/article/privacy">Privacy & Cookies</a> policy.</p>

        <Button size="sm" color="secondary" type="button" onClick={acceptConsent}>Accept</Button>
      </div>
    </div>
  );

}

export default CookiesConsent;
