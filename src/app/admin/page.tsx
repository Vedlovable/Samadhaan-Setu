"use client";
import React, { useMemo, useState, useEffect } from "react";
import issuesData from "@/data/issues.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import MapView from "@/components/map/MapView";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listIssuesWithMedia, updateIssueStatus } from "@/lib/supabase/issues";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);
  const queryClient = useQueryClient();
  const { data: sIssues, isLoading: sLoading, error: sError } = useQuery({
    queryKey: ["supabaseIssues"],
    queryFn: listIssuesWithMedia,
  });
  const cycleSupabase = (s: string) => (s === "Pending" ? "In Progress" : s === "In Progress" ? "Resolved" : "Pending");
  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateIssueStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["supabaseIssues"] }),
  });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [items, setItems] = useState(() => issuesData.map((i) => ({ ...i, assignee: "" as string })));
  const [updateOpen, setUpdateOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [progressMsg, setProgressMsg] = useState("");
  const [markers, setMarkers] = useState<{ id: number; position: [number, number]; title?: string; description?: string; status?: string; address?: string; images?: string[] }[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [currentType, setCurrentType] = useState<"issue" | "report">("issue");
  const [currentReportId, setCurrentReportId] = useState<number | null>(null);
  // details dialog for citizen reports
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewReport, setViewReport] = useState<any | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  // Supabase issue details
  const [sDetailsOpen, setSDetailsOpen] = useState(false);
  const [sViewIssue, setSViewIssue] = useState<any | null>(null);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("reports");
        const reportsLocal = raw ? JSON.parse(raw) : [];
        setReports(reportsLocal);
        const m = reportsLocal
          .filter((r: any) => typeof r.lat === "number" && typeof r.lng === "number")
          .map((r: any) => ({
            id: r.id,
            position: [r.lat, r.lng] as [number, number],
            title: r.title,
            description: r.description,
            status: r.status,
            address: r.address,
            images: Array.isArray(r.images) ? r.images : [],
          }));
        setMarkers(m);
      } catch {
        setMarkers([]);
        setReports([]);
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "reports") load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const stats = useMemo(() => ({
    total: items.length,
    open: items.filter((i) => i.status === "open").length,
    inProgress: items.filter((i) => i.status === "in_progress").length,
    resolved: items.filter((i) => i.status === "resolved").length,
  }), [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const statusOk = status === "all" || i.status === status;
      const catOk = category === "all" || i.category === category;
      const qOk = q.trim() === "" || [i.title, i.location, i.reportedBy, i.assignee || ""].some((f) => f.toLowerCase().includes(q.toLowerCase()));
      return statusOk && catOk && qOk;
    });
  }, [items, status, category, q]);

  const cycleStatus = (s: string) => (s === "open" ? "in_progress" : s === "in_progress" ? "resolved" : "open");

  const handleAssign = (id: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, assignee: it.assignee || (user?.name || "Admin") } : it)));
  };

  const handleOpenUpdate = (id: number) => {
    setCurrentType("issue");
    setCurrentId(id);
    setCurrentReportId(null);
    setProgressMsg("");
    setUpdateOpen(true);
  };

  const handleOpenUpdateReport = (id: number) => {
    setCurrentType("report");
    setCurrentReportId(id);
    setCurrentId(null);
    setProgressMsg("");
    setUpdateOpen(true);
  };

  const handleViewReport = (id: number) => {
    const rep = reports.find((r) => r.id === id) || null;
    setViewReport(rep);
    setDetailsOpen(true);
  };

  const readUpdates = (): Record<string, { message: string; ts: number; status: string }[]> => {
    try {
      const raw = localStorage.getItem("issue_updates");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };
  const writeUpdates = (data: Record<string, { message: string; ts: number; status: string }[]>) => {
    localStorage.setItem("issue_updates", JSON.stringify(data));
  };

  const saveProgressUpdate = () => {
    if (currentType === "issue") {
      if (!currentId) return;
      setItems((prev) => prev.map((it) => (it.id === currentId ? { ...it, status: cycleStatus(it.status) } : it)));
      const updates = readUpdates();
      const key = String(currentId);
      const newEntry = { message: progressMsg || "Status updated", ts: Date.now(), status: (items.find((x) => x.id === currentId)?.status || "open") };
      updates[key] = [...(updates[key] || []), newEntry];
      writeUpdates(updates);
      setUpdateOpen(false);
    } else {
      if (!currentReportId) return;
      try {
        const raw = localStorage.getItem("reports");
        const list = raw ? JSON.parse(raw) : [];
        const idx = list.findIndex((r: any) => r.id === currentReportId);
        if (idx !== -1) {
          const nextStatus = cycleStatus(list[idx].status || "open");
          list[idx] = { ...list[idx], status: nextStatus };
          localStorage.setItem("reports", JSON.stringify(list));
          setReports(list);
        }
      } catch {}
      const updates = readUpdates();
      const key = `report:${currentReportId}`;
      const current = (() => {
        try {
          const raw = localStorage.getItem("reports");
          const list = raw ? JSON.parse(raw) : [];
          return list.find((r: any) => r.id === currentReportId)?.status || "open";
        } catch { return "open"; }
      })();
      const newEntry = { message: progressMsg || "Status updated", ts: Date.now(), status: current };
      updates[key] = [...(updates[key] || []), newEntry];
      writeUpdates(updates);
      setUpdateOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={stats.total} color="bg-yellow-50 text-yellow-800" />
        <StatCard title="Open" value={stats.open} color="bg-yellow-100 text-yellow-800" />
        <StatCard title="In Progress" value={stats.inProgress} color="bg-zinc-50 text-zinc-800" />
        <StatCard title="Resolved" value={stats.resolved} color="bg-neutral-900 text-yellow-300" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reported Issues Map</CardTitle>
        </CardHeader>
        <CardContent>
          <MapView markers={markers} heightClassName="h-[400px] md:h-[600px]" />
        </CardContent>
      </Card>

      {/* Supabase Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {sLoading ? (
            <p className="text-sm text-muted-foreground">Loading issues...</p>
          ) : sError ? (
            <p className="text-sm text-destructive">Failed to load issues. Ensure Supabase is configured.</p>
          ) : !sIssues || sIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground">No issues found.</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Audio</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sIssues.map((it: any) => (
                    <motion.tr key={it.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                      <TableCell>{it.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {(it.images || []).slice(0, 3).map((src: string, i: number) => (
                            <img key={i} src={src} alt="thumb" className="h-10 w-10 rounded object-cover" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[200px] font-medium">{it.title}</TableCell>
                      <TableCell className="min-w-[240px] text-sm text-muted-foreground line-clamp-2">{it.description}</TableCell>
                      <TableCell className="min-w-[160px]">{it.location}</TableCell>
                      <TableCell><StatusBadge status={it.status} /></TableCell>
                      <TableCell className="min-w-[140px]">
                        {(it.audios || []).length > 0 ? (
                          <audio src={it.audios[0]} controls className="w-36" />
                        ) : (
                          <span className="text-xs text-muted-foreground">No audio</span>
                        )}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          disabled={updateStatusMut.isPending}
                          onClick={() => updateStatusMut.mutate({ id: it.id, status: cycleSupabase(it.status) })}
                        >
                          {updateStatusMut.isPending ? "Updating..." : "Next Status"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setSViewIssue(it); setSDetailsOpen(true); }}>View</Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Citizen Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No citizen reports submitted yet.</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {(r.images || []).slice(0, 3).map((src: string, i: number) => (
                            <img key={i} src={src} alt="thumb" className="h-10 w-10 rounded object-cover" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[220px] font-medium">{r.title}</TableCell>
                      <TableCell className="capitalize">{r.category}</TableCell>
                      <TableCell className="capitalize">{r.priority}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenUpdateReport(r.id)}>Update</Button>
                        <Button size="sm" onClick={() => handleViewReport(r.id)}>View</Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filter Console</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Search by title, location, reporter" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="road">Road</SelectItem>
                <SelectItem value="lighting">Lighting</SelectItem>
                <SelectItem value="sanitation">Sanitation</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="parks">Parks</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { setQ(""); setStatus("all"); setCategory("all"); }}>Reset</Button>
            <Button>Export CSV</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issue Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <motion.tr key={i.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                    <TableCell>{i.id}</TableCell>
                    <TableCell className="min-w-[220px] font-medium">{i.title}</TableCell>
                    <TableCell>{i.location}</TableCell>
                    <TableCell className="capitalize">{i.category}</TableCell>
                    <TableCell className="capitalize">{i.priority}</TableCell>
                    <TableCell><StatusBadge status={i.status} /></TableCell>
                    <TableCell className="min-w-[160px]">{i.assignee || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                    <TableCell>{new Date(i.date).toLocaleDateString()}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleAssign(i.id)}>Assign</Button>
                      <Button size="sm" onClick={() => handleOpenUpdate(i.id)}>Update</Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Progress Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea value={progressMsg} onChange={(e) => setProgressMsg(e.target.value)} placeholder="Describe what changed, what was done, or next steps..." rows={4} />
            {currentType === "issue" ? (
              <IssueUpdatesPreview id={currentId} readUpdates={readUpdates} />
            ) : (
              <IssueUpdatesPreview id={currentReportId} readUpdates={() => {
                const all = readUpdates();
                const mapped: Record<string, { message: string; ts: number; status: string }[]> = {};
                // Map prefixed storage key (report:<id>) to plain id string so preview component can find it
                if (currentReportId) {
                  const prefKey = `report:${currentReportId}`;
                  if (all[prefKey]) mapped[String(currentReportId)] = all[prefKey];
                }
                return mapped;
              }} />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button>
            <Button onClick={saveProgressUpdate} disabled={currentType === "issue" ? !currentId : !currentReportId}>Save update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog for Citizen Report */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="truncate">{viewReport?.title || "Report Details"}</span>
              {viewReport?.status && <StatusBadge status={viewReport.status} />}
            </DialogTitle>
          </DialogHeader>
          {viewReport && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div>Reporter: <span className="font-medium text-foreground">{viewReport.reportedBy || "Citizen"}</span></div>
                <div>Date: {new Date(viewReport.createdAt).toLocaleString()}</div>
                {typeof viewReport.lat === "number" && typeof viewReport.lng === "number" && (
                  <div>Coords: {viewReport.lat.toFixed(6)}, {viewReport.lng.toFixed(6)}{viewReport.address ? ` • ${viewReport.address}` : ""}</div>
                )}
              </div>
              <div>
                <p className="text-sm whitespace-pre-wrap">{viewReport.description}</p>
              </div>
              {Array.isArray(viewReport.images) && viewReport.images.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Photos</p>
                  <div className="flex flex-wrap gap-2">
                    {viewReport.images.map((src: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLightboxSrc(src)}
                        className="rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`Open image ${idx + 1}`}
                      >
                        <img src={src} alt={`report-${idx}`} className="h-20 w-20 rounded object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {viewReport.audio && (
                <div>
                  <p className="mb-2 text-sm font-medium">Voice Note</p>
                  <audio src={viewReport.audio} controls className="w-full" />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog for Supabase Issue */}
      <Dialog open={sDetailsOpen} onOpenChange={setSDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="truncate">{sViewIssue?.title || "Issue Details"}</span>
              {sViewIssue?.status && <StatusBadge status={sViewIssue.status} />}
            </DialogTitle>
          </DialogHeader>
          {sViewIssue && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div>Location: <span className="font-medium text-foreground">{sViewIssue.location || "—"}</span></div>
                <div>ID: {sViewIssue.id}</div>
              </div>
              <div>
                <p className="text-sm whitespace-pre-wrap">{sViewIssue.description}</p>
              </div>
              {Array.isArray(sViewIssue.images) && sViewIssue.images.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Photos</p>
                  <div className="flex flex-wrap gap-2">
                    {sViewIssue.images.map((src: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLightboxSrc(src)}
                        className="rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`Open image ${idx + 1}`}
                      >
                        <img src={src} alt={`issue-${idx}`} className="h-20 w-20 rounded object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(sViewIssue.audios) && sViewIssue.audios.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Audio</p>
                  {sViewIssue.audios.map((a: string, i: number) => (
                    <audio key={i} src={a} controls className="w-full" />
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox for images */}
      <Dialog open={!!lightboxSrc} onOpenChange={(o) => { if (!o) setLightboxSrc(null); }}>
        <DialogContent className="sm:max-w-3xl">
          {lightboxSrc && (
            <img src={lightboxSrc} alt="preview" className="max-h-[70vh] w-full rounded object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={`${color}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-current/70">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function IssueUpdatesPreview({ id, readUpdates }: { id: number | null; readUpdates: () => Record<string, { message: string; ts: number; status: string }[]> }) {
  if (!id) return null;
  const all = readUpdates();
  const list = (all[String(id)] || []).slice().reverse();
  if (!list.length) return <p className="text-xs text-muted-foreground">No previous updates yet.</p>;
  return (
    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
      {list.map((u, idx) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-md bg-muted/50 p-2">
          <p className="text-xs leading-snug">{u.message}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{new Date(u.ts).toLocaleString()}</p>
        </motion.div>
      ))}
    </div>
  );
}