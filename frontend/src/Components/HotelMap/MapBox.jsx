import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const Map = React.memo(({ hotels, center, zoom, onMarkerClick }) => {
    const mapContainerRef = useRef();
    const mapRef = useRef();

    useEffect(() => {
        // Ensure the container is empty before initializing the map
        const mapContainer = mapContainerRef.current;
        mapContainer.innerHTML = ""; // Clear the container

        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        mapRef.current = new mapboxgl.Map({
            container: mapContainer,
            center,
            zoom, // starting zoom
        });

        // Adding markers for hotels
        const markers = hotels.map((hotel) => {
            const { latitude, longitude } = hotel.geoCode;
            const marker = new mapboxgl.Marker()
                .setLngLat([longitude, latitude])
                .addTo(mapRef.current);

            marker.getElement().addEventListener("click", () => {
                onMarkerClick(hotel);
            });

            return marker; // Returning marker to be used for cleanup later
        });

        // Cleanup function to remove markers and event listeners
        return () => {
            markers.forEach((marker) => {
                marker.remove(); // Removes the marker from the map
            });
        };
    }, [hotels, center, zoom, onMarkerClick]); // Effect depends on hotels, center, zoom, and onMarkerClick

    return (
        <div
            style={{ height: "100%" }}
            ref={mapContainerRef}
            className="map-container"
        />
    );
});

export default Map;
