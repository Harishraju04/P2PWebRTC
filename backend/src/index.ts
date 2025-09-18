import { WebSocketServer } from "ws";
import WebSocket from "ws";

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(socket) {
    socket.on("error", console.error);

    socket.on("message", function message(data) {
        const message = JSON.parse(data.toString());

        if (message.type === "sender") {
            console.log("sender set");
            senderSocket = socket;
        } else if (message.type === "receiver") {
            console.log("receiver set");
            receiverSocket = socket;
        } else if (message.type === "createOffer") {
            console.log("offer received");
            if (socket !== senderSocket) return;

            receiverSocket?.send(
                JSON.stringify({ type: "createOffer", sdp: message.sdp })
            );
        } else if (message.type === "createAnswer") {
            console.log("answer sent");
            if (socket !== receiverSocket) return;

            senderSocket?.send(
                JSON.stringify({ type: "createAnswer", sdp: message.sdp })
            );
        } else if (message.type === "iceCandidate") {
            if (socket === senderSocket) {
                receiverSocket?.send(
                    JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
                );
            } else if (socket === receiverSocket) {
                senderSocket?.send(
                    JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
                );
            }
        }
    });
});
