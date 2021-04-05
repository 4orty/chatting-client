import React, { useState } from 'react';

function Hook() {
    var initialArray = [];
    const [count, setCount] = useState(initialArray);

    return (
        <div>
            <p>You clicked {count} times </p>
            <button onClick={() => setCount([...count, "test"])}>
                Click me
            </button>
        </div>
    )
}

export default Hook;