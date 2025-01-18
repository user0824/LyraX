// ------------------------------------------------------------------------------------------------
// > LOGINPOPUP COMPONENT < //
// ------------------------------------------------------------------------------------------------

import React, { useState } from "react";
import { supabase } from "../utils/supabase";

interface LoginPopupProps {
  onClose: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ------------------------------------------------------------------------------------------------
  // * EMAIL AUTHENTICATION HANDLER
  // ------------------------------------------------------------------------------------------------
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let error;

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      error = signUpError;
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      error = signInError;
    }

    if (error) {
      console.log(error.code, error.name, error.status, error.message);
      alert(error.message);
    } else if (isSignUp) {
      alert("Check your email for confirmation");
      onClose();
    }
    setLoading(false);
  };

  // * Type for accepted OAuth providers from Supabase Auth.
  type OAuthProvider =
    | "apple"
    | "twitter"
    | "facebook"
    | "google"
    | "github"
    | "linkedin"
    | "azure";

  // ------------------------------------------------------------------------------------------------
  // * OAUTH 2.0 AUTHENTICATION HANDLER
  // ------------------------------------------------------------------------------------------------
  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setLoading(true);

    // * Redirects user back to site (`window.location.origin`) upon success
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin, // e.g., http://localhost:5173
      },
    });

    if (error) {
      alert(`${provider} login failed: ${error.message}`);
    }
    setLoading(false);
  };

  // * List of supported OAuth providers (with custom icons).
  const providers = [
    { name: "apple", src: "./src/assets/apple2.svg", alt: "Apple" },
    { name: "facebook", src: "./src/assets/meta.svg", alt: "Meta" },
    { name: "google", src: "./src/assets/google.svg", alt: "Google" },
    { name: "twitter", src: "./src/assets/x.svg", alt: "X" },
    { name: "linkedin", src: "./src/assets/linkedin.svg", alt: "LinkedIn" },
    { name: "azure", src: "./src/assets/microsoft.svg", alt: "Microsoft" },
    { name: "github", src: "./src/assets/github.svg", alt: "GitHub" },
  ];

  // ------------------------------------------------------------------------------------------------
  // * RETURN
  // ------------------------------------------------------------------------------------------------
  return (
    <div
      className="animate-fade-in-scale w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md"
      onClick={(event) => event.stopPropagation()}
    >
      <h2 className="mb-10 text-6xl font-bold text-white">
        {isSignUp ? "Sign Up" : "Login"}
      </h2>

      <form onSubmit={handleEmailAuth} className="flex flex-col space-y-6">
        {/* EMAIL FIELD */}
        <div className="relative">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-3 text-white backdrop-blur-sm placeholder:text-white/50 hover:border-indigo-400 focus:border-indigo-400 focus:border-white/30 focus:font-bold focus:outline-none"
            placeholder="email"
          />
        </div>
        {/* PASSWORD FIELD */}
        <div className="relative">
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mb-6 w-full rounded-full border border-white/20 bg-white/10 px-6 py-3 text-white backdrop-blur-sm placeholder:text-white/50 hover:border-indigo-400 focus:border-indigo-400 focus:border-white/30 focus:font-bold focus:outline-none"
            placeholder="password"
          />
        </div>

        {/* LOGIN/SIGN UP BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-full border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-all duration-500 ease-out ${
            loading
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-indigo-700/50 focus:border-white/30 focus:outline-none active:outline-indigo-400"
          }`}
        >
          <span className="animate-pulse text-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]">
            {loading ? "Initializing..." : isSignUp ? "Sign Up" : "Log In"}
          </span>
        </button>
      </form>

      {/* OAUTH PROVIDER LOGOS */}
      <div className="mt-12 flex justify-center gap-6">
        {providers.map((provider) => (
          <img
            key={provider.name}
            onClick={() => handleOAuthLogin(provider.name as OAuthProvider)}
            src={provider.src}
            alt={provider.alt}
            className="h-12 scale-100 cursor-pointer p-1 transition-transform duration-300 ease-in-out hover:scale-150"
          />
        ))}
      </div>
      <div className="mt-6"></div>

      {/* TOGGLE BETWEEN LOGIN AND SIGNUP */}
      <div className="mt-4 text-center text-white">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <span
          onClick={() => setIsSignUp(!isSignUp)}
          className="cursor-pointer font-semibold text-indigo-400 hover:underline"
        >
          {isSignUp ? "Log in" : "Sign up"}
        </span>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default LoginPopup;
