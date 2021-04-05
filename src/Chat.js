import React, {useState, useEffect} from 'react';

import './Chat.css';
import Logs from './Logs.js'

function Chat() {

    let isConnected = false;
    const [text, setText] = useState('');
    const [logc, setLog] = useState([]);
    let conn;

    if (window["WebSocket"]) {
        const params = window.location.href.split("/");
        const roomId = params[params.length - 1];
        conn = new WebSocket("ws://localhost:8080/ws/" + roomId);
        conn.onClose = function (evt) {
            console.log("onClose");
            let item = document.createElement("div");
            item.innerHTML = "<b> Connection closed. </b>";
        };

        conn.onmessage = function (evt) {
            console.log("onmessage");
            let messages = evt.data.split('\n');
            for (let i = 0; i < messages.length; i++) {
                setLog([...logc, messages[i]]);
            }
            setText('');
        }

        conn.onopen = function() {
            console.log("onopen");
            isConnected = true;
        }

    } else {
        let item = document.createElement("div");
        item.innerHTML = "<b> Your browser does not support WebSockets. </b>";
    }

    const onChange = (e) => {
        setText(e.target.value);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!conn) {
            console.log("!conn");
            return false;
        }
        if (text==='') {
            return false;
        }
        if(isConnected) {
            console.log("Connected");
            conn.send(text);
        } else {
            console.log("Not Connected");
        }
        setText('');
    }

    useEffect(() => {
        console.log("useEffect text: ", text);
    }, [text]);

    useEffect(() => {
    }, [logc]);


    return (
        <div>
            <div id="log">
                {
                    logc.map((log, index) => {
                        return <Logs text={log} key={index}/>
                    })
                }
            </div>
            <input value={text} onChange={onChange} size="64" autoFocus/>
            <button onClick={onSubmit}>submit</button>
        </div>
    );
}

export default Chat;
