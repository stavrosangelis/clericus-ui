onmessage = async (e) => {
  if (!e.data._id) return;
  const { data } = e;
  const { APIPath, _id, step } = data;
  const response = await fetch(
    `${APIPath}item-network?_id=${_id}&step=${step}`
  );
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

  const output = await streamedResponse.text();
  postMessage(output);
};
