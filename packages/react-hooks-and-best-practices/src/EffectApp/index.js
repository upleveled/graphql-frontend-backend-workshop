import React, { useState } from 'react';
import DropIV from './DropIV';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      {/* <Title /> */}
      {/* <Drop /> */}
      {/* <DropII /> */}
      {/* <DropIII /> */}
      <DropIV />

      <p>{count} count</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default App;
