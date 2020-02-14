import React, { Component } from 'react';
import { Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';

class HighLight extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //temp photo
      photo_url: "https://d4804za1f1gw.cloudfront.net/wp-content/uploads/sites/40/2019/03/25083837/RiceStreetBranchLib_4.jpg"
      
    }
  }

  render() {
    return(
      <div>
        <div className="highlight_section highlight-photo-container">
          <img src={this.state.photo_url} alt="" height="100%" width="100%"/>

          <div className="highlight_overlay">
            <Row>
              <Col className="content" xs="12" sm="4" md="4" lg="4">
                <h1>About</h1>
                <form>
                    <p>Content Below Your Video</p>
                    <label form="input_2">Form Input Label</label>
                    <input id="input" name="input" />
                    <button type="submit">Submit</button>
                </form>
              </Col>
              <Col className="content" xs="12" sm="4" md="4" lg="4">
                <Card body>
                  <CardTitle className="cardTitle">Special Title Treatment</CardTitle>
                  <CardText className="cardText">With supporting text below as a natural lead-in to additional content.</CardText>
                  <Button>Go somewhere</Button>
                </Card>
              </Col>
              <Col className="content" xs="12" sm="4" md="4" lg="4">
                <Card body>
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
