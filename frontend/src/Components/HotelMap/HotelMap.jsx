import { useState, useEffect, useCallback } from "react";
import ListView from "./ListView";
import "./HotelMap.css";
import Map from "./MapBox";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

const HotelMap = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const cityCode = queryParams.get("city") || "NYC";
    const radius = queryParams.get("radius") || "5";
    const radiusUnit = queryParams.get("unit") || "MILE";
    const ratings = queryParams.get("ratings") || "5";

    // Move all useState hooks to the top
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [hoveredHotel, setHoveredHotel] = useState(null);
    const [mapCenter, setMapCenter] = useState([0, 0]);
    const [zoom, setZoom] = useState(5);
    const [showMap, setShowMap] = useState(false);

    // Data fetching
    const {
        data: hotels = [],
        error,
        isLoading,
    } = useQuery({
        queryKey: ["hotels", cityCode, radius, radiusUnit, ratings],
        queryFn: async () => {
            const response = await fetch(
                `https://jet-genie--backend-flask-app.modal.run/api/hotels/search?cityCode=${cityCode}&radius=${radius}&radiusUnit=${radiusUnit}&ratings=${ratings}&hotelSource=ALL`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch hotels");
            }

            return response.json();
        },
    });

    useEffect(() => {
        if (
            JSON.stringify(mapCenter) === JSON.stringify([0, 0]) &&
            hotels.length > 0
        ) {
            setMapCenter([
                hotels[0].geoCode.longitude,
                hotels[0].geoCode.latitude,
            ]);
            setZoom(10);
        }
    }, [hotels, mapCenter]);

    const handleMarkerClick = useCallback((hotel) => {
        setSelectedHotel(hotel);
    }, []);

    const handleListItemHover = useCallback((hotel) => {
        if (hotel === null) {
            return;
        }
        setHoveredHotel(hotel);
        setZoom(15);
        setMapCenter([hotel.geoCode.longitude, hotel.geoCode.latitude]);
    }, []);

    // Render loading and error states without breaking hooks order
    if (isLoading) {
        return (
            <div className={`hotel-map ${showMap ? "show-map" : ""}`}>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`hotel-map ${showMap ? "show-map" : ""}`}>
                <p>Error: {error.message}</p>
            </div>
        );
    }

    return (
        <div className={`hotel-map ${showMap ? "show-map" : ""}`}>
            <ListView
                hotels={hotels}
                selectedHotel={selectedHotel}
                onHotelHover={handleListItemHover}
                onHotelSelect={handleMarkerClick}
            />
            <div className="map-box">
                <Map
                    hotels={hotels}
                    selectedHotel={selectedHotel}
                    center={mapCenter}
                    zoom={zoom}
                    onMarkerClick={handleMarkerClick}
                />
            </div>
        </div>
    );
};

export default HotelMap;
