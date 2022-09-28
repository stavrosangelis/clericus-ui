onmessage = async (e) => {
  if (!e.data.APIPath) return;
  const { data: props } = e;
  const response = await fetch(`${props.APIPath}graph-network`);

  let total = 0;
  const stream = new ReadableStream({
    start(controller) {
      const reader = response.body.getReader();
      reader.read().then(function pushData({ done, value }) {
        if (done) {
          controller.close();
          return;
        }
        total += value.length;
        postMessage([total]);
        controller.enqueue(value);
        reader.read().then(pushData);
      });
    },
  });
  const streamedResponse = new Response(stream, {
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await streamedResponse.text();
  postMessage([total, data]);
};
