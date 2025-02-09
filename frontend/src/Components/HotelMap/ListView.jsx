const ListView  = ({ hotels, selectedHotel, onHotelHover, onHotelSelect }) => {
  return (
    <div className="list-view">
      <h2>Hotels</h2>
      <ul>
        {hotels.map((hotel) => (
          <li
            key={hotel.hotelId}
            className={`hotel-item ${selectedHotel?.id === hotel.id ? "selected" : ""}`}
            onMouseEnter={() => onHotelHover(hotel)}
            onMouseLeave={() => onHotelHover(null)}
            onClick={() => onHotelSelect(hotel)}
          >
            <h3>{hotel.name}</h3>
            <p>Rating: {hotel.rating ? hotel.rating : "N/A"}</p>
            {/* {hotel.price && <p>Price: {hotel.price}</p>} */}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ListView

