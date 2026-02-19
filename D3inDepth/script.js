// For bundlers such as Vite and Webpack omit https://esm.sh/

import { range } from 'https://esm.sh/d3-array';
import { forceSimulation, forceManyBody, forceX, forceY, forceCollide } from 'https://esm.sh/d3-force';
import { select } from 'https://esm.sh/d3-selection';
import { scaleLinear } from 'https://esm.sh/d3-scale';

console.log('D3 modules loaded');

let colorScale = ['orange', 'lightblue', '#B19CD9'];
let xScale = scaleLinear().domain([0, 1]).range([0, 600]);

let numNodes = 50;



let nodes = range(numNodes).map(function(d, i) {
	return {
		radius: Math.random() * 20,
		value:Math.random()	}
});
let simulation = forceSimulation(nodes)
	.force('charge', forceManyBody().strength(5)) // strength of the charge force, positive for repulsion
	.force('x', forceX().x(function(d) {
		return xScale(d.value);

	}))
    .force('y', forceY().y(function(d) {
            return 0;
        }))	
    .force('collision', forceCollide().radius(function(d) {
		return d.radius;
	}))
	.on('tick', ticked);

function ticked() {
	let u = select('svg g')
		.selectAll('circle')
		.data(nodes)
		.join('circle')
		.attr('r', function(d) {
			return d.radius;
		})
		.style('fill', function(d) {
			return colorScale[d.category];
		})
		.attr('cx', function(d) {
			return d.x;
		})
		.attr('cy', function(d) {
			return d.y;
		});
}
