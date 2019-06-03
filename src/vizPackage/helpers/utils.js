import * as d3 from 'd3';

export const bisectTenure = d3.bisector(function(d) { return d.tenure; }).left;
export const bisectAge = d3.bisector(function(d) { return d.age; }).left;

export const get_data_near_point = (data, x0, axis) => {
	return data.map((dataset) => {
		const line = dataset.data,
					i = bisectAge(line, x0, 1);
		if (i >= line.length) { return; }

		const d0 = line[i - 1],
					d1 = line[i],
					d = x0 - d0[axis] > d1[axis] - x0 ? d1 : d0;

		return d;			
	});
};

export const get_axis_min_max = (data, axis) => {
	return [
			data.reduce((min, p) => p[axis] < min ? p[axis] : min, data[0][axis]), 
			data.reduce((max, p) => p[axis] > max ? p[axis] : max, data[0][axis])
		];
}