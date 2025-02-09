import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HotelForm.css";

const HotelForm = () => {
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState(5);
  const [unit, setUnit] = useState("KM");
  const [ratings, setRatings] = useState([]);
  const navigate = useNavigate();

  const handleRatingChange = (rating) => {
    setRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const fetchCityCode = async () => {
    try {
      const response = await fetch(`https://api.example.com/citycode?city=${city}`);
      const data = await response.json();
      return data.cityCode;
    } catch (error) {
      console.error("Error fetching city code:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city) return;
    
    // const cityCode = await fetchCityCode();
    // if (!cityCode) return;

    let params = {
        city: city,
        radius,
        unit,
    }

    if (ratings.length !== 5){
        params.ratings = ratings.join(",");
    }
    const queryParams = new URLSearchParams(params).toString();

    navigate(`/hotels/search?${queryParams}`);
  };

  return (
    <div className="hotel-search-container">
      <form onSubmit={handleSubmit} className="hotel-search-form">
        <h2>Search Hotels</h2>
        <label htmlFor="city">City</label>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <label htmlFor="radius">Radius</label>
        <input
          type="number"
          min="1"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />
        <label htmlFor="unit">Unit</label>
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="KM">KM</option>
          <option value="MILES">Miles</option>
        </select>
        <label htmlFor="ratings">Ratings</label>
        <div className="ratings">
          {[1, 2, 3, 4, 5].map((rating) => (
            <label key={rating}>
              <input
                type="checkbox"
                value={rating}
                checked={ratings.includes(rating)}
                onChange={() => handleRatingChange(rating)}
              />
              {rating} Star
            </label>
          ))}
        </div>
        <button type="submit">Search Hotels</button>
      </form>
    </div>
  );
};

export default HotelForm;
