import * as d3 from 'd3';

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
			.attr('transform', 'translate(' + 30 + ',' + 30 + ')');

		this.xScale = d3.scaleLinear()
			.domain([0, 70])
			.range([0, 600]);

		this.yScale = d3.scaleLinear()
			.domain([0, 200])
			.range([200, 0]);

		this.generateLine = d3.line()
			.x((d) => { return this.xScale(d.age); })
			.y((d) => { return this.yScale(d.tenure); })
			.curve(d3.curveMonotoneX);

		this.line = this.container.append('path')
			.data([data])
			.attr('fill', 'none')
			.attr('stroke', '#70cbce')
			.attr('stroke-width', 3)
			.attr('d', this.generateLine);

		this.xAxis = this.container.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + 200 + ')')
			.call(d3.axisBottom(this.xScale));

		this.yAxis = this.container.append('g')
			.attr('class', 'y axis')
			.call(d3.axisLeft(this.yScale));

		this.point = this.container.append('g').selectAll('.point');
		this.point = this.point.data(data);

		this.pointsEnter = this.point
			.enter()
			.append('circle')
			.attr('class', 'point')
			.attr('r', 5)
			.attr('cx', (d) => { return this.xScale(d.age); })
			.attr('cy', (d) => { return this.yScale(d.tenure); });
	}
}

export default VizPackage;
