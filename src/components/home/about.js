import React, { Component } from 'react';
import { Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';

class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //temp video
      videoUrl: "https://d4804za1f1gw.cloudfront.net/wp-content/uploads/sites/40/2019/11/19200050/116588455-mississippi-river-st-paul-mn_H264HD1080.mp4",
      
    }
  }

  render() {
    let waveShape_top = 
            <svg width="100%" viewBox="0 175 1440 130" preserveAspectRatio="none">
            <path fill="#00334d" fillOpacity="0.9" d="M0,224L0,245.7C120,245,240,267,360,272C480,277,600,267,720,256C840,245,960,235,1080,234.7C1200,235,1320,245,1380,250.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z">
            </path></svg>
    let waveShape_bottom = 
            <svg width="100%" viewBox="0 200 1440 165" preserveAspectRatio="none">
            <path fill="#00334d" fillOpacity="0.9" d="M0,224L60,234.7C120,245,240,267,360,272C480,277,600,267,720,256C840,245,960,235,1080,234.7C1200,235,1320,245,1380,250.7L1440,256L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z">
            </path></svg>

    return(
      <div className="about-container">
        {waveShape_top}

        <div className="waveShapeMiddle about-video-container">
          <video id="aboutVideo" loop autoPlay muted={true} height="100%" width="100%">
            <source src={this.state.videoUrl} type="video/mp4" />
            <source src={this.state.videoUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
          
          <div className="waveShape_overlay">
            <Row>
              <Col className="content" xs="12" sm="4" md="4" lg="4">
                <h1>About</h1>
                <form>
                    <p>Content Below Your Video</p>
                    <label form="input">Form Input Label</label>
                    <input id="input_1" name="input" />
                    <button type="submit">Submit</button>
                </form>
              </Col>
              <Col className="content" xs="12" sm="4" md="4" lg="4">
                <Card body className="card_shadow card_shift">
                  <CardTitle className="cardTitle">Special Title Treatment</CardTitle>
                  <CardText className="cardText">With supporting text below as a natural lead-in to additional content.</CardText>
                  <Button>Go somewhere</Button>
                </Card>
              </Col>
              <Col className="content" xs="12" sm="4" md="4" lg="4">
                <Card body className="card_shadow card_shift">
                  <CardTitle className="cardTitle">Special Title Treatment</CardTitle>
                  <CardText className="cardText">With supporting text below as a natural lead-in to additional content.</CardText>
                  <Button>Go somewhere</Button>
                </Card>
              </Col>
            </Row>  
          </div>
        </div>
        
        {waveShape_bottom}
      </div>
    );
  }
}

export default About;
