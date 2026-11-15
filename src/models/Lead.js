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
      required: [true, "Student name is required"],
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
    source: {
      type: String,
      default: "Website inquiry form",
    },
    country: {
      type: String,
      default: "USA",
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
      enum: ["Secured", "Unsecured"],
      default: "Unsecured",
    },
    amount: {
      type: Number,
      default: 3500000,
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
    lenderRejectionReason: {
      type: String,
      default: "",
    },
    owner: {
      type: String,
      default: "Praveen K",
    },
    coApplicant: {
      name: { type: String, default: "Co-Applicant" },
      relation: { type: String, default: "Parent" },
      employment: { type: String, default: "Salaried" },
      organisation: { type: String, default: "Private Company" },
      monthlyIncome: { type: Number, default: 80000 },
      obligations: { type: Number, default: 10000 },
      city: { type: String, default: "Hyderabad" },
      contact: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    academics: {
      tenth: { type: String, default: "85%" },
      twelfth: { type: String, default: "85%" },
      graduation: { type: String, default: "B.Tech - 8.0 CGPA" },
      tests: { type: String, default: "IELTS 7.0" },
      experience: { type: String, default: "Fresher" },
    },
    collateral: {
      hasCollateral: { type: String, default: "No" },
      type: { type: String, default: "" },
      location: { type: String, default: "" },
      marketValue: { type: Number, default: 0 },
      owner: { type: String, default: "" },
    },
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

