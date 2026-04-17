export type Complexity = "low" | "medium" | "high";
export type Priority = "high" | "medium" | "low";
export type RequirementStatus = "covered" | "partially_covered" | "missing";
export type Severity = "high" | "medium" | "low";

export type KnowledgeAsset = {
  id: string;
  title: string;
  category: string;
  content: string;
  excerpt: string;
  organizationId?: string | null;
  organizationName?: string | null;
  fileSize?: number | null;
  sourceFilename?: string | null;
  sourceMimeType?: string | null;
  sourceKind?: "manual" | "upload" | null;
  storageProvider?: "local" | "vercel_blob" | null;
  storagePath?: string | null;
  storageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProposalAnalysis = {
  overview: {
    documentType: string;
    submissionDeadline: string | null;
    estimatedComplexity: Complexity;
    summary: string;
  };
  requirements: Array<{
    id: string;
    title: string;
    description: string;
    priority: Priority;
    status: RequirementStatus;
    needsSME: boolean;
    sourceRefs: string[];
  }>;
  risks: Array<{
    title: string;
    severity: Severity;
    description: string;
    recommendation: string;
    sourceRefs?: string[];
  }>;
  draft: {
    executiveSummary: string;
    responseStrategy: string;
    keyDifferentiators: string[];
    openQuestions: string[];
    sourceRefs?: string[];
  };
  sources: Array<{
    id: string;
    label: string;
    excerpt: string;
    content?: string;
    sourceType?: "document" | "knowledge_asset" | "company_knowledge";
    documentId?: string;
    documentLabel?: string;
    assetId?: string;
    assetTitle?: string;
  }>;
};

export type WorkspaceInput = {
  visibility?: "private" | "organization" | "selected";
  workspaceName: string;
  clientName: string;
  documents: Array<{
    id: string;
    filename: string;
    mimeType: string;
    kind: "upload" | "pasted";
    content: string;
    excerpt: string;
    characterCount: number;
    fileSize?: number | null;
    storageProvider?: "local" | "vercel_blob" | null;
    storagePath?: string | null;
    storageUrl?: string | null;
  }>;
  companyKnowledge: string;
  instructions?: string;
  knowledgeAssets?: KnowledgeAsset[];
};

export type BillingPlan = "free" | "pro" | "team";

export type BillingStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired";

export type UserBillingSummary = {
  plan: BillingPlan;
  status: BillingStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodEnd: string | null;
};

export type TeamRole = "owner" | "admin" | "member";

export type TeamMember = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "active";
  joinedAt: string;
};

export type TeamInvite = {
  inviteId: string;
  email: string;
  role: TeamRole;
  status: "pending";
  invitedByName: string;
  invitedAt: string;
};

export type OrganizationTeam = {
  organizationId: string;
  organizationName: string;
  currentUserRole: TeamRole;
  betaOpsNotes?: string | null;
  betaOpsTimeline?: Array<{
    id: string;
    body: string;
    createdAt: string;
    authorName: string;
  }>;
  members: TeamMember[];
  pendingInvites: TeamInvite[];
};

export type PublicLead = {
  id: string;
  type: "waitlist" | "contact_sales";
  status: "new" | "contacted" | "qualified" | "closed";
  name: string;
  email: string;
  company: string;
  teamSize: string | null;
  plan: string | null;
  source: string | null;
  message: string | null;
  internalNotes: string | null;
  assignedUserId: string | null;
  assignedUserName: string | null;
  nextFollowUpAt: string | null;
  activityLog: Array<{
    id: string;
    type:
      | "lead_created"
      | "lead_status_updated"
      | "lead_owner_updated"
      | "lead_follow_up_updated";
    title: string;
    detail: string;
    createdAt: string;
    actorName: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type RequirementReviewDecision = "pending" | "accepted" | "rejected";

export type RequirementReview = {
  requirementId: string;
  decision: RequirementReviewDecision;
  note: string;
  draftAnswer: string;
  updatedAt: string | null;
};

export type WorkspaceReviewState = {
  requirements: RequirementReview[];
  executiveSummary: string;
  responseStrategy: string;
};

export type WorkspaceActivityEntry = {
  id: string;
  type:
    | "workspace_created"
    | "analysis_completed"
    | "analysis_rerun"
    | "review_saved"
    | "proposal_saved"
    | "proposal_snapshot_created"
    | "proposal_snapshot_restored"
    | "proposal_section_approved"
    | "proposal_section_status_changed"
    | "proposal_comment_added"
    | "proposal_assignment_updated"
    | "proposal_follow_up_updated"
    | "proposal_follow_up_due_date_updated"
    | "proposal_exported"
    | "print_view_opened";
  title: string;
  detail: string;
  createdAt: string;
};

export type ProposalSectionComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type ProposalSection = {
  id: string;
  title: string;
  content: string;
  sourceRequirementIds: string[];
  sourceRefs: string[];
  status: "draft" | "in_review" | "approved";
  reviewerName: string;
  signedOffAt: string | null;
  comments: ProposalSectionComment[];
  assigneeName: string;
  followUpRequired: boolean;
  followUpNote: string;
  followUpDueDate: string | null;
};

export type ProposalRewriteMode =
  | "tighten"
  | "executive"
  | "compliance";

export type ProposalGenerateMode = "first_draft";

export type ProposalSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  sections: ProposalSection[];
};

export type WorkspaceProposalState = {
  sections: ProposalSection[];
  snapshots: ProposalSnapshot[];
};

export type Workspace = WorkspaceInput & {
  id: string;
  ownerId?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  visibility?: "private" | "organization" | "selected";
  sharedWithUsers?: Array<{
    userId: string;
    name: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
  analysis: ProposalAnalysis;
  reviewState: WorkspaceReviewState;
  proposalState: WorkspaceProposalState;
  activityLog: WorkspaceActivityEntry[];
};
