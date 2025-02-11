const InfoWindow = ({ hotel, onClose }) => {
  return (
    <div className="info-window">
      <button className="close-button" onClick={onClose}>
        ×
      </button>
      <h3>{hotel.name}</h3>
      <p>Rating: {hotel.rating}</p>
      {hotel.price && <p>Price: ${hotel.price}</p>}
      <img src={hotel.image || "/placeholder.svg"} alt={hotel.name} className="hotel-image" />
      <button className="view-details">View Details</button>
    </div>
  )
}

export default InfoWindow

