"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingPlan, KnowledgeAsset } from "@/lib/types";
import { ACCEPTED_UPLOAD_TEXT } from "@/lib/document-constants";
import { formatDate, truncate } from "@/lib/utils";

type FormValues = {
  title: string;
  category: string;
  content: string;
  approvalStatus: NonNullable<KnowledgeAsset["approvalStatus"]>;
  lastReviewedAt: string;
  intendedUseCase: string;
  proofNote: string;
};

const emptyValues: FormValues = {
  title: "",
  category: "",
  content: "",
  approvalStatus: "approved",
  lastReviewedAt: "",
  intendedUseCase: "",
  proofNote: "",
};

function toDateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function knowledgeStatusTone(status: KnowledgeAsset["approvalStatus"]) {
  if (status === "approved") return "green";
  if (status === "needs_review") return "yellow";
  return "zinc";
}

function isStale(lastReviewedAt: string | null | undefined) {
  if (!lastReviewedAt) return true;
  const reviewed = new Date(lastReviewedAt).getTime();
  if (Number.isNaN(reviewed)) return true;
  return Date.now() - reviewed > 180 * 24 * 60 * 60 * 1000;
}

export function KnowledgeBaseManager({
  initialAssets,
  canManage,
  effectivePlan,
}: {
  initialAssets: KnowledgeAsset[];
  canManage: boolean;
  effectivePlan: BillingPlan;
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  function startCreate() {
    if (!canManage) return;
    setEditingId("new");
    setValues(emptyValues);
    setFile(null);
    setError("");
  }

  function startEdit(asset: KnowledgeAsset) {
    if (!canManage) return;
    setEditingId(asset.id);
    setValues({
      title: asset.title,
      category: asset.category,
      content: asset.content,
      approvalStatus: asset.approvalStatus ?? "approved",
      lastReviewedAt: toDateInputValue(asset.lastReviewedAt),
      intendedUseCase: asset.intendedUseCase ?? "",
      proofNote: asset.proofNote ?? "",
    });
    setFile(null);
    setError("");
  }

  const selectedFileLabel = useMemo(() => {
    if (!file) return "Upload a document to create a file-backed asset";
    return `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  }, [file]);

  async function save() {
    if (!canManage) return;
    setError("");
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("category", values.category);
      formData.append("content", values.content);
      formData.append("approvalStatus", values.approvalStatus);
      formData.append("lastReviewedAt", values.lastReviewedAt);
      formData.append("intendedUseCase", values.intendedUseCase);
      formData.append("proofNote", values.proofNote);
      if (file) formData.append("file", file);

      const response = await fetch(
        editingId === "new" ? "/api/knowledge-assets" : `/api/knowledge-assets/${editingId}`,
        {
          method: editingId === "new" ? "POST" : "PATCH",
          body: formData,
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Save failed.");
      }

      if (editingId === "new") {
        setAssets((current) => [payload.asset, ...current]);
      } else {
        setAssets((current) =>
          current.map((asset) => (asset.id === editingId ? payload.asset : asset)),
        );
      }

      setEditingId(null);
      setValues(emptyValues);
      setFile(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(id: string) {
    if (!canManage) return;
    const confirmed = window.confirm("Delete this knowledge asset?");
    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`/api/knowledge-assets/${id}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Delete failed.");
      }

      setAssets((current) => current.filter((asset) => asset.id !== id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Delete failed.");
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Reusable company assets</CardTitle>
            <p className="text-sm text-zinc-600">
              Save approved proof points, case studies, delivery notes, and boilerplate.
            </p>
          </div>
          <Button variant="accent" onClick={startCreate} disabled={!canManage}>
            <Plus className="size-4" />
            New asset
          </Button>
        </CardHeader>
        {!canManage ? (
          <CardContent>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-semibold text-yellow-950">
                Knowledge Base is unlocked on Pro and Team.
              </p>
              <p className="mt-2 text-sm leading-6 text-yellow-900">
                Your current plan is {effectivePlan.toUpperCase()}. Upgrade when you want a reusable
                library of approved company material that can be attached across proposal workspaces.
              </p>
              <div className="mt-4">
                <Link href="/app/settings#billing">
                  <Button size="sm" variant="secondary">
                    View plans
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        ) : null}
        {editingId ? (
          <CardContent className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Title
                <input
                  value={values.title}
                  onChange={(event) => setValues({ ...values, title: event.target.value })}
                  className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                  placeholder="SOC 2 delivery summary"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Category
                <input
                  value={values.category}
                  onChange={(event) => setValues({ ...values, category: event.target.value })}
                  className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                  placeholder="Security"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-semibold">
                Approval status
                <select
                  value={values.approvalStatus}
                  onChange={(event) =>
                    setValues({
                      ...values,
                      approvalStatus: event.target.value as NonNullable<KnowledgeAsset["approvalStatus"]>,
                    })
                  }
                  className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="approved">Approved</option>
                  <option value="needs_review">Needs review</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Last reviewed
                <input
                  type="date"
                  value={values.lastReviewedAt}
                  onChange={(event) =>
                    setValues({ ...values, lastReviewedAt: event.target.value })
                  }
                  className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Intended use case
                <input
                  value={values.intendedUseCase}
                  onChange={(event) =>
                    setValues({ ...values, intendedUseCase: event.target.value })
                  }
                  className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                  placeholder="Security answers, case proof..."
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              Content
              <textarea
                value={values.content}
                onChange={(event) => setValues({ ...values, content: event.target.value })}
                rows={8}
                className="rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-500"
                placeholder="Paste approved company information, or leave this light and upload a file below..."
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Proof note
              <textarea
                value={values.proofNote}
                onChange={(event) => setValues({ ...values, proofNote: event.target.value })}
                rows={3}
                className="rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-500"
                placeholder="Optional: where this claim came from, who approved it, or how it should be used."
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Or upload source file
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
                <div className="flex items-center gap-3">
                  <Upload className="size-4 text-emerald-600" />
                  <span className="text-sm text-zinc-700">{selectedFileLabel}</span>
                </div>
                <input
                  type="file"
                  accept={ACCEPTED_UPLOAD_TEXT}
                  className="mt-3 block text-sm"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
                <p className="mt-2 text-xs text-zinc-500">
                  PDF, DOCX, TXT, MD, and RTF are supported.
                </p>
              </div>
            </label>
            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
                {error}
              </div>
            ) : null}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save asset"}
              </Button>
            </div>
          </CardContent>
        ) : null}
      </Card>

      {error && !editingId ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{asset.title}</h3>
                    <Badge tone="teal">{asset.category}</Badge>
                    <Badge tone={knowledgeStatusTone(asset.approvalStatus)}>
                      {(asset.approvalStatus ?? "approved").replace("_", " ")}
                    </Badge>
                    <Badge tone={isStale(asset.lastReviewedAt) ? "yellow" : "green"}>
                      {isStale(asset.lastReviewedAt) ? "review needed" : "fresh"}
                    </Badge>
                    <Badge tone={asset.sourceKind === "upload" ? "yellow" : "zinc"}>
                      {asset.sourceKind === "upload" ? "file-backed" : "manual"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {asset.ownerName ? <Badge tone="zinc">Owner: {asset.ownerName}</Badge> : null}
                    {asset.intendedUseCase ? (
                      <Badge tone="teal">Use: {asset.intendedUseCase}</Badge>
                    ) : null}
                    {asset.lastReviewedAt ? (
                      <Badge tone="zinc">Reviewed {formatDate(asset.lastReviewedAt)}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {truncate(asset.content, 240)}
                  </p>
                  {asset.proofNote ? (
                    <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-600">
                      <span className="font-semibold text-zinc-900">Proof note: </span>
                      {asset.proofNote}
                    </div>
                  ) : null}
                  {asset.sourceFilename ? (
                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                      <FileText className="size-3.5" />
                      {asset.sourceFilename}
                    </div>
                  ) : null}
                  <p className="mt-3 text-xs text-zinc-500">
                    Updated {formatDate(asset.updatedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!canManage}
                    onClick={() => startEdit(asset)}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!canManage}
                    onClick={() => remove(asset.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {assets.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-sm text-zinc-600">
              {canManage
                ? "No assets yet. Start with case studies, capability statements, or delivery model notes."
                : "Knowledge Base is ready when you upgrade. Start with Pro if you want reusable approved material across proposals."}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
