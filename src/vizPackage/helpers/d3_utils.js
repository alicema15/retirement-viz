import * as d3 from 'd3';

export const bisectTenure = d3.bisector(function(d) { return d.tenure; }).left;
export const bisectAge = d3.bisector(function(d) { return d.age; }).left;