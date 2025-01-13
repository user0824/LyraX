// ------------------------------------------------------------------------------------------------
// > SERVER < //
// ------------------------------------------------------------------------------------------------
import express, { Response, Request } from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "../routes";
import errorHandler from "../middleware/errorHandler";
import { supabase } from "../utils/supabase";

dotenv.config(); // Load environment variables from .env

// ------------------------------------------------------------------------------------------------
// * Check for missing Supabase credentials
// ------------------------------------------------------------------------------------------------
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase configuration in .env");
}

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------------------------------------------
// * MIDDLEWARE
// ------------------------------------------------------------------------------------------------
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json()); // EXPRESS
app.use("/api", routes); // ROUTES

// Test to see if server is running
app.get("/", (req: Request, res: Response) => {
  res.send("LyraX Server is live!");
});

// ! TEST ! - TBD
// app.get(
//   "/test-insert-resume",
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { data, error } = await supabase
//         .from("resumes")
//         .insert([
//           {
//             user_id: "809121cc-9a4d-4189-b99e-fcbe9635da8e",
//             title: "test",
//             content: "test",
//           },
//         ]);

//       if (error) {
//         console.error("Insert error:", error);
//         res.status(500).send("Insert failed: " + error.message);
//         return;
//       }
//       res.send("Insert success: " + JSON.stringify(data));
//     } catch (err) {
//       res.status(500).send("Caught error: " + err);
//     }
//   },
// );

// ------------------------------------------------------------------------------------------------
// * LOGOUT - Sign user out of Supabase
// ------------------------------------------------------------------------------------------------
app.get("/logout", async (req: Request, res: Response): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error.message);
    res.status(500).send("Failed to logout");
    return;
  }

  // Redirect back to welcome page
  const returnUrl = "http://localhost:5173/welcome";
  return res.redirect(returnUrl);
});

// ------------------------------------------------------------------------------------------------
// * 404 HANDLER
// ------------------------------------------------------------------------------------------------
app.use((req, res) => {
  console.warn(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

// ------------------------------------------------------------------------------------------------
// * ERROR HANDLER MIDDLEWARE
// ------------------------------------------------------------------------------------------------
app.use(errorHandler);

// ------------------------------------------------------------------------------------------------
// * START SERVER
// ------------------------------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
