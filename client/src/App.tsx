import { useEffect, useState } from "react";
import "./App.css";
import Welcome from "./components/Welcome";
import Dashboard from "./components/Dashboard";
import { PuffLoader } from "react-spinners";
import { supabase } from "./utils/supabase";
import { Session } from "@supabase/supabase-js";

// ------------------------------------------------------------------------------------------------
// > APP COMPONENT < //
// ------------------------------------------------------------------------------------------------
const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------------------------------------------
  // * OAUTH 2.0 REDIRECT HANDLER + GET SESSION
  // ------------------------------------------------------------------------------------------------
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session from URL:", error.message);
      } else if (data.session) {
        setSession(data.session);
      }
      setLoading(false);
    };
    handleOAuthRedirect();
  }, []);

  // ------------------------------------------------------------------------------------------------
  // * LISTEN FOR SESSION CHANGES
  // ------------------------------------------------------------------------------------------------

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // ------------------------------------------------------------------------------------------------
  // !! LOADING SPINNER - Isn't showing as the redirect happens quickly - TO BE DELETED (UNINSTALL package)
  // ------------------------------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="app-container flex h-screen w-full items-center justify-center">
        <PuffLoader color="#535bf2" size={72} speedMultiplier={1} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {session ? <Dashboard session={session} /> : <Welcome />}
    </div>
  );
};

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default App;
