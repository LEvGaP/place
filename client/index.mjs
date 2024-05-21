import timeout from "./timeout.mjs";
import drawer from "./drawer.mjs";
import picker from "./picker.mjs";

document.querySelector("#start").addEventListener("submit", e => {
  e.preventDefault();
  main(new FormData(e.currentTarget).get("apiKey"));
  document.querySelector(".container").classList.add("ready");
});

const main = apiKey => {
  const ws = connect(apiKey);
  ws.addEventListener("message", console.log);
  ws.addEventListener("message", (me) => {
    const data = JSON.parse(me.data);
    if (data.type === "field state update"){
      const field = data.payload.field;
      drawer.putArray(field);
    }
    if (data.type === "pixel-changed"){
      drawer.put(data.payload.x, data.payload.y, data.payload.color);
    }
  });

  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    drawer.put(x, y, picker.color);
    ws.send(JSON.stringify(
      {
        type: "pixel-changed",
        payload: {
          x: x,
          y: y,
          color: picker.color
        }
      }
    ));
  };
};

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};
