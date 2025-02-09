import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuizPage from "./Components/QuizPage.jsx";
import Navbar from "./components/NavBar.jsx";
import LandingPage from "./components/LandingPage.jsx";
import ItineraryBuilder from "./components/ItineraryBuilder.jsx";
import Login from "./components/Login.jsx";
import HotelMap from "./components/HotelMap/HotelMap.jsx";
import HotelForm from "./components/HotelMap/HotelForm/HotelForm.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Navbar /> {/* Navbar appears on every page */}
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route
                        path="/itinerary-builder"
                        element={<ItineraryBuilder />}
                    />
                     <Route path="/hotels" element={<HotelForm />} />
                     <Route path="/hotels/search" element={<HotelMap />} />
                </Routes>
            </Router>
        </QueryClientProvider>
    );
};

export default App;
