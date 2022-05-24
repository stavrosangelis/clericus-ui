import React, { useEffect, useState } from 'react';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const windowScroll = () => {
      const newVisible = document.documentElement.scrollTop > 200;
      setVisible(newVisible);
    };
    window.addEventListener('scroll', windowScroll);
    return () => {
      window.removeEventListener('scroll', windowScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const elem = visible ? (
    <div
      className="scroll-up"
      onClick={() => scrollToTop()}
      onKeyDown={() => scrollToTop()}
      role="button"
      tabIndex={0}
    >
      <i className="fa-chevron-up fa" />
    </div>
  ) : null;

  return elem;
}
export default ScrollToTop;
