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

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);
  const [tab, setTab] = useState<string>("all");
  const issues = issuesData;

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
        <StatCard title="Total Reports" value={stats.total} color="bg-blue-50 text-blue-700" />
        <StatCard title="Open" value={stats.open} color="bg-amber-50 text-amber-700" />
        <StatCard title="In Progress" value={stats.inProgress} color="bg-sky-50 text-sky-700" />
        <StatCard title="Resolved" value={stats.resolved} color="bg-emerald-50 text-emerald-700" />
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
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md bg-muted px-2 py-1 capitalize">{issue.category}</span>
                    <span className="rounded-md bg-muted px-2 py-1">Reporter: {issue.reportedBy}</span>
                  </div>
                </motion.div>
              ))}
              {filtered.length === 0 && <p className="text-sm text-muted-foreground">No issues found for this filter.</p>}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
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