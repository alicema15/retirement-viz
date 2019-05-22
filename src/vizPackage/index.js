import * as d3 from 'd3';

class VizPackage {
	constructor() {

	}

	initializeCanvas = (vizRef) => {
		this.svg = d3.select(vizRef).append('svg')
	      .attr('class', 'svg-container')
	      .attr('width', this.width)
	      .attr('height', this.height);

	    this.giantRectangle = this.svg.append('rect')
	    	.attr('fill', 'red')
	    	.attr('width', 500)
	    	.attr('height', 600)
	}
}

export default VizPackage;
