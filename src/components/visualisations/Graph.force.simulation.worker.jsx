import * as d3 from 'd3';

onmessage = async (e) => {
  if (!e.data.nodes) return;
  const props = e.data;
  const { nodes } = props;
  const { links } = props;
  nodes[0].x = props.centerX;
  nodes[0].y = props.centerY;
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .strength(() => 1)
        .distance(() => 300)
    )
    // .force("charge", d32.forceManyBodyReuse().strength(strength))
    .force('center', d3.forceCenter(e.data.centerX, e.data.centerY))
    .force('collide', d3.forceCollide(80))
    .alphaDecay(0.8)
    .stop();

  const max = Math.ceil(
    Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
  );
  for (let i = 0; i < max; i += 1) {
    simulation.tick();
  }
  delete nodes.update;
  simulation.stop();
  const data = JSON.stringify({ nodes, links });
  postMessage({ data, finished: true });
};
