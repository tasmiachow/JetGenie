import { Link } from "react-router-dom";
import "../styles/LandingPage.css";
import travelImg from "../assets/JetGenieLogo.png"; 

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Left Section - Text & Buttons */}
      <div className="landing-left">
        <h1>Plan Your Next Adventure</h1>
        <p>Organize your next trip from start to finish.</p>
        <div className="button-container">
          <Link to="/quiz" className="btn primary-btn">Get Started</Link>
          <Link to="/learn-more" className="btn secondary-btn">Learn More</Link>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="landing-right">
        <img src={travelImg} alt="Travel" className="landing-image" />
      </div>
    </div>
  );
};

export default LandingPage;

