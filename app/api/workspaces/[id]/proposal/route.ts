import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import {
  createActivityEntry,
  getWorkspace,
  updateWorkspaceProposalState,
} from "@/lib/store";
import type { WorkspaceProposalState } from "@/lib/types";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const { id } = await params;
    const workspace = await getWorkspace(id, user.id);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const body = (await request.json()) as {
      proposalState?: WorkspaceProposalState;
    };

    if (!body.proposalState) {
      return NextResponse.json(
        { error: "Proposal state is required." },
        { status: 400 },
      );
    }

    const activityEntries = [
      createActivityEntry(
        "proposal_saved",
        "Proposal draft saved",
        "Section content or ordering was saved.",
      ),
      ...body.proposalState.sections.flatMap((section) => {
        const previous = workspace.proposalState.sections.find((item) => item.id === section.id);
        const entries = [];

        if (previous) {
          if (previous.assigneeName !== section.assigneeName) {
            entries.push(
              createActivityEntry(
                "proposal_assignment_updated",
                `Ownership updated for ${section.title}`,
                section.assigneeName.trim()
                  ? `Assigned to ${section.assigneeName.trim()}.`
                  : "Section owner was cleared.",
              ),
            );
          }

          if (
            previous.followUpRequired !== section.followUpRequired ||
            previous.followUpNote !== section.followUpNote
          ) {
            entries.push(
              createActivityEntry(
                "proposal_follow_up_updated",
                `Follow-up updated for ${section.title}`,
                section.followUpRequired
                  ? section.followUpNote.trim() || "Follow-up is required."
                  : "Follow-up requirement was cleared.",
              ),
            );
          }

          if (previous.followUpDueDate !== section.followUpDueDate) {
            entries.push(
              createActivityEntry(
                "proposal_follow_up_due_date_updated",
                `Due date updated for ${section.title}`,
                section.followUpDueDate
                  ? `Follow-up due ${section.followUpDueDate}.`
                  : "Follow-up due date was cleared.",
              ),
            );
          }

          const newComments = section.comments.filter(
            (comment) => !previous.comments.some((existing) => existing.id === comment.id),
          );

          entries.push(
            ...newComments.map((comment) =>
              createActivityEntry(
                "proposal_comment_added",
                `Comment added to ${section.title}`,
                `${comment.author || "Reviewer"} added a section comment.`,
              ),
            ),
          );
        }

        if (!previous || previous.status === section.status) return entries;

        if (section.status === "approved") {
          return [
            ...entries,
            createActivityEntry(
              "proposal_section_approved",
              `${section.title} approved`,
              section.reviewerName.trim()
                ? `Approved by ${section.reviewerName.trim()}.`
                : "Section marked as approved.",
            ),
          ];
        }

        return [
          ...entries,
          createActivityEntry(
            "proposal_section_status_changed",
            `${section.title} moved to ${section.status.replace("_", " ")}`,
            "Proposal review status changed.",
          ),
        ];
      }),
    ];

    const updated = await updateWorkspaceProposalState(
      id,
      body.proposalState,
      activityEntries,
      user.id,
    );
    return NextResponse.json({ workspace: updated });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save proposal state.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const { id } = await params;
    const workspace = await getWorkspace(id, user.id);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const body = (await request.json()) as
      | { action: "create_snapshot"; name?: string }
      | { action: "restore_snapshot"; snapshotId?: string };

    if (body.action === "create_snapshot") {
      const snapshotName =
        body.name?.trim() ||
        `Snapshot ${new Intl.DateTimeFormat("en", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date())}`;

      const nextState: WorkspaceProposalState = {
        ...workspace.proposalState,
        snapshots: [
          {
            id: crypto.randomUUID(),
            name: snapshotName,
            createdAt: new Date().toISOString(),
            sections: workspace.proposalState.sections,
          },
          ...workspace.proposalState.snapshots,
        ],
      };

      const updated = await updateWorkspaceProposalState(id, nextState, [
        createActivityEntry(
          "proposal_snapshot_created",
          "Proposal snapshot created",
          `${snapshotName} was saved.`,
        ),
      ], user.id);
      return NextResponse.json({ workspace: updated });
    }

    if (body.action === "restore_snapshot") {
      const snapshot = workspace.proposalState.snapshots.find(
        (item) => item.id === body.snapshotId,
      );

      if (!snapshot) {
        return NextResponse.json({ error: "Snapshot not found." }, { status: 404 });
      }

      const nextState: WorkspaceProposalState = {
        ...workspace.proposalState,
        sections: snapshot.sections,
      };

      const updated = await updateWorkspaceProposalState(id, nextState, [
        createActivityEntry(
          "proposal_snapshot_restored",
          "Proposal snapshot restored",
          `${snapshot.name} was restored into the active draft.`,
        ),
      ], user.id);
      return NextResponse.json({ workspace: updated });
    }

    return NextResponse.json({ error: "Invalid proposal action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update proposal state.",
      },
      { status: 500 },
    );
  }
}
