"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Users, CheckCircle, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [role, setRole] = useState<"citizen" | "admin">("citizen");
  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Please fill all fields");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    // Try Supabase signup; gracefully fallback if not configured
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, role } },
    });

    if (error) {
      if ((error.message || "").toLowerCase().includes("supabase not configured")) {
        router.push("/login?registered=true");
        return;
      }
      setError(error.message || "Registration failed");
      return;
    }

    router.push("/login?registered=true");
  };

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-140px)] w-full max-w-6xl grid-cols-1 items-center gap-8 py-8 md:grid-cols-2">
      {/* Left info panel */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="hidden md:block">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(234,179,8,0.08),transparent_40%)]" />
          <div className="relative">
            <h1 className="text-4xl font-bold tracking-tight text-foreground/90">
              <span>Join </span>
              <span className="text-primary">Samadhaan Setu</span>
            </h1>
            <p className="mt-3 max-w-md text-base text-foreground/70">
              Create an account to report issues, collaborate with your community, and track progress.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FeatureCard icon={<MapPin className="h-5 w-5 text-primary" />} title="Report" desc="Raise civic tickets" />
              <FeatureCard icon={<Users className="h-5 w-5 text-primary" />} title="Collaborate" desc="Work together" />
              <FeatureCard icon={<CheckCircle className="h-5 w-5 text-primary" />} title="Resolve" desc="See outcomes" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right form card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="rounded-2xl border-primary/10 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="Your name" value={form.name} onChange={onChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
              </div>

              {/* Role selection */}
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center justify-center rounded-md border p-3 text-sm cursor-pointer ${role === "citizen" ? "border-primary bg-primary/10" : "border-muted"}`}>
                    <input
                      type="radio"
                      name="role"
                      value="citizen"
                      checked={role === "citizen"}
                      onChange={() => setRole("citizen")}
                      className="sr-only"
                    />
                    Citizen
                  </label>
                  <label className={`flex items-center justify-center rounded-md border p-3 text-sm cursor-pointer ${role === "admin" ? "border-primary bg-primary/10" : "border-muted"}`}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === "admin"}
                      onChange={() => setRole("admin")}
                      className="sr-only"
                    />
                    Admin
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••" autoComplete="off" value={form.password} onChange={onChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" name="confirm" type="password" placeholder="••••••" autoComplete="off" value={form.confirm} onChange={onChange} required />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="h-11 w-full rounded-full" type="submit">
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
              </Button>
            </form>
            <p className="mt-4 text-center text-sm">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <div>
          <p className="font-medium leading-none">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}