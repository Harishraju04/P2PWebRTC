"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
let senderSocket = null;
let receiverSocket = null;
const wss = new ws_1.WebSocketServer({ port: 8080 });
wss.on("connection", function connection(socket) {
    socket.on("error", console.error);
    socket.on("message", function message(data) {
        const message = JSON.parse(data.toString());
        if (message.type === "sender") {
            console.log("sender set");
            senderSocket = socket;
        }
        else if (message.type === "receiver") {
            console.log("receiver set");
            receiverSocket = socket;
        }
        else if (message.type === "createOffer") {
            console.log("offer received");
            if (socket !== senderSocket)
                return;
            receiverSocket?.send(JSON.stringify({ type: "createOffer", sdp: message.sdp }));
        }
        else if (message.type === "createAnswer") {
            console.log("answer sent");
            if (socket !== receiverSocket)
                return;
            senderSocket?.send(JSON.stringify({ type: "createAnswer", sdp: message.sdp }));
        }
        else if (message.type === "iceCandidate") {
            if (socket === senderSocket) {
                receiverSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
            }
            else if (socket === receiverSocket) {
                senderSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
            }
        }
    });
});
//# sourceMappingURL=index.js.map