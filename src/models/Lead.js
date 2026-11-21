import mongoose from "mongoose";

const workflowDocumentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    required: { type: Boolean, default: true },
    collectionStatus: {
      type: String,
      enum: ["Not Received", "Partially Received", "Received"],
      default: "Not Received",
    },
    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    comments: { type: String, default: "" },
    updatedAt: { type: String },
    updatedBy: { type: String },
  },
  { _id: false }
);

const followUpSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    scheduledAt: { type: String, required: true },
    reminderNote: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Upcoming", "Overdue", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    createdBy: { type: String, default: "Sales Team" },
    createdAt: { type: String },
    completedAt: { type: String },
    completionNote: { type: String },
    rescheduledAt: { type: String },
    rescheduleReason: { type: String },
    cancelledAt: { type: String },
    cancellationReason: { type: String },
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, default: "system" },
    description: { type: String, required: true },
    comment: { type: String },
    previousValue: { type: String },
    newValue: { type: String },
    updatedBy: { type: String, default: "System" },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    name: { type: String, default: "" },
    type: { type: String, default: "" },
    category: { type: String, default: "" },
    fileName: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Uploaded"],
      default: "Pending",
    },
    collectionStatus: {
      type: String,
      enum: ["Not Received", "Partially Received", "Received"],
      default: "Not Received",
    },
  },
  { _id: false }
);

const lenderSubmissionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    lender: { type: String, required: true },
    applicationNo: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Submitted", "In Underwriting", "Approved", "Sanctioned", "Disbursed", "Rejected"],
      default: "Submitted",
    },
    submittedAt: { type: String, default: () => new Date().toISOString() },
    submittedBy: { type: String, default: "Processing Team" },
    decisionAt: { type: String },
    rejectionReason: { type: String, default: "" },
    sanctionAmount: { type: Number },
    roi: { type: Number },
    tenure: { type: Number },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    student: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    alternativePhone: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      default: "Walk in",
    },
    sourceName: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    planningCountry: {
      type: String,
      trim: true,
      default: "",
    },
    studyCountry: {
      type: String,
      trim: true,
      default: "",
    },
    university: {
      type: String,
      default: "University Partner",
    },
    course: {
      type: String,
      default: "MS Computer Science",
    },
    intake: {
      type: String,
      default: "Fall 2026",
    },
    loanType: {
      type: String,
      enum: ["", "Secured", "Unsecured"],
      default: "",
    },
    amount: {
      type: Number,
      default: 0,
    },
    loanRequirement: {
      type: String,
      trim: true,
      default: "",
    },
    stage: {
      type: String,
      default: "New Lead",
    },
    contactStatus: {
      type: String,
      default: "Not Contacted",
    },
    interestStatus: {
      type: String,
      default: "Not Contacted",
    },
    notInterestedReason: {
      type: String,
      default: "",
    },
    lender: {
      type: String,
      default: "Not assigned",
    },
    lenderStatus: {
      type: String,
      enum: ["Not Assigned", "Submitted", "In Underwriting", "Approved", "Sanctioned", "Disbursed", "Rejected"],
      default: "Not Assigned",
    },
    lenderApplicationNo: {
      type: String,
      default: "",
    },
    lenderSubmittedAt: {
      type: String,
      default: "",
    },
    lenderSubmittedBy: {
      type: String,
      default: "",
    },
    lenderLocked: {
      type: Boolean,
      default: false,
    },
    lenderRejectionReason: {
      type: String,
      default: "",
    },
    roi: {
      type: Number,
    },
    tenure: {
      type: Number,
    },
    sanctioned: {
      type: Number,
    },
    disbursed: {
      type: Number,
    },
    lenderSubmissions: {
      type: [lenderSubmissionSchema],
      default: [],
    },
    owner: {
      type: String,
      default: "Praveen K",
    },
    coApplicant: {
      name: { type: String, default: "Co-Applicant" },
      relation: { type: String, default: "Parent" },
      phone: { type: String, default: "" },
      alternativePhone: { type: String, default: "" },
      email: { type: String, default: "" },
      employment: { type: String, default: "Salaried" },
      organisation: { type: String, default: "Private Company" },
      workplace: { type: String, default: "" },
      vintage: { type: String, default: "" },
      monthlyIncome: { type: Number, default: 80000 },
      annualIncome: { type: Number, default: 0 },
      obligations: { type: Number, default: 10000 },
      city: { type: String, default: "Hyderabad" },
      contact: { type: String, default: "" },
      currentAddress: { type: String, default: "" },
      permanentAddress: { type: String, default: "" },
    },
    academics: {
      tenth: { type: String, default: "85%" },
      twelfth: { type: String, default: "85%" },
      graduation: { type: String, default: "B.Tech - 8.0 CGPA" },
      tests: { type: String, default: "IELTS 7.0" },
      greScore: { type: String, default: "" },
      gmatScore: { type: String, default: "" },
      satScore: { type: String, default: "" },
      ieltsScore: { type: String, default: "" },
      toeflScore: { type: String, default: "" },
      duolingoScore: { type: String, default: "" },
      experience: { type: String, default: "Fresher" },
    },
    guarantor: {
      hasGuarantor: { type: String, enum: ["Yes", "No"], default: "No" },
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      contact: { type: String, default: "" },
      alternativePhone: { type: String, default: "" },
      email: { type: String, default: "" },
      relation: { type: String, default: "" },
      employment: { type: String, default: "" },
      organisation: { type: String, default: "" },
      workplace: { type: String, default: "" },
      vintage: { type: String, default: "" },
      monthlyIncome: { type: Number, default: 0 },
      annualIncome: { type: Number, default: 0 },
      obligations: { type: Number, default: 0 },
      address: { type: String, default: "" },
      currentAddress: { type: String, default: "" },
      permanentAddress: { type: String, default: "" },
    },
    collateral: {
      hasCollateral: { type: String, default: "No" },
      type: { type: String, default: "" },
      location: { type: String, default: "" },
      marketValue: { type: Number, default: 0 },
      owner: { type: String, default: "" },
    },
    studentDocuments: {
      type: [documentSchema],
      default: [],
    },
    parentDocuments: {
      type: [documentSchema],
      default: [],
    },
    propertyDocuments: {
      type: [documentSchema],
      default: [],
    },
    studentDocumentsStatus: {
      type: String,
      enum: ["Not Received", "Partially Received", "Received"],
      default: "Not Received",
    },
    parentDocumentsStatus: {
      type: String,
      enum: ["Not Received", "Partially Received", "Received"],
      default: "Not Received",
    },
    propertyDocumentsStatus: {
      type: String,
      enum: ["Not Received", "Partially Received", "Received"],
      default: "Not Received",
    },
    documentStatusesUpdatedAt: { type: String, default: "" },
    documentStatusesUpdatedBy: { type: String, default: "" },
    workflowDocuments: {
      type: [workflowDocumentSchema],
      default: [
        { id: "doc_1", name: "Aadhaar & PAN", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_2", name: "Admission letter", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_3", name: "Academic marksheets", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_4", name: "Co-applicant salary slips / ITR", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_5", name: "Bank statement (6 months)", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
      ],
    },
    followUps: {
      type: [followUpSchema],
      default: [],
    },
    activities: {
      type: [activitySchema],
      default: [],
    },
    handover: {
      isHandedOver: { type: Boolean, default: false },
      handedOverAt: { type: String },
      handedOverBy: { type: String },
      handoverRemarks: { type: String },
      processingOwner: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const Lead = mongoose.model("Lead", leadSchema);
