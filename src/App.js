import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Viz from './Viz';
import VizPackage from './vizPackage';


class App extends Component {
  constructor(props) {
    super(props);
    this.viz = new VizPackage();
  }

  render() {
    return (
      <Viz viz={ this.viz }/>
    );
  }
}

export default App;
