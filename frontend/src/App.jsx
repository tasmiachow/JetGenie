import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuizPage from "./Components/QuizPage.jsx";

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
      <Router>
        <Routes>
          <Route path="/" element={<QuizPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App
