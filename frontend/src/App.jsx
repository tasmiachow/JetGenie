import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/NavBar.jsx";
import LandingPage from "./components/LandingPage.jsx";
import Login from "./components/Login.jsx";

const App = () => {
  return (
    <Router>
      <Navbar /> {/*  Navbar appears on every page */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/plan-trip" element={<PlanTrip />} />
        <Route path="/saved-trips" element={<SavedTrips />} /> */}
      </Routes>
    </Router>
  );
};

export default App;