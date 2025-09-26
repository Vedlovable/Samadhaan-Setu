"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/StatusBadge";
import issuesData from "@/data/issues.json";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);
  const [tab, setTab] = useState<string>("all");
  const issues = issuesData;

  // new: local progress updates map from localStorage
  const [updatesMap, setUpdatesMap] = useState<Record<string, { message: string; ts: number; status: string }[]>>({});
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("issue_updates");
        setUpdatesMap(raw ? JSON.parse(raw) : {});
      } catch {
        setUpdatesMap({});
      }
    };
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "issue_updates") read();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // new: user-submitted reports (from localStorage)
  const [myReports, setMyReports] = useState<any[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("reports");
        const all = raw ? JSON.parse(raw) : [];
        const list = user?.name ? all.filter((r: any) => r.reportedBy === user.name) : all;
        setMyReports(list);
      } catch {
        setMyReports([]);
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "reports") load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user?.name]);

  const filtered = useMemo(() => {
    if (tab === "all") return issues;
    if (tab === "mine") return issues.filter((i) => i.reportedBy === user?.name);
    return issues.filter((i) => i.status === tab);
  }, [issues, tab, user?.name]);

  const stats = useMemo(() => {
    return {
      total: issues.length,
      open: issues.filter((i) => i.status === "open").length,
      inProgress: issues.filter((i) => i.status === "in_progress").length,
      resolved: issues.filter((i) => i.status === "resolved").length,
    };
  }, [issues]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold">Hello{user ? `, ${user.name.split(" ")[0]}` : ""} 👋</h1>
          <p className="text-sm text-muted-foreground">Track your reports and see updates from the city.</p>
        </div>
        <Button asChild>
          <Link href="/report">Report a Civic Issue</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Reports" value={stats.total} color="bg-yellow-50 text-yellow-800" />
        <StatCard title="Open" value={stats.open} color="bg-yellow-100 text-yellow-800" />
        <StatCard title="In Progress" value={stats.inProgress} color="bg-zinc-50 text-zinc-800" />
        <StatCard title="Resolved" value={stats.resolved} color="bg-neutral-900 text-yellow-300" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="flex w-full flex-wrap gap-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="mine">Mine</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4 space-y-3">
              {filtered.map((issue) => (
                <motion.div key={issue.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{issue.title}</h3>
                        <StatusBadge status={issue.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.location} • {new Date(issue.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">Priority: <span className="font-medium capitalize">{issue.priority}</span></div>
                  </div>
                  <Separator className="my-3" />
                  {/* Thumbnails for uploaded images (if any) */}
                  <div className="mb-3">
                    {Array.isArray(issue.images) && issue.images.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {issue.images.slice(0, 4).map((src: string, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setLightboxSrc(src)}
                            className="rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={`Open image ${idx + 1}`}
                          >
                            <img src={src} alt={`thumb-${idx}`} className="h-12 w-12 rounded object-cover md:h-14 md:w-14" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No photo attached</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md bg-muted px-2 py-1 capitalize">{issue.category}</span>
                    <span className="rounded-md bg-muted px-2 py-1">Reporter: {issue.reportedBy}</span>
                  </div>
                  {/* Status Updates feed */}
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Status Updates</p>
                    <div className="space-y-2">
                      {(updatesMap[String(issue.id)] || []).length === 0 && (
                        <p className="text-xs text-muted-foreground">No updates yet.</p>
                      )}
                      {(updatesMap[String(issue.id)] || [])
                        .slice()
                        .reverse()
                        .map((u, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative overflow-hidden rounded-md border bg-card/50 p-3"
                          >
                            <div className="flex items-start gap-3">
                              <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-primary" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs leading-snug">{u.message}</p>
                                <p className="mt-1 text-[10px] text-muted-foreground">{new Date(u.ts).toLocaleString()}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              ))}
              {filtered.length === 0 && <p className="text-sm text-muted-foreground">No issues found for this filter.</p>}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lightbox for report images */}
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