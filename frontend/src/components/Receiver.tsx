import { useEffect, useRef } from "react";

export default function Receiver(){
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");
        const pc = new RTCPeerConnection();

        socket.onopen = ()=>{
            socket.send(JSON.stringify({type:"receiver"}));
        }


        pc.ontrack = async (event) =>{
            if(videoRef.current && event.streams[0]){
                videoRef.current.srcObject = event.streams[0];


                try{
                    await videoRef.current.play();
                }
                catch(err){
                    console.log(err);
                }
            }
        }

        pc.onicecandidate = (event)=>{
            if(event.candidate){
                socket.send(JSON.stringify({type:"iceCandidate",candidate:event.candidate}));
            }
        }
        socket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        console.log("Received message:", msg.type);
        
        try {
            if (msg.type === "createOffer") {
            await pc.setRemoteDescription(msg.sdp);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.send(JSON.stringify({ type: "createAnswer", sdp: answer }));
            console.log("Answer sent");
            } else if (msg.type === "iceCandidate") {
            await pc.addIceCandidate(msg.candidate);
            console.log("ICE candidate added");
            }
        } catch (error) {
            console.error("Error handling message:", error);
        }
        };

        socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        };

    return () => {
      console.log("Cleaning up receiver");
      socket.close();
      pc.close();
    };
    },[]);

    return <div>
        Reciever
        <video ref={videoRef} autoPlay playsInline muted />
    </div>
}