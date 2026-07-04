import * as socketService from "../services/socket.service.js";


function initSockets(io) {
  socketService.init(io);

  io.on("connection", (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });
}

export default initSockets;
