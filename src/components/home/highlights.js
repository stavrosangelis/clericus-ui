import React, { useState, useEffect } from 'react';
import {getResourceThumbnailURL} from '../../helpers/helpers';
import {Link} from 'react-router-dom';
import axios from 'axios';
import { Card, CardBody } from 'reactstrap';

const APIPath = process.env.REACT_APP_APIPATH;

const HighLights = props => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let params = {
        page: 1,
        limit: 4,
      };
      let responseData = await axios({
        method: 'get',
        url: APIPath+'classpieces',
        crossDomain: true,
        params: params
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setItems(responseData.data);
    }
    if (loading) {
      load();
    }
  },[loading]);

  let classpieces = [];
  if (!loading && items.length>0) {
    classpieces = items.map((item,i)=>{
      let parseUrl = "/classpiece/"+item._id;
      let thumbnailPath = getResourceThumbnailURL(item);
      let newDate = new Date(item.updatedAt);
      let y = newDate.getFullYear();
      let m = newDate.getMonth();
      if (m<10) {
        m = `0${m}`;
      }
      let d = newDate.getDay();
      if (d<10) {
        d = `0${d}`;
      }
      let date = `${y}-${m}-${d}`;
      return <div className="col-12 col-sm-6 col-md-3 home-highlight-container" key={i}>
        <Card className="home-highlight card_shadow card_shift">
          <CardBody>
            <div className="home-highlight-img" style={{backgroundImage: `url("${thumbnailPath}")`}}></div>
            <div className="home-highlight-text">
              <h4><Link to={parseUrl} href={parseUrl} className="cardTitle">{item.label}</Link></h4>
              <div className="home-highlight-caption cardText">
                <i className="pe-7s-clock" /> {date}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    });
  }
  return (
    <div>
      <h3 className="section-title"><span className="article-title" style={{color: "#ffffff"}}>Highlights</span></h3>
      <div className="row">{classpieces}</div>
    </div>
  );
}

export default HighLights;
