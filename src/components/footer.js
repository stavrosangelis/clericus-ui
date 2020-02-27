import React from 'react';
import mUlogo from '../assets/images/M10520_Maynooth_University_Know_No_Bounds_Logo_English-RGB.jpeg';
import spcmlogo from '../assets/images/spcm-logo.png';

const Footer = (props) => {
  return (
    <div className="footer-container">
      <div className="footer">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-4">
              <div className="contact-info">
                <a href="https://www.maynoothuniversity.ie/" target="_blank" rel="noopener noreferrer">
                  <img src={mUlogo} alt="Maynooth University logo" className="mu-footer-logo img-fluid"/>
                </a>
                <a href="https://maynoothcollege.ie/" target="_blank" rel="noopener noreferrer">
                  <img src={spcmlogo} alt="St Patrick's College, Maynooth logo" className="spcm-footer-logo img-fluid"/>
                </a>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <ul className="footer-menu">
              </ul>
            </div>
            <div className="col-12 col-md-3"></div>
          </div>
        </div>
      </div>

      <div className="footer-2">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="small-text">Copyright &copy; 2020 Maynooth University and St. Patrick’s College Maynooth. All rights reserved.</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Footer;
