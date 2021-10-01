import React, { useEffect, useState } from 'react';

const Twitter = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let script = null;
    if (loading) {
      script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      script.onload = () => setLoading(false);

      document.body.appendChild(script);
    }
    return () => {
      if (script !== null) {
        document.body.removeChild(script);
      }
    };
  }, [loading]);

  return (
    <a
      className="twitter-timeline"
      data-height="240"
      href="https://twitter.com/ClericusDH?ref_src=twsrc%5Etfw"
    >
      Tweets by ClericusDH
    </a>
  );
};

export default Twitter;
