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

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [items, setItems] = useState(() => issuesData.map((i) => ({ ...i, assignee: "" as string })));
  const [updateOpen, setUpdateOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [progressMsg, setProgressMsg] = useState("");

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
    setCurrentId(id);
    setProgressMsg("");
    setUpdateOpen(true);
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
    if (!currentId) return;
    setItems((prev) => prev.map((it) => (it.id === currentId ? { ...it, status: cycleStatus(it.status) } : it)));
    const updates = readUpdates();
    const key = String(currentId);
    const newEntry = { message: progressMsg || "Status updated", ts: Date.now(), status: (items.find((x) => x.id === currentId)?.status || "open") };
    updates[key] = [...(updates[key] || []), newEntry];
    writeUpdates(updates);
    setUpdateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={stats.total} color="bg-emerald-50 text-emerald-700" />
        <StatCard title="Open" value={stats.open} color="bg-amber-50 text-amber-700" />
        <StatCard title="In Progress" value={stats.inProgress} color="bg-lime-50 text-lime-700" />
        <StatCard title="Resolved" value={stats.resolved} color="bg-green-50 text-green-700" />
      </div>

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
            <IssueUpdatesPreview id={currentId} readUpdates={readUpdates} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button>
            <Button onClick={saveProgressUpdate} disabled={!currentId}>Save update</Button>
          </DialogFooter>
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