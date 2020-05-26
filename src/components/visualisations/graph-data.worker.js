onmessage = async(e)=>{
  if (!e.data.APIPath) return;
  let props = e.data;
  let response = await fetch(`${props.APIPath}graph-network`);
  let text = "";
  const stream = new ReadableStream({
    start(controller) {
      const reader = response.body.getReader();

      function pushData() {
        reader.read().then(({ done, value })=> {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          pushData();
        });
      }
      pushData();
    }
  });
  const streamedResponse = new Response(stream, { headers: { "Content-Type": "application/json" } });

  const data = await streamedResponse.text();
  const parsedData = JSON.parse(data);
  postMessage({ data: JSON.parse(parsedData.data), finished: true });
};
