onmessage = async (e) => {
  if (!e.data.APIPath) return;
  const props = e.data;
  const response = await fetch(`${props.APIPath}graph-network`);
  const stream = new ReadableStream({
    start(controller) {
      const reader = response.body.getReader();

      function pushData() {
        reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          pushData();
        });
      }
      pushData();
    },
  });
  const streamedResponse = new Response(stream, {
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await streamedResponse.text();
  postMessage({ data, finished: true });
};
