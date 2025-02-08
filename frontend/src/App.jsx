import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("http://127.0.0.1:5000/") // Flask backend URL
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
      <div className="App">
      <h1>Vacation Planner</h1>
      <p>Backend Response: {message}</p>
    </div>
  );
}

export default App
