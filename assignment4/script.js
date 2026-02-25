import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// misc
const path = "./starwars-interactions/starwars-full-interactions-allCharacters.json";
const espodeFile = (ep) => `./starwars-interactions/starwars-episode-${ep}-interactions-allCharacters.json`;
const data = await d3.json(path);
const data2 = await d3.json(espodeFile(2));
const width = 1200;
const height = 600;

// Range slider + updates
const slider = document.getElementById("rnge");
console.log(slider.value)

const MaxEdgeFull = d3.max(data.links, d => d.value);
const MaxEdgeEp = d3.max(data2.links, d => d.value); // ksk fixa sortering node value ist?
const maxEdge = Math.max(MaxEdgeFull, MaxEdgeEp);

slider.min = 1;
slider.max = maxEdge;
const curSpan = document.getElementById("curVal");

function updateSliderLabels() {
  curSpan.textContent = slider.value;
}
updateSliderLabels();

// dropdown
const charSelect = document.getElementById("charSelect");
const names = Array.from(new Set(data.nodes.map(d => d.name))).filter(Boolean).sort(d3.ascending);

charSelect.innerHTML = `<option value="">(none)</option>` + names.map(n => `<option value="${n}">${n}</option>`).join("");

function highligtByname(view, name) {
  if (!name) { view.nodes.classed("selected", false); return; }
  view.nodes.classed("selected", d => d.name === name);
}

charSelect.addEventListener("change", () => {
  const name = charSelect.value;
  highligtByname(view1, name);
  highligtByname(view2, name);
});

slider.addEventListener("input", updateSliderLabels);

// Loop for drawing data
function hej(svg, data) {
  const g = svg.append("g").attr("class", "graph");

  const linksLayer = g.append("g").attr("class", "links");
  const nodesLayer = g.append("g").attr("class", "nodes");

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
    .attr("r", d => Math.sqrt(d.value * 2))
    .attr("fill", d => d.colour || "#4e79a7");

  // Notes on hover
  nodes.append("title").text(d => "Name: " + d.name + ", Interactions:" + d.value);
  links.append("title").text(d => data.nodes[d.source].name + " and " + data.nodes[d.target].name + " appear together " + d.value + " times");

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

  return { nodes, links };
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

const view1 = hej(svg, data);
const view2 = hej(svg2, data2);

function updateBySlider() {
  const t = +slider.value;
  curSpan.textContent = t;

  // view 1
  view1.nodes.classed("dimmed", d => d.value < t);
  view1.links.classed("dimmed", d => d.source.value < t || d.target.value < t);

  // view 2
  view2.nodes.classed("dimmed", d => d.value < t);
  view2.links.classed("dimmed", d => d.source.value < t || d.target.value < t);
}

slider.addEventListener("input", updateBySlider);
updateBySlider();


// Brushing 
let selectedName = null;
function applySelection() {
  view1.nodes
    .classed("selected", d => selectedName !== null && d.name === selectedName)
    .classed("dimmed", d => selectedName !== null && d.name !== selectedName);

  view2.nodes
    .classed("selected", d => selectedName !== null && d.name === selectedName)
    .classed("dimmed", d => selectedName !== null && d.name !== selectedName);

  // links too need to check if selected node matches links
  view1.links
    .classed("selectedL", d =>
      selectedName !== null &&
      (d.source.name === selectedName || d.target.name === selectedName)
    )
    .classed("dimmed", d =>
      selectedName !== null &&
      !(d.source.name === selectedName || d.target.name === selectedName)
    );

  view2.links
    .classed("selectedL", d =>
      selectedName !== null &&
      (d.source.name === selectedName || d.target.name === selectedName)
    )
    .classed("dimmed", d =>
      selectedName !== null &&
      !(d.source.name === selectedName || d.target.name === selectedName)
    );
}

function onNodeClick(event, d) {
  // toggle selection
  selectedName = (selectedName === d.name) ? null : d.name;
  applySelection();
}

// attach click handlers to both
view1.nodes.on("click", onNodeClick);
view2.nodes.on("click", onNodeClick);

// fixa så man kan välja episode i right view!!
// fixa kontrollerna till en panel form 
