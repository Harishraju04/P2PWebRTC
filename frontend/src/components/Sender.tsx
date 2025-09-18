import { useEffect, useState } from "react";

export default function Sender(){
    const [socket,setSocket] = useState<WebSocket|null>(null);

    useEffect(()=>{
        const ws = new WebSocket("ws://localhost:8080");
        ws.onopen = ()=>{
            console.log("Sender: Websocket connected");
            ws.send(JSON.stringify({type:"sender"}));
        }
        setSocket(ws);

        return ()=>{
            ws.close();
        };
    },[]);

   
     async function sendVideo(){
        console.log("Sender : staring video");

        if(!socket){
            console.log("no socket available");
            return ;
        }

        const pc = new RTCPeerConnection();

        socket.onmessage = (event)=>{
            const message = JSON.parse(event.data);
            
            if(message.type === 'createAnswer'){
                pc.setRemoteDescription(message.sdp);
            }
            else if(message.type === 'iceCandidate'){
                pc.addIceCandidate(message.candidate);
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
        pc.addTrack(stream.getVideoTracks()[0],stream);

        pc.onicecandidate = (event) =>{
            console.log("Sender Ice candidate generated",event.candidate);

            if(event.candidate){
                socket.send(JSON.stringify({
                    type:"iceCandidate",
                    candidate:event.candidate
                }))
            }
        }


        pc.onnegotiationneeded = async()=>{
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.send(JSON.stringify({
                type:"createOffer",
                sdp:pc.localDescription
            }))
        }
     }


    return (
        <div>
            sender
            <button onClick={()=>{
                sendVideo();
            }}>send</button>
        </div>
    )
}