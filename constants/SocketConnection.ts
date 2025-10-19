export const waitForSocketConnection = (socket: WebSocket, timeout = 5000) => {
  return new Promise<void>((resolve, reject) => {
    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        clearInterval(interval);
        resolve();
      }
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      reject(new Error("Socket connection timed out"));
    }, timeout);
  });
};