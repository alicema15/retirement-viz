import * as d3 from 'd3';

import * as aesthetics from './constants/aesthetics';
import './style.css';

// import disney_data from './data/disney_payload.json';
import test_data from './data/test.json';

// const data = disney_data.people_attributes;
const data = test_data

class VizPackage {
	constructor() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
	}

	initializeCanvas = (vizRef) => {
		this.svg = d3.select(vizRef).append('svg')
			.attr('class', 'svg-container')
			.attr('width', this.width)
			.attr('height', this.height);

		this.container = this.svg.append('g')
			.attr('transform', 'translate(' + aesthetics.MARGIN_LEFT + ',' + aesthetics.MARGIN_TOP + ')');

		this.xScale = d3.scaleLinear()
			.domain([0, 50])
			.range([0, aesthetics.CHART_WIDTH]);

		this.yScale = d3.scaleLinear()
			.domain([0, 50])
			.range([aesthetics.CHART_HEIGHT, 0]);

		this.generateLine = d3.line()
			.x((d) => { return this.xScale(d.age); })
			.y((d) => { return this.yScale(d.tenure); })
			.curve(d3.curveMonotoneX);

		this.xAxis = this.container.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + aesthetics.CHART_HEIGHT + ')')
			.call(d3.axisBottom(this.xScale));

		this.yAxis = this.container.append('g')
			.attr('class', 'y axis')
			.call(d3.axisLeft(this.yScale));

		this.line = this.container.append('path');
		this.point = this.container.append('g').selectAll('.point');
		this.update();
	}

	update = () => {
		const self = this;

		this.line = this.line.data([data])
			.attr('class', 'line')
			.attr('fill', 'none')
			.attr('stroke', aesthetics.TURQUOISE)
			.attr('stroke-width', aesthetics.LINE_WIDTH)
			.attr('d', this.generateLine);

		this.point = this.point.data(data);

		this.pointEnter = this.point.enter()
			.append('circle')
			.attr('class', 'point')
			.attr('r', aesthetics.POINT_RADIUS)
			.attr('cx', (d) => { return this.xScale(d.age); })
			.attr('cy', (d) => { return this.yScale(d.tenure); })
			.on('mouseenter', function(d) { self.mouseenter(d, this); })
			.on('mouseleave', function(d) { self.mouseleave(d, this); });
	
		this.point.exit().remove();
		this.point = this.pointEnter.merge(this.point);
	}

	mouseenter = (d, self) => {
		const point = d3.select(self);
		this.fadeNodes(d);
		this.fadeLinks(d);
	}

	mouseleave = (d, self) => {
		this.point.classed('faded', false);
		this.line.classed('faded', false);
	}

	fadeNodes = (d) => {
		this.point.classed('faded', (n) => { return n.id !== d.id; });
	}

	fadeLinks = (d) => {
  	this.line.classed('faded', (l) => { return true; });
	}

}

export default VizPackage;
