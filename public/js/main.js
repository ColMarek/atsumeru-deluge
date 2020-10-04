/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// const body = {
//   method: "web.get_torrent_files",
//   params: ["2edfdeb70efc5aa071c9c535cb7e813744458462"],
//   id: 1
// };
// const body = { id: 1, method: "auth.login", params: ["deluge"] };
const body = { id: 1, method: "web.connected", params: [] };

// fetch({ method: "POST", url: "http://192.168.0.25:8112/json", body })
// fetch("http://192.168.0.25:8112/json", {
//   method: "POST",
//   mode: "no-cors",
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json"
//   },
//   body: JSON.stringify(body)
// })
//   .then(response => response.json())
//   .then(json => {
//     console.log(json);
//   })
//   .catch(e => console.log(e));

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
