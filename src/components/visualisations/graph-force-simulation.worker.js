import * as d3 from "d3";
import * as d32 from "d3-force-reuse";

onmessage = async(e)=>{
  if (!e.data.nodes) return;
  let props = e.data;
  let nodes = props.nodes;
  let links = props.links;
  nodes[0].x = props.centerX;
  nodes[0].y = props.centerY;
  let strength = -500;
  const simulation = d3.forceSimulation(nodes)
    .force("link",
    d3.forceLink(links)
        .id(d => d.id)
        .strength(d=>1)
        .distance(d=>200)
      )
    .force("charge", d32.forceManyBodyReuse().strength(strength))
    .force("center", d3.forceCenter(e.data.centerX, e.data.centerY))
    .force('collide', d3.forceCollide(60))
    .alphaDecay(0.06)
    .stop();

  let max = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
  for (let i = 0; i < max; i++) {
    simulation.tick();
  }
  delete nodes['update']
  simulation.stop();
  const data = JSON.stringify({nodes: nodes, links:links});
  postMessage({ data: data, finished: true });
};
