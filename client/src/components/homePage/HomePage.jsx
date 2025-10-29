import React, { Component } from "react";
import {
  HomeDiv,
  HomeTitleTag,
  HomeTitleContainer,
  SubTitle,
} from "./HomeComponents";

export class HomePage extends Component {
  render() {
    return (
        <HomeDiv>
          <HomeTitleContainer>
            <HomeTitleTag>Welcome to your place of creativity!</HomeTitleTag>
          </HomeTitleContainer>
        </HomeDiv>
    );
  }
}
