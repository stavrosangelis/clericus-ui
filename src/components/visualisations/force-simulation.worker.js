import * as d3 from 'd3';
import * as d32 from 'd3-force-reuse';

onmessage = async (e) => {
  if (!e.data.nodes) return;
  const props = e.data;
  const { nodes } = props;
  const { links } = props;
  nodes[0].x = props.centerX;
  nodes[0].y = props.centerY;
  const strength = -500;
  // let start = new Date();

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .strength(() => 1)
        .distance(() => 100)
    )
    .force('charge', d32.forceManyBodyReuse().strength(strength))
    .force('center', d3.forceCenter(e.data.centerX, e.data.centerY))
    .force('collide', d3.forceCollide(80))
    // .alphaDecay(0.2)
    .stop();

  let max =
    Math.ceil(
      Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
    ) / 2;
  if (max > 80) max = 80;
  for (let i = 0; i < max; i += 1) {
    simulation.tick();
  }
  delete nodes.update;
  simulation.stop();

  // let complete = new Date();

  // let timePassed = complete.getTime()-start.getTime();
  // console.log(`completed after ${timePassed}`);
  postMessage({ data: { nodes, links }, finished: true });
};
