import React, { useEffect, useRef, useState } from "react";
import Spline from "@splinetool/react-spline";
import LoginPopup from "./LoginPopup";

// ------------------------------------------------------------------------------------------------
// * BACKGROUND WALLPAPERS
// ------------------------------------------------------------------------------------------------
const welcomeBackgrounds = [
  "https://prod.spline.design/lbUrxTyV5JdtZ0oz/scene.splinecode", // robot
  "https://prod.spline.design/EIi62Rj6EPJWnpzO/scene.splinecode", // particle
  "https://prod.spline.design/i-7IuCq0WNtiQR9P/scene.splinecode", // nebula
];

// ------------------------------------------------------------------------------------------------
// > WELCOME COMPONENT < //
// ------------------------------------------------------------------------------------------------
const Welcome: React.FC = () => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [background, setBackground] = useState("");
  const popupRef = useRef<HTMLDivElement | null>(null);

  // ------------------------------------------------------------------------------------------------
  // * RANDOMIZE WALLPAPER + KEEP CURRENT WALLPAPER PERSISTENT FOR SESSION
  // ------------------------------------------------------------------------------------------------
  useEffect(() => {
    const randomBackground =
      welcomeBackgrounds[Math.floor(Math.random() * welcomeBackgrounds.length)];
    setBackground(randomBackground);
  }, []);

  const togglePopup = () => {
    setShowLoginPopup(!showLoginPopup);
  };

  // ------------------------------------------------------------------------------------------------
  // * OVERLAY CLICK HANDLER - CLOSE LOGIN POPUP IF CLICKED OUTSIDE OF WINDOW
  // ------------------------------------------------------------------------------------------------
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setShowLoginPopup(false);
    }
  };

  // ------------------------------------------------------------------------------------------------
  // * RETURN
  // ------------------------------------------------------------------------------------------------
  return (
    <section className="fixed inset-0 h-full w-full">
      {/* SPLINE BACKGROUND */}
      <div className="absolute inset-0">
        <Spline
          className="absolute inset-0 flex h-screen w-screen items-center justify-center"
          scene={background}
        />
      </div>

      {/* TITLE */}
      <h1 className="absolute ml-10 mt-7 text-left text-7xl font-bold text-white">
        <a
          href="http://localhost:5173/"
          className="text-left text-7xl font-bold text-white hover:text-white"
        >
          Lyra
        </a>
      </h1>

      {/* CONTENT OVERLAY - INTERACTIVE */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto text-center">
          <button
            onClick={togglePopup}
            className="animate-fade-in backdrop-blur-xs active: w-full rounded-full border-white/20 bg-white/10 px-14 py-4 text-3xl text-white opacity-0 ring-0 hover:bg-indigo-700/50 hover:font-extrabold focus:border-white/30 focus:ring-0 active:outline-none"
          >
            <span className="animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]">
              Get Started
            </span>
          </button>
        </div>
      </div>

      {/* LOGIN POPUP OVERLAY */}
      {showLoginPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleOverlayClick}
        >
          <div ref={popupRef}>
            <LoginPopup onClose={togglePopup} />
          </div>
        </div>
      )}
    </section>
  );
};

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default Welcome;
