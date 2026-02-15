import { useState } from "react";
import { Button } from "./shadcn/ui/button";

export default function App() {
  const [counter, setCounter] = useState(0);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="font-medium">Hello World</div>
      <div className="font-medium">Count = {counter}</div>
      <Button onClick={() => setCounter(counter + 1)}>Increment</Button>
    </div>
  );
}
