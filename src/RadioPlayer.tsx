import React, { useState, useRef } from "react";
import "./RadioPlayer.css"
// Step 1: Type Definition
interface Station {
    name: string;
    url: string;
    description?: string;
}
const RadioPlayer = () => {
    // Step 2: Stations State
    const [stations, setStations] = useState<Station[]>([
        { name: "Radio rock", url: "https://live-bauerno.sharp-stream.com/simulcast3_no.mp3", description: "Euro Rock" },
        { name: "90's grunge", url: "https://corn.kvsc.org/radiox", description: "Euro Grunge" },
        { name: "Radio X", url: "https://media-ssl.musicradio.com/RadioX-M-Britpop", description: "Brit Pop" }
    ]);

    // ==========================
    // Step 3: Other States
    // ==========================
    const [currentStation, setCurrentStation] = useState<Station | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(0.1);

    // Form states
    const [newName, setNewName] = useState<string>("");
    const [newUrl, setNewUrl] = useState<string>("");
    const [newDescription, setNewDescription] = useState<string>("");

    // ==========================
    // Step 4: Audio Ref
    // ==========================
    const audioRef = useRef<HTMLAudioElement>(null);

    // ==========================
    // Step 5: Player Functions
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
            .catch((err: any) => console.error("Playback failed:", err));
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

    const addStation = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newName || !newUrl) return;

        const newStation: Station = {
            name: newName,
            url: newUrl,
            description: newDescription || "No description"
        };

        setStations([...stations, newStation]);
        setNewName("");
        setNewUrl("");
        setNewDescription("");
    };

    const [deleteName, setDeleteName] = useState<string>("");

    const deleteStationByName = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!deleteName) return;

        setStations(stations.filter((station) => station.name.toLowerCase() !== deleteName.toLowerCase()));
        setDeleteName(""); // clear input after delete
    };


    // ==========================
    // Step 6: Rendering (TSX)
    // ==========================
    return (
        <div className="radio-app">
            <h1>🎵 Neon Radio Player</h1>

            {/* Player Section (centered) */}
            <div className="player-section">
                {stations.map((station, index) => (
                    <div
                        key={index}
                        className={`station-card ${currentStation?.name === station.name ? "active" : ""}`}
                        onClick={() => playStation(station)}
                    >
                        <span className="station-name">{station.name}</span>
                        <div className="tooltip">{station.description}</div>

                        {/* Play/Pause button */}
                        {currentStation?.name === station.name && (
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="play-btn"
                            >
                                {isPlaying ? "⏸ Pause" : "▶️ Play"}
                            </button>
                        )}
                    </div>
                ))}

                {/* Now Playing + Volume Slider */}
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
            </div>

            {/* Hidden audio element */}
            <audio ref={audioRef} />

            {/* Add Station Form - fixed bottom left */}
            <div className="form-floating-left">
                <form onSubmit={addStation} className="add-station-form">
                    <h3>Add New Station</h3>
                    <input
                        type="text"
                        placeholder="Station Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Station Stream URL"
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
                    <button type="submit">Add Station</button>
                </form>
            </div>
            <div className="form-floating-right">
                <form onSubmit={deleteStationByName} className="delete-station-form">
                    <h3>Delete Station</h3>
                    <input
                        type="text"
                        placeholder="Enter Station Name"
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
// Step 7: Export at Bottom
// ==========================
export default RadioPlayer;