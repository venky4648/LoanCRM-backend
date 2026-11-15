import { Lead } from "../models/Lead.js";

// Helper to generate a unique NL-XXXX ID
async function generateUniqueLeadId() {
  for (let i = 0; i < 10; i++) {
    const candidateId = `NL-${Math.floor(2000 + Math.random() * 8000)}`;
    const existing = await Lead.findOne({ leadId: candidateId });
    if (!existing) return candidateId;
  }
  return `NL-${Date.now().toString().slice(-4)}`;
}

// 1. Create a new Lead
export async function createLead(req, res) {
  try {
    const data = req.body;

    if (!data.student || !data.student.trim()) {
      return res.status(400).json({ success: false, error: "Student name is required" });
    }

    const leadId = data.id || data.leadId || (await generateUniqueLeadId());

    const defaultDocs = [
      { id: "doc_1", name: "Aadhaar & PAN", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
      { id: "doc_2", name: "Admission letter", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
      { id: "doc_3", name: "Academic marksheets", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
      { id: "doc_4", name: "Co-applicant salary slips / ITR", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
      { id: "doc_5", name: "Bank statement (6 months)", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
    ];

    const initialActivity = {
      id: `act_${Date.now()}`,
      type: "first_contact",
      description: `Lead created for ${data.student} via ${data.source || "Website inquiry form"}.`,
      updatedBy: data.owner || "Sales Team",
      timestamp: new Date().toISOString(),
    };

    const newLead = new Lead({
      leadId,
      student: data.student.trim(),
      phone: data.phone || "",
      email: data.email || "",
      source: data.source || "Website inquiry form",
      country: data.country || "USA",
      university: data.university || "University Partner",
      course: data.course || "MS Computer Science",
      intake: data.intake || "Fall 2026",
      loanType: data.loanType === "Secured" ? "Secured" : "Unsecured",
      amount: typeof data.amount === "number" ? data.amount : 3500000,
      stage: data.stage || "New Lead",
      contactStatus: data.contactStatus || "Not Contacted",
      interestStatus: data.interestStatus || "Not Contacted",
      notInterestedReason: data.notInterestedReason || "",
      lender: data.lender || "Not assigned",
      owner: data.owner || "Sales Team",
      coApplicant: data.coApplicant || {
        name: "Co-Applicant",
        relation: "Parent",
        employment: "Salaried",
        organisation: "Private Company",
        monthlyIncome: 80000,
        obligations: 10000,
        city: "Hyderabad",
      },
      academics: data.academics || {
        tenth: "85%",
        twelfth: "85%",
        graduation: "B.Tech - 8.0 CGPA",
        tests: "IELTS 7.0",
        experience: "Fresher",
      },
      collateral: data.collateral || {
        hasCollateral: "No",
        type: "",
        location: "",
        marketValue: 0,
        owner: "",
      },
      workflowDocuments:
        Array.isArray(data.workflowDocuments) && data.workflowDocuments.length > 0
          ? data.workflowDocuments
          : defaultDocs,
      followUps: Array.isArray(data.followUps) ? data.followUps : [],
      activities:
        Array.isArray(data.activities) && data.activities.length > 0
          ? data.activities
          : [initialActivity],
      handover: data.handover || { isHandedOver: false },
    });

    const saved = await newLead.save();

    // Map leadId to id for frontend compatibility
    const leadObj = saved.toObject();
    leadObj.id = leadObj.leadId;

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead: leadObj,
    });
  } catch (error) {
    console.error("[createLead] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create lead" });
  }
}

// 2. Get all Leads
export async function getAllLeads(req, res) {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    const formatted = leads.map((l) => ({
      ...l,
      id: l.leadId || String(l._id),
    }));

    res.json({
      success: true,
      count: formatted.length,
      leads: formatted,
    });
  } catch (error) {
    console.error("[getAllLeads] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch leads" });
  }
}

// 3. Get single Lead by ID
export async function getLeadById(req, res) {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne({ $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] }).lean();

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    res.json({
      success: true,
      lead: { ...lead, id: lead.leadId || String(lead._id) },
    });
  } catch (error) {
    console.error("[getLeadById] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch lead" });
  }
}

// 4. Update Lead
export async function updateLead(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lead = await Lead.findOneAndUpdate(
      { $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    res.json({
      success: true,
      message: "Lead updated successfully",
      lead: { ...lead, id: lead.leadId || String(lead._id) },
    });
  } catch (error) {
    console.error("[updateLead] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update lead" });
  }
}

// 5. Delete Lead
export async function deleteLead(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Lead.findOneAndDelete({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    res.json({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    console.error("[deleteLead] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to delete lead" });
  }
}

/* =========================================================================
   FOLLOW-UP MANAGEMENT CONTROLLERS (STAGE 1)
   ========================================================================= */

// 6. Add Follow-Up to a Lead
export async function addFollowUp(req, res) {
  try {
    const { id } = req.params;
    const { scheduledAt, reminderNote, authorName } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ success: false, error: "Follow-up date and time is required." });
    }

    const lead = await Lead.findOne({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    const followUpId = `fl_${Date.now()}`;
    const newFollowUp = {
      id: followUpId,
      scheduledAt,
      reminderNote: reminderNote || "Follow up with student/parent",
      status: "Upcoming",
      createdBy: authorName || "Sales Team",
      createdAt: new Date().toISOString(),
    };

    const newActivity = {
      id: `act_${Date.now()}`,
      type: "followup_created",
      description: `Scheduled follow-up for ${new Date(scheduledAt).toLocaleString("en-IN")}.`,
      comment: reminderNote || undefined,
      updatedBy: authorName || "Sales Team",
      timestamp: new Date().toISOString(),
    };

    lead.followUps.unshift(newFollowUp);
    lead.activities.unshift(newActivity);

    if (lead.interestStatus === "Not Contacted") {
      lead.interestStatus = "Follow-up Required";
    }
    if (lead.stage === "New Lead") {
      lead.stage = "Contacted";
    }

    await lead.save();

    const formatted = lead.toObject();
    formatted.id = formatted.leadId || String(formatted._id);

    res.status(201).json({
      success: true,
      message: "Follow-up scheduled successfully",
      followUp: newFollowUp,
      lead: formatted,
    });
  } catch (error) {
    console.error("[addFollowUp] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to schedule follow-up" });
  }
}

// 7. Update Follow-Up (Complete / Reschedule / Cancel)
export async function updateFollowUp(req, res) {
  try {
    const { id, followUpId } = req.params;
    const { action, completionNote, newScheduledAt, rescheduleReason, cancellationReason, authorName } = req.body;

    const lead = await Lead.findOne({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    const followUp = lead.followUps.find((f) => f.id === followUpId);
    if (!followUp) {
      return res.status(404).json({ success: false, error: "Follow-up record not found." });
    }

    const nowIso = new Date().toISOString();

    if (action === "complete") {
      followUp.status = "Completed";
      followUp.completedAt = nowIso;
      followUp.completionNote = completionNote || "Follow-up completed successfully.";

      lead.activities.unshift({
        id: `act_${Date.now()}`,
        type: "followup_completed",
        description: "Marked follow-up call as Completed.",
        comment: completionNote || "Call completed with student/parent.",
        updatedBy: authorName || "Sales Team",
        timestamp: nowIso,
      });
    } else if (action === "reschedule") {
      if (!newScheduledAt) {
        return res.status(400).json({ success: false, error: "New follow-up date and time is required to reschedule." });
      }

      followUp.scheduledAt = newScheduledAt;
      followUp.status = "Upcoming";
      followUp.rescheduledAt = nowIso;
      followUp.rescheduleReason = rescheduleReason || "Student requested a different time slot.";

      lead.activities.unshift({
        id: `act_${Date.now()}`,
        type: "followup_rescheduled",
        description: `Follow-up rescheduled to ${new Date(newScheduledAt).toLocaleString("en-IN")}.`,
        comment: rescheduleReason || "Student requested different time slot.",
        updatedBy: authorName || "Sales Team",
        timestamp: nowIso,
      });
    } else if (action === "cancel") {
      followUp.status = "Cancelled";
      followUp.cancelledAt = nowIso;
      followUp.cancellationReason = cancellationReason || "Follow-up cancelled by sales.";

      lead.activities.unshift({
        id: `act_${Date.now()}`,
        type: "followup_cancelled",
        description: "Follow-up cancelled.",
        comment: cancellationReason || "Cancelled by sales executive.",
        updatedBy: authorName || "Sales Team",
        timestamp: nowIso,
      });
    } else {
      return res.status(400).json({ success: false, error: "Invalid action. Expected complete, reschedule, or cancel." });
    }

    await lead.save();

    const formatted = lead.toObject();
    formatted.id = formatted.leadId || String(formatted._id);

    res.json({
      success: true,
      message: `Follow-up ${action}d successfully`,
      followUp,
      lead: formatted,
    });
  } catch (error) {
    console.error("[updateFollowUp] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update follow-up" });
  }
}

// 8. Get All Follow-ups for a Lead
export async function getFollowUps(req, res) {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    res.json({
      success: true,
      count: (lead.followUps || []).length,
      followUps: lead.followUps || [],
    });
  } catch (error) {
    console.error("[getFollowUps] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch follow-ups" });
  }
}

/* =========================================================================
   DOCUMENT COLLECTION MANAGEMENT CONTROLLERS (STAGE 2)
   ========================================================================= */

// 9. Update Document Collection Status & Comments
export async function updateLeadDocument(req, res) {
  try {
    const { id } = req.params;
    const { docName, docId, collectionStatus, verificationStatus, comments, authorName } = req.body;

    if (!docName && !docId) {
      return res.status(400).json({ success: false, error: "Document name or ID is required." });
    }

    const lead = await Lead.findOne({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    if (!Array.isArray(lead.workflowDocuments) || lead.workflowDocuments.length === 0) {
      lead.workflowDocuments = [
        { id: "doc_1", name: "Aadhaar & PAN", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_2", name: "Admission letter", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_3", name: "Academic marksheets", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_4", name: "Co-applicant salary slips / ITR", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_5", name: "Bank statement (6 months)", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
      ];
    }

    let doc = lead.workflowDocuments.find(
      (d) => (docId && d.id === docId) || (docName && d.name.toLowerCase() === docName.toLowerCase())
    );

    const nowIso = new Date().toISOString();
    let prevStatus = "Not Received";

    if (!doc) {
      // Create new doc if not found
      doc = {
        id: docId || `doc_${Date.now()}`,
        name: docName || "Requested Document",
        required: true,
        collectionStatus: collectionStatus || "Not Received",
        verificationStatus: verificationStatus || "Pending",
        comments: comments || "",
        updatedAt: nowIso,
        updatedBy: authorName || "Sales Team",
      };
      lead.workflowDocuments.push(doc);
    } else {
      prevStatus = doc.collectionStatus;
      if (collectionStatus) {
        doc.collectionStatus = collectionStatus;
      }
      if (verificationStatus) {
        doc.verificationStatus = verificationStatus;
      }
      if (comments !== undefined) {
        doc.comments = comments;
      }
      doc.updatedAt = nowIso;
      doc.updatedBy = authorName || "Sales Team";
    }

    // Check if all required documents are now received
    const allCollected = lead.workflowDocuments.every(
      (d) => !d.required || d.collectionStatus === "Received"
    );

    if (allCollected && (lead.stage === "New Lead" || lead.stage === "Contacted" || lead.stage === "Qualified")) {
      lead.stage = "Docs Collected";
    }

    // Append activity audit
    const newStatus = collectionStatus || doc.collectionStatus;
    lead.activities.unshift({
      id: `act_${Date.now()}`,
      type: "document_update",
      description: `Document "${doc.name}" updated from "${prevStatus}" to "${newStatus}".`,
      previousValue: prevStatus,
      newValue: newStatus,
      comment: comments || undefined,
      updatedBy: authorName || "Sales Team",
      timestamp: nowIso,
    });

    await lead.save();

    const formatted = lead.toObject();
    formatted.id = formatted.leadId || String(formatted._id);

    res.json({
      success: true,
      message: `Document "${doc.name}" collection status updated to "${newStatus}"`,
      document: doc,
      workflowDocuments: formatted.workflowDocuments,
      lead: formatted,
    });
  } catch (error) {
    console.error("[updateLeadDocument] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update document status" });
  }
}

// 10. Add Custom Document Requirement to a Lead
export async function addLeadDocument(req, res) {
  try {
    const { id } = req.params;
    const { name, required, authorName } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Document name is required." });
    }

    const lead = await Lead.findOne({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    const docId = `doc_${Date.now()}`;
    const newDoc = {
      id: docId,
      name: name.trim(),
      required: required !== false,
      collectionStatus: "Not Received",
      verificationStatus: "Pending",
      comments: "",
      updatedAt: new Date().toISOString(),
      updatedBy: authorName || "Sales Team",
    };

    lead.workflowDocuments.push(newDoc);

    lead.activities.unshift({
      id: `act_${Date.now()}`,
      type: "document_added",
      description: `Added custom document requirement "${newDoc.name}".`,
      updatedBy: authorName || "Sales Team",
      timestamp: new Date().toISOString(),
    });

    await lead.save();

    const formatted = lead.toObject();
    formatted.id = formatted.leadId || String(formatted._id);

    res.status(201).json({
      success: true,
      message: "Custom document requirement added successfully",
      document: newDoc,
      workflowDocuments: formatted.workflowDocuments,
      lead: formatted,
    });
  } catch (error) {
    console.error("[addLeadDocument] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to add document requirement" });
  }
}

// 11. Get All Documents for a Lead
export async function getLeadDocuments(req, res) {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    res.json({
      success: true,
      count: (lead.workflowDocuments || []).length,
      workflowDocuments: lead.workflowDocuments || [],
    });
  } catch (error) {
    console.error("[getLeadDocuments] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch documents" });
  }
}

/* =========================================================================
   FIRST CONTACT & STUDENT INTEREST CONTROLLERS (STAGE 3)
   ========================================================================= */

// 12. Update First Contact & Interest Status
export async function updateLeadContact(req, res) {
  try {
    const { id } = req.params;
    const { contactStatus, interestStatus, notInterestedReason, comment, authorName } = req.body;

    const lead = await Lead.findOne({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    const prevInterest = lead.interestStatus || "Not Contacted";
    const nowIso = new Date().toISOString();

    if (contactStatus) {
      lead.contactStatus = contactStatus;
    }
    if (interestStatus) {
      lead.interestStatus = interestStatus;
    }

    if (interestStatus === "Interested") {
      lead.notInterestedReason = "";
      if (lead.stage === "New Lead" || lead.stage === "Contacted") {
        lead.stage = "Qualified";
      }
    } else if (interestStatus === "Not Interested") {
      lead.notInterestedReason = notInterestedReason || "Personal reasons";
      lead.stage = "Rejected";
    } else if (interestStatus === "Follow-up Required") {
      if (lead.stage === "New Lead") {
        lead.stage = "Contacted";
      }
    }

    const newActivity = {
      id: `act_${Date.now()}`,
      type: "first_contact",
      description: `First contact updated to "${lead.contactStatus}" and Interest set to "${lead.interestStatus}".`,
      previousValue: prevInterest,
      newValue: lead.interestStatus,
      comment: comment || (interestStatus === "Not Interested" ? `Reason: ${lead.notInterestedReason}` : undefined),
      updatedBy: authorName || "Sales Team",
      timestamp: nowIso,
    };

    lead.activities.unshift(newActivity);
    await lead.save();

    const formatted = lead.toObject();
    formatted.id = formatted.leadId || String(formatted._id);

    res.json({
      success: true,
      message: "Contact and interest status updated successfully",
      lead: formatted,
    });
  } catch (error) {
    console.error("[updateLeadContact] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update contact/interest status" });
  }
}

// 13. Reactivate Lead
export async function reactivateLeadBackend(req, res) {
  try {
    const { id } = req.params;
    const { newInterestStatus, comment, authorName } = req.body;

    const lead = await Lead.findOne({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    const targetInterest = newInterestStatus || "Interested";
    lead.interestStatus = targetInterest;
    lead.notInterestedReason = "";
    lead.stage = targetInterest === "Interested" ? "Qualified" : "Contacted";

    const nowIso = new Date().toISOString();
    lead.activities.unshift({
      id: `act_${Date.now()}`,
      type: "reactivation",
      description: `Lead reactivated! Interest status set to "${targetInterest}".`,
      previousValue: "Not Interested",
      newValue: targetInterest,
      comment: comment || "Student changed mind / reopened loan enquiry.",
      updatedBy: authorName || "Sales Team",
      timestamp: nowIso,
    });

    await lead.save();

    const formatted = lead.toObject();
    formatted.id = formatted.leadId || String(formatted._id);

    res.json({
      success: true,
      message: "Lead reactivated successfully",
      lead: formatted,
    });
  } catch (error) {
    console.error("[reactivateLeadBackend] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to reactivate lead" });
  }
}

/* =========================================================================
   HANDOVER & LENDER MANAGEMENT CONTROLLERS (STAGE 4 & STAGE 5)
   ========================================================================= */

// 14. Handover to Processing
export async function handoverLead(req, res) {
  try {
    const { id } = req.params;
    const { handoverRemarks, processingOwner, authorName, force } = req.body;

    const lead = await Lead.findOne({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    // Check if required documents are collected unless force is enabled
    const pendingRequiredDocs = (lead.workflowDocuments || []).filter(
      (d) => d.required && d.collectionStatus !== "Received"
    );

    if (pendingRequiredDocs.length > 0 && !force) {
      return res.status(400).json({
        success: false,
        error: `Cannot handover. Pending required documents: ${pendingRequiredDocs.map((d) => d.name).join(", ")}`,
        pendingDocs: pendingRequiredDocs,
      });
    }

    const nowIso = new Date().toISOString();
    const owner = processingOwner || "Nikhil V (Lead Processing)";
    const remarks = handoverRemarks || "All required documents collected and verified by Sales.";

    lead.handover = {
      isHandedOver: true,
      handedOverAt: nowIso,
      handedOverBy: authorName || "Sales Team",
      handoverRemarks: remarks,
      processingOwner: owner,
    };

    lead.stage = "Sent to Lender";

    lead.activities.unshift({
      id: `act_${Date.now()}`,
      type: "handover",
      description: `File officially handed over to Processing Team (${owner}).`,
      comment: remarks,
      updatedBy: authorName || "Sales Team",
      timestamp: nowIso,
    });

    await lead.save();

    const formatted = lead.toObject();
    formatted.id = formatted.leadId || String(formatted._id);

    res.json({
      success: true,
      message: "Lead file successfully handed over to Processing Team",
      handover: lead.handover,
      lead: formatted,
    });
  } catch (error) {
    console.error("[handoverLead] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to handover lead" });
  }
}

// 15. Update Lender or Mark Lender Rejected
export async function updateLeadLender(req, res) {
  try {
    const { id } = req.params;
    const { lender, lenderRejectionReason, reason, authorName } = req.body;

    const lead = await Lead.findOne({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    const nowIso = new Date().toISOString();

    if (lenderRejectionReason) {
      // Marked as rejected by lender
      const prevLender = lead.lender || "Lender";
      lead.stage = "Rejected";
      lead.lenderRejectionReason = lenderRejectionReason;

      lead.activities.unshift({
        id: `act_${Date.now()}`,
        type: "not_interested",
        description: `Loan rejected by ${prevLender}.`,
        comment: `Rejection Reason: ${lenderRejectionReason}`,
        updatedBy: authorName || "Sales / Processing Team",
        timestamp: nowIso,
      });
    } else if (lender) {
      // Changing / re-assigning lender
      const prevLender = lead.lender || "Not assigned";
      lead.lender = lender;
      lead.lenderRejectionReason = "";

      if (lead.stage === "Rejected") {
        lead.stage = "Sent to Lender";
      }

      lead.activities.unshift({
        id: `act_${Date.now()}`,
        type: "system",
        description: `Lender changed from "${prevLender}" to "${lender}". File re-routed.`,
        comment: reason || "Re-applied with new lender partner.",
        updatedBy: authorName || "Processing Team",
        timestamp: nowIso,
      });
    }

    await lead.save();

    const formatted = lead.toObject();
    formatted.id = formatted.leadId || String(formatted._id);

    res.json({
      success: true,
      message: lenderRejectionReason ? "Lender rejection recorded" : "Lender updated successfully",
      lead: formatted,
    });
  } catch (error) {
    console.error("[updateLeadLender] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update lender" });
  }
}

// 16. Add General Interaction Note / Comment
export async function addLeadComment(req, res) {
  try {
    const { id } = req.params;
    const { comment, authorName } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, error: "Comment text is required." });
    }

    const lead = await Lead.findOne({
      $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    const nowIso = new Date().toISOString();
    const newActivity = {
      id: `act_${Date.now()}`,
      type: "comment",
      description: "Added interaction remark / note.",
      comment: comment.trim(),
      updatedBy: authorName || "Sales Team",
      timestamp: nowIso,
    };

    lead.activities.unshift(newActivity);
    await lead.save();

    const formatted = lead.toObject();
    formatted.id = formatted.leadId || String(formatted._id);

    res.json({
      success: true,
      message: "Comment added to lead timeline",
      activity: newActivity,
      lead: formatted,
    });
  } catch (error) {
    console.error("[addLeadComment] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to add comment" });
  }
}





