import React, { Component } from 'react';
import { Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';

class HighLight extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //temp photo
      photo_url: "https://d4804za1f1gw.cloudfront.net/wp-content/uploads/sites/40/2019/03/25083837/RiceStreetBranchLib_4.jpg",
    }
    
    this.timer = null;
    this.startTimer = this.startTimer.bind(this);
  }

  startTimer() {
    let count = 0;
    this.timer = setInterval(function(){
      if(count === 2000) {
        count = 0;
      }
      count++;
      let percent = 100 - count/10;
      let transform = "translate3d("+percent+"%, 0px, 0px)";
      document.getElementById("highlight_content").style.transform = transform;
    }, 10);
  }
  
  componentDidMount() {
    this.startTimer();
  }
  
  componentWillUnmount() {
    clearInterval(this.timer);
  }
    
  render() {
    return(
      <div>
        <div className="highlight_section highlight-photo-container">
          <img src={this.state.photo_url} alt="" height="100%" width="100%"/>

          <div id="highlight_content" className="highlight_overlay">
            <Row>
              <Col className="content" xs="12" sm="4" md="4" lg="4">
                <h1>HighLight</h1>
                <form>
                    <p>Content Below Your Video</p>
                    <label form="input_2">Form Input Label</label>
                    <input id="input" name="input" />
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

      </div>
    );
  }
}

export default HighLight;
