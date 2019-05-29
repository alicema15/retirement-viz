import * as d3 from 'd3';

import * as aesthetics from './constants/aesthetics';
import * as d3_utils from './helpers/d3_utils';
import './style.css';

import disney_data from './data/process_disney';
const data = disney_data;

// import test_data from './data/test.json';
// const data = test_data

class VizPackage {
	constructor() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.points = [];
	}

	initializeCanvas = (vizRef) => {
		const self = this; 

		this.points = data;
		this.xDomain = [data.reduce((min, p) => p.age < min ? p.age : min, data[0].age), data.reduce((max, p) => p.age > max ? p.age : max, data[0].age)];
		this.yDomain = [data.reduce((min, p) => p.tenure < min ? p.tenure : min, data[0].tenure), data.reduce((max, p) => p.tenure > max ? p.tenure : max, data[0].tenure)];

		this.svg = d3.select(vizRef).append('svg')
			.attr('class', 'svg-container')
			.attr('width', this.width)
			.attr('height', this.height);

		this.container = this.svg.append('g')
			.attr('class', 'chart-container')
			.attr('transform', 'translate(' + aesthetics.MARGIN_LEFT + ',' + aesthetics.MARGIN_TOP + ')');

		this.container
			.append('rect')
			.attr('class', 'chart-background')
			.attr('width', aesthetics.CHART_WIDTH)
			.attr('height', aesthetics.CHART_HEIGHT)
			.attr('fill-opacity', 0)
			.on('mouseenter', (d) => { this.focus.style('display', null); })
			.on('mousemove', function(d) { self.svgMousemove(this); })
			.on('mouseleave', (d) => { this.focus.style('display', 'none'); });

		this.xScale = d3.scaleLinear()
			.domain(this.xDomain)
			.range([0, aesthetics.CHART_WIDTH]);

		this.yScale = d3.scaleLinear()
			.domain(this.yDomain)
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
		this.focus = this.container.append('g')
			.attr('class', 'focus')
			.style('display', 'none');

		this.focus.append('line')
			.attr('class', 'hover-line y-hover-line')
			.attr('y1', aesthetics.CHART_HEIGHT);

		this.focus.append('line')
			.attr('class', 'hover-line x-hover-line')
			.attr('x1', 0);

		this.update();
	}

	update = () => {
		const self = this;

		this.line = this.line.data([this.points])
			.attr('class', 'line')
			.attr('fill', 'none')
			.attr('stroke', aesthetics.TURQUOISE)
			.attr('stroke-width', aesthetics.LINE_WIDTH)
			.attr('d', this.generateLine);

		this.point = this.point.data(this.points);

		this.pointEnter = this.point.enter()
			.append('circle')
			.attr('class', 'point')
			.attr('r', aesthetics.POINT_RADIUS)
			.attr('cx', (d) => { return this.xScale(d.age); })
			.attr('cy', (d) => { return this.yScale(d.tenure); });
			// .on('mouseenter', function(d) { self.pointMouseenter(d, this); })
			// .on('mouseleave', function(d) { self.pointMouseleave(d, this); });
	
		this.point.exit().remove();
		this.point = this.pointEnter.merge(this.point);
	}


	svgMousemove = (self) => {
		console.log([d3.mouse(self)[0], d3.mouse(self)[1]]);
		const x0 = this.xScale.invert(d3.mouse(self)[0]),
					y2 = this.yScale.invert(d3.mouse(self)[1]),
					i = d3_utils.bisectAge(this.points, x0, 1);

		if (i >= this.points.length) { return; }
		const d0 = this.points[i - 1],
					d1 = this.points[i],
					d = x0 - d0.age > d1.age - x0 ? d1 : d0;;
					
		this.focus.style('display', null);
		this.focus.select('.hover-line.y-hover-line')
			.attr('y2', this.yScale(d.tenure))
			.attr('x1', this.xScale(d.age))
			.attr('x2', this.xScale(d.age));

		this.focus.select('.hover-line.x-hover-line')
			.attr('y1', this.yScale(d.tenure))
			.attr('y2', this.yScale(d.tenure))
			.attr('x2', this.xScale(d.age));

		// this.fadeNodes(d);
		// this.fadeLinks(d);
	}

	pointMouseenter = (d, self) => {
		const point = d3.select(self);
		this.fadeNodes(d);
		this.fadeLinks(d);
	}

	pointMouseleave = (d, self) => {
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
