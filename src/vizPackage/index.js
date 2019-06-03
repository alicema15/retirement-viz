import * as d3 from 'd3';

import * as aesthetics from './constants/aesthetics';
import * as d3_utils from './helpers/d3_utils';
import './style.css';

import disney_data from './data/process_disney';
const data = disney_data;

// import test_data from './data/test.json';
// const data = test_data

const X_AXIS = 'age';
const Y_AXIS = 'salary';

class VizPackage {
	constructor() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.data = [];
	}

	initializeCanvas = (vizRef) => {
		const self = this; 

		d3.select('body')
      .on('keydown', this.keydown);

		this.data_original = data;
		this.data = this.data_original;
		this.first_line = this.data[0].data;
		this.xDomain = [
			this.first_line.reduce((min, p) => p[X_AXIS] < min ? p[X_AXIS] : min, this.first_line[0][X_AXIS]), 
			this.first_line.reduce((max, p) => p[X_AXIS] > max ? p[X_AXIS] : max, this.first_line[0][X_AXIS])
		];
		this.yDomain = [
			this.first_line.reduce((min, p) => p[Y_AXIS] < min ? p[Y_AXIS] : min, 
			this.first_line[0][Y_AXIS]), this.first_line.reduce((max, p) => p[Y_AXIS] > max ? p[Y_AXIS] : max, this.first_line[0][Y_AXIS])
		];

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

		this.dataGroup = this.container.selectAll('.data-group');

		this.area = this.container.append('path')
			.attr('class', 'line-area')
			.attr('pointer-events', 'none');

		this.line = this.dataGroup.selectAll('.line');
		this.point = this.dataGroup.append('g').selectAll('.point');

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
  //      .data([this.data])
  //      .attr('class', 'area')
  //      .attr('fill', aesthetics.TURQUOISE)
  //      .attr('fill-opacity', 0.2)
  //      .attr('d', this.generateArea);

    console.log(this.data);

    this.dataGroup = this.dataGroup.data(this.data);
    this.dataGroupEnter = this.dataGroup.enter()
    	.append('g')
			.attr('class', 'data-group')
			.attr('fill', function(d) { return d.color; });

		this.line = this.dataGroupEnter.selectAll('.line');

		this.line = this.dataGroupEnter
			.append('path')
			.attr('class', 'line')
			.attr('fill', 'none')
			.attr('pointer-events', 'none')
			.attr('stroke', function(d) { return d.color; })
			.attr('stroke-width', aesthetics.LINE_WIDTH)
			.attr('d', (d) => { return this.generateLine(d.data); });

		this.pointGroup = this.dataGroupEnter.append('g').attr('class', 'point-group');

		this.point = this.pointGroup.selectAll('.point').data((d) => { return d.data; });

		this.pointEnter = this.point
			.enter()
			.append('circle')
			.attr('class', 'point')
			.attr('r', aesthetics.POINT_RADIUS)
			.attr('cx', (d) => { return this.xScale(d[X_AXIS]); })
			.attr('cy', (d) => { return this.yScale(d[Y_AXIS]); })
			.on('mouseenter', function(d) { self.pointMouseenter(d, this); })
			.on('mouseleave', function(d) { self.pointMouseleave(d, this); });

		this.point = this.point.exit().remove();
		this.point = this.pointEnter.merge(this.point);

		this.dataGroup.exit().remove();
		this.dataGroup = this.dataGroupEnter.merge(this.dataGroup);

	}

	svgMousemove = (self) => {
		const x0 = this.xScale.invert(d3.mouse(self)[0]),
					y2 = this.yScale.invert(d3.mouse(self)[1]);

		const enlarged_points = this.data.map((dataset) => {
			const line = dataset.data,
						i = d3_utils.bisectAge(line, x0, 1);
			if (i >= line.length) { return; }

			const d0 = line[i - 1],
						d1 = line[i],
						d = x0 - d0[X_AXIS] > d1[X_AXIS] - x0 ? d1 : d0;

			return d;			
		});

		const d = enlarged_points[0];

		this.focus.style('display', null);
		this.focus.select('.hover-line.y-hover-line')
			.attr('y2', this.yScale(d[Y_AXIS]))
			.attr('x1', this.xScale(d[X_AXIS]))
			.attr('x2', this.xScale(d[X_AXIS]));

		this.focus.select('.hover-line.x-hover-line')
			.attr('y1', this.yScale(d[Y_AXIS]))
			.attr('y2', this.yScale(d[Y_AXIS]))
			.attr('x2', this.xScale(d[X_AXIS]));

		this.point.filter((n) => { return enlarged_points.includes(n); })
			.attr('r', 7);
		this.point.filter((n) => { return !enlarged_points.includes(n); })
			.attr('r', aesthetics.POINT_RADIUS);
	}

	pointMouseenter = (d, self) => {
		this.fadeData(d);
	}

	pointMouseleave = (d, self) => {
		this.pointGroup.classed('faded', false);
		this.line.classed('faded', false);
	}

	fadeData = (d) => {
		this.pointGroup.classed('faded', (n) => { return !n.data.includes(d); });
  	this.line.classed('faded', (l) => { return !l.data.includes(d); });
	}

	removeFade = () => {
		this.pointGroup.classed('faded', false);
		this.line.classed('faded', false);
	}

	cycleData = () => {
		const max_lines = this.data_original.length,
					num_lines = Math.floor(Math.random() * max_lines) + 1,
					which_lines = this.data_original.slice(0, num_lines).map(function () { 
				        return this.splice(Math.floor(Math.random() * this.length), 1)[0];
				    }, this.data_original.slice());
		
		console.log(which_lines)
		this.data = which_lines;
		this.update();
	}

	keydown = () => {
    if (d3.event.target.tagName === 'INPUT') return;
    console.log('keycode: ', d3.event.keyCode);
    switch(d3.event.keyCode) {
    	case 84: // T
    		this.cycleData();
    		break;
    	default:
    		return;
    }
	}

}

export default VizPackage;
