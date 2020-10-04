/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const body = { id: 1, method: "web.connected", params: [] };

function download(link) {
  fetch("/api/torrent", {
    method: "POST",
    body: JSON.stringify({ link })
  })
    .then(res => res.json())
    .then(() => {
      alertify.success("Torrent added");
    })
    .catch(e => {
      console.error(e);
      alertify.error(e);
    });
}
