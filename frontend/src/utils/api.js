export const fetchHotels = async (bounds) => {
    const mockHotels = [
        {
            chainCode: "YX",
            iataCode: "NYC",
            dupeId: 502126859,
            name: "SYNSIX HOTELTEST HOTEL XXX",
            hotelId: "YXNYCXXX",
            geoCode: {
                latitude: 40.71455,
                longitude: -74.00714,
            },
            address: {
                countryCode: "US",
            },
            distance: {
                value: 0.11,
                unit: "KM",
            },
            lastUpdate: "2023-06-15T10:21:44",
        },
        {
            chainCode: "XT",
            iataCode: "NYC",
            dupeId: 700070576,
            name: "DUANE STREET HOTEL",
            hotelId: "XTNYC130",
            geoCode: {
                latitude: 40.71586,
                longitude: -74.00745,
            },
            address: {
                countryCode: "US",
            },
            distance: {
                value: 0.23,
                unit: "KM",
            },
            lastUpdate: "2023-06-15T09:51:21",
        },
        {
            chainCode: "TM",
            iataCode: "NYC",
            dupeId: 700110314,
            name: "SMYTH - A THOMPSON HOTEL",
            hotelId: "TMNYC822",
            geoCode: {
                latitude: 40.71517,
                longitude: -74.00942,
            },
            address: {
                countryCode: "US",
            },
            distance: {
                value: 0.32,
                unit: "KM",
            },
            lastUpdate: "2023-06-15T10:35:37",
        },
        {
            chainCode: "LE",
            iataCode: "NYC",
            dupeId: 700006312,
            name: "COSMOPOLITAN HOTEL - TRIBECA",
            hotelId: "LENYC7A3",
            geoCode: {
                latitude: 40.71569,
                longitude: -74.00933,
            },
            address: {
                countryCode: "US",
            },
            distance: {
                value: 0.34,
                unit: "KM",
            },
            lastUpdate: "2023-06-15T09:55:00",
        },
    ];

    console.log(mockHotels)

    return new Promise((resolve) => {
        setTimeout(() => resolve({
            data: mockHotels,
        }), 500);
    });
};
