import { Router } from "express";
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addFollowUp,
  updateFollowUp,
  getFollowUps,
  updateLeadDocument,
  addLeadDocument,
  getLeadDocuments,
  updateLeadContact,
  reactivateLeadBackend,
  handoverLead,
  updateLeadLender,
  addLeadComment,
} from "../controllers/leadController.js";

const router = Router();

// Lead base routes: /api/v1/leads
router.route("/").post(createLead).get(getAllLeads);
router.route("/:id").get(getLeadById).put(updateLead).patch(updateLead).delete(deleteLead);

// Follow-up routes (Stage 1)
router.route("/:id/followups").get(getFollowUps).post(addFollowUp);
router.route("/:id/followups/:followUpId").put(updateFollowUp).patch(updateFollowUp);

// Document routes (Stage 2)
router.route("/:id/documents").get(getLeadDocuments).post(addLeadDocument).put(updateLeadDocument);
router.route("/:id/documents/:docId").put(updateLeadDocument).patch(updateLeadDocument);

// First contact & interest routes (Stage 3)
router.route("/:id/contact").put(updateLeadContact).patch(updateLeadContact);
router.route("/:id/reactivate").post(reactivateLeadBackend);

// Handover & Lender Hub routes (Stage 4)
router.route("/:id/handover").post(handoverLead);
router.route("/:id/lender").put(updateLeadLender).patch(updateLeadLender);

// General Comments & Interaction Timeline routes (Stage 5)
router.route("/:id/comments").post(addLeadComment);

export default router;

