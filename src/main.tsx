import React from "react";
import ReactDOM from "react-dom/client";
import RadioPlayer from "./RadioPlayer";
import "./RadioPlayer.css"; // make sure your CSS is imported

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <RadioPlayer />
  </React.StrictMode>
);
