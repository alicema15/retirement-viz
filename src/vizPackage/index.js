import * as d3 from 'd3';

import * as aesthetics from './constants/aesthetics';
import * as d3_utils from './helpers/d3_utils';
import './style.css';

import disney_data from './data/process_disney';
const data = disney_data.all;
const data_all = Object.keys(disney_data).map((key) => { return disney_data[key]; });
// import test_data from './data/test.json';
// const data = test_data

const X_AXIS = 'age';
const Y_AXIS = 'salary';

class VizPackage {
	constructor() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.points = [];
	}

	initializeCanvas = (vizRef) => {
		const self = this; 

		this.points = data_all;
		this.xDomain = [data.reduce((min, p) => p[X_AXIS] < min ? p[X_AXIS] : min, data[0][X_AXIS]), data.reduce((max, p) => p[X_AXIS] > max ? p[X_AXIS] : max, data[0][X_AXIS])];
		this.yDomain = [data.reduce((min, p) => p[Y_AXIS] < min ? p[Y_AXIS] : min, data[0][Y_AXIS]), data.reduce((max, p) => p[Y_AXIS] > max ? p[Y_AXIS] : max, data[0][Y_AXIS])];

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
			.x((d) => { return this.xScale(d[X_AXIS]); })
			.y((d) => { return this.yScale(d[Y_AXIS]); })
			.curve(d3.curveMonotoneX);

		this.generateArea = d3.area()
			.x((d) => { return this.xScale(d[X_AXIS]); })
			.y0(aesthetics.CHART_HEIGHT)
			.y1((d) => { return this.yScale(d[Y_AXIS]); })
			.curve(d3.curveMonotoneX);

		this.xAxis = this.container.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + aesthetics.CHART_HEIGHT + ')')
			.call(d3.axisBottom(this.xScale));

		this.yAxis = this.container.append('g')
			.attr('class', 'y axis')
			.call(d3.axisLeft(this.yScale));

		this.area = this.container.append('path')
			.attr('class', 'line-area')
			.attr('pointer-events', 'none');

		this.line = this.container.append('g')
			.attr('class', 'line-container')
			.attr('pointer-events', 'none')
			.selectAll('.line');

		this.pointGroup = this.container.append('g')
			.attr('class', 'point-container')
			// .attr('pointer-events', 'none')
			.selectAll('.point-group');

		this.point = this.pointGroup.selectAll('.point');

		this.focus = this.container.append('g')
			.attr('class', 'focus')
			.style('display', 'none')
			.attr('pointer-events', 'none');

		this.focus.append('line')
			.attr('class', 'hover-line y-hover-line')
			.attr('y1', aesthetics.CHART_HEIGHT);

		this.focus.append('line')
			.attr('class', 'hover-line x-hover-line')
			.attr('x1', 0);

		this.minimapContainer = this.svg.append('g')
			.attr('class', 'mini-map-container')
			.attr('transform', 'translate(' 
				+ (aesthetics.MARGIN_LEFT) + ',' 
				+ (2 * aesthetics.MARGIN_TOP + aesthetics.CHART_HEIGHT) + ')'
				);

		this.update();
	}

	update = () => {
		const self = this;

		// this.area = this.container.select('.line-area')
  //      .data([this.points])
  //      .attr('class', 'area')
  //      .attr('fill', aesthetics.TURQUOISE)
  //      .attr('fill-opacity', 0.2)
  //      .attr('d', this.generateArea);

     console.log(data_all);
		this.line = this.line.data(data_all)
			.enter()
			.append('path')
			.attr('class', 'line')
			.attr('fill', 'none')
			.attr('stroke', function(d, i) { return aesthetics.get_color(i); })
			.attr('stroke-width', aesthetics.LINE_WIDTH)
			.attr('d', this.generateLine);

		this.pointGroup = this.pointGroup.data(this.points);

		this.pointGroupEnter = this.pointGroup.enter()
			.append('g')
			.attr('class', 'point-group ')
			.attr('fill', function(d, i) { return aesthetics.get_color(i); });

		this.pointGroup.exit().remove();
		this.pointGroup = this.pointGroupEnter.merge(this.pointGroup);

		this.point = this.pointGroup.selectAll('.point')
			.data(function(d) { return d; });

		this.pointEnter = this.point.enter()
			.append('circle')
			.attr('class', 'point')
			.attr('r', aesthetics.POINT_RADIUS)
			.attr('cx', (d) => { return this.xScale(d[X_AXIS]); })
			.attr('cy', (d) => { return this.yScale(d[Y_AXIS]); })
			.on('mouseenter', function(d) { self.pointMouseenter(d, this); })
			.on('mouseleave', function(d) { self.pointMouseleave(d, this); });

		this.point.exit().remove();
		this.point = this.pointEnter.merge(this.point);
	}

	svgMousemove = (self) => {
		const first_line = this.points[0],
					x0 = this.xScale.invert(d3.mouse(self)[0]),
					y2 = this.yScale.invert(d3.mouse(self)[1]),
					i = d3_utils.bisectAge(first_line, x0, 1);

		if (i >= first_line.length) { return; }
		const d0 = first_line[i - 1],
					d1 = first_line[i],
					d = x0 - d0.age > d1.age - x0 ? d1 : d0;
					
		this.focus.style('display', null);
		this.focus.select('.hover-line.y-hover-line')
			.attr('y2', this.yScale(d[Y_AXIS]))
			.attr('x1', this.xScale(d[X_AXIS]))
			.attr('x2', this.xScale(d[X_AXIS]));

		this.focus.select('.hover-line.x-hover-line')
			.attr('y1', this.yScale(d[Y_AXIS]))
			.attr('y2', this.yScale(d[Y_AXIS]))
			.attr('x2', this.xScale(d[X_AXIS]));

		this.point.filter((n) => { return n === d; })
			.attr('r', 7)
		this.point.filter((n) => { return n !== d; })
			.attr('r', aesthetics.POINT_RADIUS);

		// this.fadeNodes(d);
		// this.fadeLinks(d);
	}

	pointMouseenter = (d, self) => {
		const point = d3.select(self);
		this.fadeNodes(d);
		this.fadeLinks(d);
	}

	pointMouseleave = (d, self) => {
		this.pointGroup.classed('faded', false);
		this.line.classed('faded', false);
	}

	fadeNodes = (d) => {
		this.pointGroup.classed('faded', (n) => { return !n.includes(d); });
	}

	fadeLinks = (d) => {
  	this.line.classed('faded', (l) => { return !l.includes(d); });
	}

	removeFade = () => {
		this.pointGroup.classed('faded', false);
		this.line.classed('faded', false);
	}

}

export default VizPackage;
