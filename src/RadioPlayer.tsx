import { useId, useRef, useState } from "react";
import "./RadioPlayer.css";

// ==========================
// Types
// ==========================
interface Station {
	name: string;
	url: string;
	description?: string;
	countryCode?: string;
	language?: string;
}

// ==========================
// Component
// ==========================
const RadioPlayer = () => {
	const [stations, setStations] = useState<Station[]>([
		{
			name: "Radio Rock",
			url: "https://live-bauerno.sharp-stream.com/simulcast3_no.mp3",
			description: "Euro Rock",
			countryCode: "NO",
			language: "English",
		},
		{
			name: "90's Grunge",
			url: "https://corn.kvsc.org/radiox",
			description: "Euro Grunge",
			countryCode: "US",
			language: "English",
		},
		{
			name: "Radio X",
			url: "https://media-ssl.musicradio.com/RadioX-M-Britpop",
			description: "Brit Pop",
			countryCode: "GB",
			language: "English",
		},
	]);

	// ==========================
	// Player States
	// ==========================
	const [currentStation, setCurrentStation] = useState<Station | null>(null);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [volume, setVolume] = useState<number>(0.1);

	// ==========================
	// Forms
	// ==========================
	const [newName, setNewName] = useState("");
	const [newUrl, setNewUrl] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [newCountry, setNewCountry] = useState("");
	const [newLanguage, setNewLanguage] = useState("");

	const [deleteName, setDeleteName] = useState("");

	const [searchTerm, setSearchTerm] = useState("");
	const [submittedSearch, setSubmittedSearch] = useState("");

	const [countryFilter, setCountryFilter] = useState("");
	const [languageFilter, setLanguageFilter] = useState("");

	const [currentPage, setCurrentPage] = useState(1);
	const stationsPerPage = 10;

	const volumeId = useId();
	const audioRef = useRef<HTMLAudioElement>(null);

	// ==========================
	// Player Functions
	// ==========================
	const playStation = (station: Station) => {
		if (!audioRef.current) return;

		audioRef.current.src = station.url;
		audioRef.current.volume = volume;

		audioRef.current.play().then(() => {
			setCurrentStation(station);
			setIsPlaying(true);
		});
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
		const vol = parseFloat(e.target.value);
		setVolume(vol);
		if (audioRef.current) audioRef.current.volume = vol;
	};

	// ==========================
	// Add/Delete
	// ==========================
	const addStation = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!newName || !newUrl) return;

		const newStation: Station = {
			name: newName,
			url: newUrl,
			description: newDescription || "No description",
			countryCode: newCountry || undefined,
			language: newLanguage || undefined,
		};

		setStations((prev) => [...prev, newStation]);

		setNewName("");
		setNewUrl("");
		setNewDescription("");
		setNewCountry("");
		setNewLanguage("");
	};

	const deleteStationByName = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setStations((prev) =>
			prev.filter(
				(station) => station.name.toLowerCase() !== deleteName.toLowerCase(),
			),
		);

		setDeleteName("");
	};

	// ==========================
	// Search + Filter
	// ==========================
	const filteredStations = stations
		.filter((s) =>
			submittedSearch
				? s.name.toLowerCase().includes(submittedSearch.toLowerCase())
				: true,
		)
		.filter((s) =>
			countryFilter
				? s.countryCode?.toLowerCase() === countryFilter.toLowerCase()
				: true,
		)
		.filter((s) =>
			languageFilter
				? s.language?.toLowerCase() === languageFilter.toLowerCase()
				: true,
		);

	// ==========================
	// Pagination
	// ==========================
	const indexOfLast = currentPage * stationsPerPage;
	const indexOfFirst = indexOfLast - stationsPerPage;
	const currentStations = filteredStations.slice(indexOfFirst, indexOfLast);

	const totalPages = Math.ceil(filteredStations.length / stationsPerPage);

	const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmittedSearch(searchTerm);
		setCurrentPage(1);
	};

	// ==========================
	// Render
	// ==========================
	return (
		<div className="radio-app">
			<h1>🎵 Neon Radio Player</h1>

			{/* Filters */}
			<div className="filter-section">
				<form onSubmit={handleSearchSubmit}>
					<input
						type="text"
						placeholder="Search Station..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</form>

				<select
					value={countryFilter}
					onChange={(e) => setCountryFilter(e.target.value)}
				>
					<option value="">All Countries</option>
					<option value="US">USA</option>
					<option value="GB">UK</option>
					<option value="NO">Norway</option>
				</select>

				<select
					value={languageFilter}
					onChange={(e) => setLanguageFilter(e.target.value)}
				>
					<option value="">All Languages</option>
					<option value="English">English</option>
					<option value="French">French</option>
				</select>
			</div>

			{/* Station List */}
			<div className="station-list-container">
				{currentStations.map((station) => (
					<div
						key={`${station.name}-${station.url}`}
						className={`station-card ${
							currentStation?.name === station.name ? "active" : ""
						}`}
					>
						{/* Station Select Button */}
						<button
							type="button"
							className="station-select-btn"
							onClick={() => playStation(station)}
						>
							{station.name}
							<div className="tooltip">{station.description}</div>
						</button>

						{/* Play Button */}
						{currentStation?.name === station.name && (
							<button
								type="button"
								className="play-btn"
								onClick={(e) => {
									e.stopPropagation();
									togglePlay();
								}}
							>
								{isPlaying ? "⏸" : "▶️"}
							</button>
						)}
					</div>
				))}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="pagination-controls">
					<button
						type="button"
						onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
						disabled={currentPage === 1}
					>
						Previous
					</button>

					<span>
						Page {currentPage} of {totalPages}
					</span>

					<button
						type="button"
						onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
						disabled={currentPage === totalPages}
					>
						Next
					</button>
				</div>
			)}

			{/* Now Playing */}
			{currentStation && (
				<div className="now-playing">
					<p>
						Now Playing: <strong>{currentStation.name}</strong>
					</p>
					<label htmlFor="volumeId">Volume</label>
					<input
						id={volumeId}
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						onChange={handleVolumeChange}
					/>
				</div>
			)}

			{/** biome-ignore lint/a11y/useMediaCaption: Applies to video, not audio streams */}
			<audio ref={audioRef} />

			{/* Add Station Form */}
			<div className="form-floating-left">
				<form onSubmit={addStation} className="add-station-form">
					<h3>Add New Station</h3>
					<input
						type="text"
						placeholder="Name"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
					/>
					<input
						type="text"
						placeholder="Stream URL"
						value={newUrl}
						onChange={(e) => setNewUrl(e.target.value)}
					/>
					<input
						type="text"
						placeholder="Description"
						value={newDescription}
						onChange={(e) => setNewDescription(e.target.value)}
					/>
					<input
						type="text"
						placeholder="Country Code"
						value={newCountry}
						onChange={(e) => setNewCountry(e.target.value)}
					/>
					<input
						type="text"
						placeholder="Language"
						value={newLanguage}
						onChange={(e) => setNewLanguage(e.target.value)}
					/>
					<button type="submit">Add Station</button>
				</form>
			</div>

			{/* Delete Station Form */}
			<div className="form-floating-right">
				<form onSubmit={deleteStationByName} className="delete-station-form">
					<h3>Delete Station</h3>
					<input
						type="text"
						placeholder="Station Name"
						value={deleteName}
						onChange={(e) => setDeleteName(e.target.value)}
					/>
					<button type="submit">Delete</button>
				</form>
			</div>
		</div>
	);
};

export default RadioPlayer;
