const options = {
  transports: ['websocket'],
};
const socket = io('localhost:3030/', options);


socket.on('connect', () => {
  console.log('Admin connected');
  // emitting to the server
  socket.emit('join', { room: 'lopy'});
  // listing to the newTicket event that was generated from the server
  socket.emit('getall');
  socket.on('newTicket', (payload) => {
    //3a
    render(payload);
  });

  socket.on('offlineStaff', (payload) => {
    const el = document.getElementById(payload.id);
    el.remove();
  });
});


function render(payload) {
  const container = document.getElementById('tickets');
  const articleEl = document.createElement('article');
  container.prepend(articleEl);
  articleEl.classList.add('ticket');
  const h2El = document.createElement('h2');
  articleEl.appendChild(h2El);
  h2El.textContent = `${payload.question}`;
  const p1El = document.createElement('p');
  articleEl.append(p1El);
}

module.exports = socket.id;


