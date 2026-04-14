"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, FileUp, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCEPTED_UPLOAD_TEXT } from "@/lib/document-constants";
import type { KnowledgeAsset } from "@/lib/types";

const sampleBrief = `Client seeks a partner to design and launch a customer portal within 12 weeks. Response must include implementation approach, data security model, migration plan, support coverage, accessibility standards, and three relevant case studies. Deadline: May 17, 2026.`;

const sampleKnowledge = `We are a B2B product studio specializing in secure customer portals, workflow automation, and systems integration. We have delivered SOC 2 aligned portals for SaaS and professional services clients. Our standard team includes product strategy, UX, engineering, QA, and delivery leadership. We offer post-launch support during business hours with optional extended coverage.`;

export function WorkspaceForm({ knowledgeAssets }: { knowledgeAssets: KnowledgeAsset[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [values, setValues] = useState({
    workspaceName: "",
    clientName: "",
    pastedBrief: "",
    companyKnowledge: "",
    instructions: "",
  });
  const [selectedKnowledgeAssetIds, setSelectedKnowledgeAssetIds] = useState<string[]>([]);

  const fileLabel = useMemo(() => {
    if (!files?.length) return "Drop files here or browse";
    return Array.from(files)
      .map((file) => file.name)
      .join(", ");
  }, [files]);

  const selectedFiles = useMemo(() => Array.from(files ?? []), [files]);

  function fillSample() {
    setValues({
      workspaceName: "Customer Portal RFP",
      clientName: "Northstar Services",
      pastedBrief: sampleBrief,
      companyKnowledge: sampleKnowledge,
      instructions:
        "Use a confident but practical tone. Flag anything that needs legal or security review.",
    });
    setSelectedKnowledgeAssetIds(knowledgeAssets.slice(0, 2).map((asset) => asset.id));
  }

  function toggleKnowledgeAsset(id: string) {
    setSelectedKnowledgeAssetIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    selectedKnowledgeAssetIds.forEach((id) => formData.append("knowledgeAssetIds", id));

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        body: formData,
      });
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : { error: await response.text() };

      if (!response.ok) {
        throw new Error(payload.error || "Analysis failed.");
      }

      router.push(`/app/workspaces/${payload.workspace.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspace details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Workspace name
            <input
              name="workspaceName"
              required
              value={values.workspaceName}
              onChange={(event) =>
                setValues({ ...values, workspaceName: event.target.value })
              }
              className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Enterprise CRM RFP"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Client/company name
            <input
              name="clientName"
              required
              value={values.clientName}
              onChange={(event) =>
                setValues({ ...values, clientName: event.target.value })
              }
              className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Acme Corp"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RFP or brief material</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <label className="grid min-h-36 cursor-pointer place-items-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center hover:border-emerald-400">
            <FileUp className="mb-3 size-8 text-emerald-600" />
            <span className="max-w-xl text-sm font-semibold text-zinc-800">
              {fileLabel}
            </span>
            <span className="mt-1 text-xs text-zinc-500">
              Supports PDF, DOCX, TXT, MD, and RTF.
            </span>
            <input
              name="documents"
              type="file"
              multiple
              accept={ACCEPTED_UPLOAD_TEXT}
              className="sr-only"
              onChange={(event) => setFiles(event.target.files)}
            />
          </label>

          {selectedFiles.length ? (
            <div className="grid gap-2">
              {selectedFiles.map((file) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="size-4 shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Badge tone="teal">ready</Badge>
                </div>
              ))}
            </div>
          ) : null}

          <label className="grid gap-2 text-sm font-semibold">
            Or paste RFP/brief text
            <textarea
              name="pastedBrief"
              value={values.pastedBrief}
              onChange={(event) =>
                setValues({ ...values, pastedBrief: event.target.value })
              }
              rows={6}
              className="rounded-lg border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Paste the client request, RFP section, or brief..."
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved company knowledge</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold">Attach knowledge base assets</label>
              <Link
                href="/app/knowledge-base"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Manage library
              </Link>
            </div>
            {knowledgeAssets.length ? (
              <div className="grid gap-2">
                {knowledgeAssets.map((asset) => {
                  const selected = selectedKnowledgeAssetIds.includes(asset.id);

                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => toggleKnowledgeAsset(asset.id)}
                      className={`rounded-lg border px-4 py-3 text-left transition ${
                        selected
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{asset.title}</p>
                          <p className="mt-1 text-xs text-zinc-500">{asset.category}</p>
                        </div>
                        <Badge tone={selected ? "green" : "zinc"}>
                          {selected ? "attached" : "optional"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600">{asset.excerpt}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
                No reusable assets yet. Add some in the Knowledge Base and attach them here.
              </div>
            )}
          </div>

          <label className="grid gap-2 text-sm font-semibold">
            Background material
            <textarea
              name="companyKnowledge"
              required
              value={values.companyKnowledge}
              onChange={(event) =>
                setValues({ ...values, companyKnowledge: event.target.value })
              }
              rows={7}
              className="rounded-lg border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Paste extra approved capabilities, deal-specific notes, or knowledge not yet in the library..."
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Special instructions / tone
            <textarea
              name="instructions"
              value={values.instructions}
              onChange={(event) =>
                setValues({ ...values, instructions: event.target.value })
              }
              rows={4}
              className="rounded-lg border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Optional: tone, deal context, things to avoid..."
            />
          </label>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="secondary" onClick={fillSample}>
          <Wand2 className="size-4" />
          Add sample demo data
        </Button>
        <Button type="submit" variant="accent" disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
          {isLoading ? "Analyzing..." : "Analyze"}
        </Button>
      </div>
    </form>
  );
}
