// ------------------------------------------------------------------------------------------------
// > ROUTES INDEX < //
// ------------------------------------------------------------------------------------------------
import express from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import weatherRoutes from "./weatherRoutes";
import resumeRoutes from "./resumeRoutes";
import jobsRoutes from "./jobsRoutes";
import applicationRoutes from "./applicationRoutes";
import companyRoutes from "./companyRoutes";

const router = express.Router();

// ------------------------------------------------------------------------------------------------
// * ATTACH EACH SUB-ROUTER UNDER ITS OWN PATH
// ------------------------------------------------------------------------------------------------
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/weather", weatherRoutes);
router.use("/resumes", resumeRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationRoutes);
router.use("/companies", companyRoutes);

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default router;
