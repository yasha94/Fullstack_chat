const sendMessage = (socket, data, onAck) => {
    socket.emit('sendMessage', data, (err, savedMessage) => {
        if (typeof onAck === 'function') {
            onAck(err, savedMessage);
        }
    });
};

export { sendMessage };
