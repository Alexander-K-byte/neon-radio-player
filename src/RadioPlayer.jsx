import { useState, useRef } from "react";
import "./RadioPlayer.css"

const stations = [
    {
        name: "Radio rock",
        url: "https://live-bauerno.sharp-stream.com/simulcast3_no.mp3",
        description: "Euro Rock"
    },
    {
        name: "90's grunge",
        url: "https://corn.kvsc.org/radiox",
        description: "Euro Grunge"
    },
    {
        name: "Radio X",
        url: "https://media-ssl.musicradio.com/RadioX-M-Britpop",
        description: "Alt rock"
    }
];

export default function RadioPlayer() {
    const [currentStation, setCurrentStation] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5); // default volume at 50%
    const audioRef = useRef(null);

    const playStation = (station) => {
        if (audioRef.current) {
            audioRef.current.src = station.url;
            audioRef.current.volume = volume;
            audioRef.current
                .play()
                .then(() => {
                    setCurrentStation(station);
                    setIsPlaying(true);
                })
                .catch((err) => console.error("Playback failed:", err));
        }
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

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    return (
        <div className="radio-player">
            <h1>🎵 Online Radio Player</h1>

            {stations.map((station, index) => (
                <div
                    key={index}
                    className={`station-card ${currentStation?.name === station.name ? "active" : ""
                        }`}
                    onClick={() => playStation(station)}
                >
                    <span className="station-name">{station.name}</span>

                    <div className="tooltip">{station.description}</div>

                    {currentStation?.name === station.name && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePlay();
                            }}
                            className="play-btn"
                        >
                            {isPlaying ? "⏸ Pause" : "▶️ Play"}
                        </button>
                    )}
                </div>
            ))}

            {currentStation && (
                <div className="now-playing">
                    <p>
                        Now Playing: <strong>{currentStation.name}</strong>
                    </p>

                    {/* Volume slider */}
                    <label htmlFor="volume" style={{ display: "block", marginTop: "0.5rem" }}>
                        Volume
                    </label>
                    <input
                        type="range"
                        id="volume"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        style={{ width: "100%" }}
                    />
                </div>
            )}

            <audio ref={audioRef} />
        </div>
    );
}
