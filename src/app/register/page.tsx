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
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!form.name || !form.email || !form.password) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Demo mode - simulate successful registration
      console.log("Using demo mode for registration");
      
      // Show success message
      setError("Signup successful! Redirecting to login page...");
      
      // In demo mode, just redirect to login with success parameter
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2000);
    } catch (error) {
      console.error("Error signing up:", error);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl py-8">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-background to-background/60 p-6 md:p-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(234,179,8,0.08),transparent_40%)]" />
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Left hero content */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="max-w-xl">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Join <span className="text-primary">Samadhaan Setu</span>
              </h1>
              <p className="mt-4 text-base text-foreground/70">
                Create an account to report issues, collaborate with your community, and track progress.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FeatureCard icon={<MapPin className="h-5 w-5 text-primary" />} title="Report" desc="Raise civic tickets" />
                <FeatureCard icon={<Users className="h-5 w-5 text-primary" />} title="Collaborate" desc="Work together" />
                <FeatureCard icon={<CheckCircle className="h-5 w-5 text-primary" />} title="Resolve" desc="See outcomes" />
              </div>
            </div>
          </motion.div>

          {/* Right: signup card */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="w-full max-w-md justify-self-stretch md:justify-self-auto">
            <Card className="rounded-2xl border-primary/10 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
              <Button className="h-11 w-full rounded-full" type="submit" disabled={loading}>
                <UserPlus className="mr-2 h-4 w-4" /> {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
          </motion.div>
        </div>
      </div>
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