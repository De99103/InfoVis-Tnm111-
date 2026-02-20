import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const path = "./starwars-interactions/starwars-full-interactions-allCharacters.json";
const espodeFile = (ep) => `./starwars-interactions/starwars-episode-${ep}-interactions-allCharacters.json`;
const data = await d3.json(path);
const data2 = await d3.json(espodeFile(2)); 
const width = 1200;
const height = 900;

function hej(svg, data) {

  const linksLayer = svg.append("g").attr("class", "links");
  const nodesLayer = svg.append("g").attr("class", "nodes");

  const links = linksLayer
    .selectAll("line")
    .data(data.links)
    .join("line")
    .attr("stroke", "#888")
    .attr("stroke-opacity", 0.6);

  const nodes = nodesLayer
    .selectAll("circle")
    .data(data.nodes)
    .join("circle")
    .attr("r", d => Math.max(3, Math.sqrt(d.value || 1) * 0.9))
    .attr("fill", d => d.colour || "#4e79a7");

  nodes.append("title").text(d => "Name: " + d.name + ", Interactions:" + d.value);

  const simulation = d3
    .forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.links))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2));

  simulation.on("tick", () => {
       nodes.attr("cx", d => d.x).attr("cy", d => d.y);
  links
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);
    });
}

const svg = d3
.select("#view1")
.attr("width", width)
.attr("height", height)
.attr("viewBox", [0, 0, width, height]);

const svg2 = d3
.select("#view2")
.attr("width", width)
.attr("height", height)
.attr("viewBox", [0, 0, width, height]);

hej(svg, data);
hej(svg2, data2);


console.log(`Loaded ${data.nodes.length} nodes and ${data.links.length} links.`);
console.log(`Loaded ${data2.nodes.length} nodes and ${data2.links.length} links.`);