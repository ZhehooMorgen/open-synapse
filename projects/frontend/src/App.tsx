import { useState } from "react"

export default function App() {
  const [counter, setCounter] = useState(0)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="font-medium">Hello World</div>
      <div className="font-medium">Count = {counter}</div>
      <button
        className="px-4 py-2 ml-4 text-white bg-blue-500 rounded hover:bg-blue-600"
        onClick={() => setCounter(counter + 1)}
      >
        Increment
      </button>
    </div>
  )
}
