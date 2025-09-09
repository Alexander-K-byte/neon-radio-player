import React, { useState, useRef, useEffect } from "react";
import "./RadioPlayer.css";

// ==========================
// Step 1: Type Definitions
// ==========================
interface Station {
    name: string;
    url: string;
    description?: string;
    stationuuid?: string;
}

// ==========================
// Step 2: Component
// ==========================
const RadioPlayer = () => {
    // ==========================
    // Server & Stations State
    // ==========================
    const [servers, setServers] = useState<string[]>([]);
    const [currentServer, setCurrentServer] = useState<string | null>(null);

    const [allStations, setAllStations] = useState<Station[]>([]);
    const [filteredStations, setFilteredStations] = useState<Station[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [currentStation, setCurrentStation] = useState<Station | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(0.1);

    // Add/Delete Form States
    const [newName, setNewName] = useState<string>("");
    const [newUrl, setNewUrl] = useState<string>("");
    const [newDescription, setNewDescription] = useState<string>("");
    const [deleteName, setDeleteName] = useState<string>("");

    // Audio Ref
    const audioRef = useRef<HTMLAudioElement>(null);

    // ==========================
    // Step 3: Fetch Servers & Stations
    // ==========================
    const fetchServersAndStations = async () => {
        try {
            const hostnames = ["https://fi1.api.radio-browser.info", "https://de2.api.radio-browser.info"];
            setServers(hostnames);

            const server = hostnames[Math.floor(Math.random() * hostnames.length)];
            setCurrentServer(server);

            const stationsRes = await fetch(`${server}/json/stations`, {
                headers: { "User-Agent": "MyCoolRadioApp/1.0" },
            });
            const stationsData: Station[] = await stationsRes.json();

            setAllStations(stationsData);
            setFilteredStations([]); // start empty until user searches
        } catch (err) {
            console.error("Error fetching servers or stations:", err);
            // Fallback default stations
            const defaultStations: Station[] = [
                { name: "Radio rock", url: "https://live-bauerno.sharp-stream.com/simulcast3_no.mp3", description: "Euro Rock" },
                { name: "90's grunge", url: "https://corn.kvsc.org/radiox", description: "Euro Grunge" },
                { name: "Radio X", url: "https://media-ssl.musicradio.com/RadioX-M-Britpop", description: "Brit Pop" },
            ];
            setAllStations(defaultStations);
            setFilteredStations([]);
        }
    };

    useEffect(() => {
        fetchServersAndStations();
    }, []);

    // ==========================
    // Step 4: Player Functions
    // ==========================
    const playStation = (station: Station) => {
        if (!audioRef.current) return;
        audioRef.current.src = station.url;
        audioRef.current.volume = volume;
        audioRef.current
            .play()
            .then(() => {
                setCurrentStation(station);
                setIsPlaying(true);
            })
            .catch((err) => console.error("Playback failed:", err));
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true));
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) audioRef.current.volume = newVolume;
    };

    // ==========================
    // Step 5: Add / Delete Stations
    // ==========================
    const addStation = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newName || !newUrl) return;

        const newStation: Station = {
            name: newName,
            url: newUrl,
            description: newDescription || "No description",
            stationuuid: newName,
        };

        setAllStations([...allStations, newStation]);
        setNewName("");
        setNewUrl("");
        setNewDescription("");
    };

    const deleteStationByName = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!deleteName) return;

        setAllStations(allStations.filter((station) => station.name.toLowerCase() !== deleteName.toLowerCase()));
        setDeleteName("");
    };

    // ==========================
    // Step 6: Search Functionality (Enter Only)
    // ==========================
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const filtered = allStations.filter(
                (station) =>
                    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (station.description?.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredStations(filtered);
        }
    };

    // ==========================
    // Step 7: Render
    // ==========================
    return (
        <div className="radio-app">
            <h1>🎵 Neon Radio Player</h1>

            {/* Search Box */}
            <input
                type="text"
                placeholder="Search stations..."
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="station-search"
            />

            {/* Scrollable Station List */}
            <div className="station-list-container">
                {filteredStations.map((station) => (
                    <div
                        key={station.stationuuid || station.name}
                        className={`station-card ${currentStation?.stationuuid === station.stationuuid ? "active" : ""}`}
                        onClick={() => playStation(station)}
                    >
                        <span className="station-name">{station.name}</span>
                        <div className="tooltip">{station.description}</div>
                        {currentStation?.stationuuid === station.stationuuid && (
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="play-btn"
                            >
                                {isPlaying ? "⏸ Pause" : "▶️ Play"}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Centered Player */}
            {currentStation && (
                <div className="now-playing">
                    <p>Now Playing: <strong>{currentStation.name}</strong></p>
                    <label htmlFor="volume">Volume</label>
                    <input
                        type="range"
                        id="volume"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                </div>
            )}

            <audio ref={audioRef} />

            {/* Add Station Form - Bottom Left */}
            <div className="form-floating-left">
                <form onSubmit={addStation} className="add-station-form">
                    <h3>Add Station</h3>
                    <input
                        type="text"
                        placeholder="Station Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Stream URL"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                    <button type="submit">Add</button>
                </form>
            </div>

            {/* Delete Station Form - Bottom Right */}
            <div className="form-floating-right">
                <form onSubmit={deleteStationByName} className="delete-station-form">
                    <h3>Delete Station</h3>
                    <input
                        type="text"
                        placeholder="Station Name"
                        value={deleteName}
                        onChange={(e) => setDeleteName(e.target.value)}
                        required
                    />
                    <button type="submit">Delete</button>
                </form>
            </div>
        </div>
    );
};

// ==========================
// Export at Bottom
// ==========================
export default RadioPlayer;
