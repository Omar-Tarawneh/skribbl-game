const options = {
  transports: ['websocket'],
};
const socket = io('localhost:3030/', options);
const formEl = document.getElementById('questions-form');

formEl.addEventListener('submit', handleSubmit);

socket.on('connect', () => {
  //1 if the client connect!!
  console.log('Connected!!');
  socket.on('hello', (payload) => {
    console.log('hello', payload.class);
  });
});

function handleSubmit(e) {
  e.preventDefault();
  const payload = {
    question: e.target.question.value,
  };
  socket.emit('createTicket', payload);
}

// const gameLink = document.getElementById('gameLink');
//   gameLink.setAttribute("href", socket.id);

  // const link =socket.id;
  // console.log(link);
