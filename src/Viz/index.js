import React, { Component } from 'react';

class Viz extends Component {

	componentDidMount() {
		this.props.viz.initializeCanvas(this.refs.vizContainer);
	}

	render() {
		return (
			<div id='viz-container' ref='vizContainer'/>
		);
	}
}

export default Viz;