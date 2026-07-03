export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        socket.on("joinUser", ({userId}) => {
            socket.join(`user:${userId}`)
        })

        // join specific doctor queue
        socket.on("joinQueue", ({ doctorId, date }) => {
            const room = `queue:${doctorId}:${date}`;
            socket.join(room);
        });

        socket.on("leaveQueue", ({ doctorId, date }) => {
            const room = `queue:${doctorId}:${date}`;
            socket.leave(room)
        })
    })
}