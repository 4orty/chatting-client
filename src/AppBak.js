import React, { useRef, useState, useEffect } from 'react';

const URL = 'ws://localhost:8080/ws/2';

function reconnectingSocket(url) {
    let client;
    let isConnected = false;
    let reconnectOnClose = true;
    let messageListeners = [];
    let stateChangeListeners = [];

    function on(fn) {
        messageListeners.push(fn);
    }

    function off(fn) {
        messageListeners = messageListeners.filter(l => l !== fn);
    }

    function onStateChange(fn) {
        stateChangeListeners.push(fn);
        return () => {
            stateChangeListeners = stateChangeListeners.filter(l => l !== fn);
        };
    }

    function start() {
        client = new WebSocket(URL);

        client.onopen = () => {
            isConnected = true;
            stateChangeListeners.forEach(fn => fn(true));
        }

        const close = client.close;

        // Close without reconnecting;
        client.close = () => {
            reconnectOnClose = false;
            close.call(client);
        }

        client.onmessage = (event) => {
            console.log("onmessage: ", event.data);
            messageListeners.forEach(fn => fn(event.data));
        }

        client.onerror = (e) => console.error(e);

        client.onclose = () => {

            isConnected = false;
            stateChangeListeners.forEach(fn => fn(false));

            if (!reconnectOnClose) {
                console.log('ws closed by app');
                return;
            }

            console.log('ws closed by server');

            setTimeout(start, 3000);
        }
    }

    start();

    return {
        on,
        off,
        onStateChange,
        close: () => client.close(),
        getClient: () => client,
        isConnected: () => isConnected,
    };
}


const client = reconnectingSocket(URL);


function useMessages() {
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        function handleMessage(message) {
            setMessages([...messages, message]);
        }
        client.on(handleMessage);
        return () => client.off(handleMessage);
    }, [messages, setMessages]);

    return messages;
}



export default function AppBak() {

    const [message, setMessage] = useState('');
    const messages = useMessages();
    const [isConnected, setIsConnected] = useState(client.isConnected());
    const bottomRef = useRef();
    const bottomCallback = (ref) => {
        if (!bottomRef.current) {
            bottomRef.current = ref;
            var element = bottomRef.current;
            console.log("scrollTop: ", element.scrollTop);
            console.log("scrollHeight: ", element.scrollHeight);
            console.log("clientHeight: ", element.clientHeight);


            element.scrollTop =  element.scrollHeight - element.clientHeight;

        } else {
            bottomRef.current = ref;
        }
    }

    useEffect(() => {
        return client.onStateChange(setIsConnected);
    }, [setIsConnected]);

    useEffect(() => {
        if (isConnected) {
            client.getClient().send('hi');
        }
    }, [isConnected]);

    function sendMessage(e) {
        e.preventDefault();
        client.getClient().send(message);
        setMessage('');
    }

    return (
        <div>
            <div id="log" ref={bottomCallback}>
                {
                    messages.map(m => <div> {m} </div>)
                }
            </div>

            <form id="form" onSubmit={sendMessage} size="64" autoFocus>
                <input value={message} onChange={e => setMessage(e.target.value)} />
                <button type="submit">Send</button>
            </form>

        </div>
    );

}