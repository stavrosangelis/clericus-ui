import React from 'react';
import muahilogo from '../assets/images/logo-transparentx400.png';
import spcmlogo from '../assets/images/spcm-logo.png';
import mUlogo from '../assets/images/M10520_Maynooth_University_Know_No_Bounds_Logo_English-RGB.jpg';
import ccImg from '../assets/images/by-nc-nd.jpg';

import BottomMenu from './bottom-menu';

const Footer = () => (
  <div className="footer-container">
    <div className="footer">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-4">
            <div className="contact-info">
              <h4>Affiliations</h4>
              <div>
                <a
                  href="https://www.maynoothuniversity.ie/arts-and-humanities-institute"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={muahilogo}
                    alt="Arts & Humanities Institute - Maynooth University logo"
                    title="Arts & Humanities Institute - Maynooth University"
                    className="muahi-footer-logo img-fluid"
                  />
                </a>
                <a
                  href="https://maynoothcollege.ie/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={spcmlogo}
                    alt="St Patrick's College, Maynooth logo"
                    title="St Patrick's College, Maynooth"
                    className="spcm-footer-logo img-fluid"
                  />
                </a>
              </div>
              <div>
                <a
                  href="https://www.maynoothuniversity.ie/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={mUlogo}
                    alt="Maynooth University logo"
                    title="Maynooth University"
                    className="mu-footer-logo img-fluid"
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <BottomMenu />
          </div>
          <div className="col-12 col-md-3" />
        </div>
      </div>
    </div>

    <div className="footer-2">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-sm-9">
            <div className="small-text">
              Copyright &copy; 2020 Maynooth University and St. Patrick’s
              College Maynooth. All rights reserved.
            </div>
          </div>
          <div className="col-xs-12 col-sm-3">
            <a
              href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={ccImg}
                alt="Creative Commons - Attribution-NonCommercial-NoDerivatives International (CC BY-NC-ND)"
                title="Creative Commons - Attribution-NonCommercial-NoDerivatives International (CC BY-NC-ND)"
                className="cc-footer-img img-fluid"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Footer;
