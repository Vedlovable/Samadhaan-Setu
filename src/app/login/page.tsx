"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { User2, ShieldCheck, MapPin, Users, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState<string>("citizen@demo.dev");
  const [password, setPassword] = useState<string>("123456");
  const [error, setError] = useState<string>("");
  const [tab, setTab] = useState("citizen");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password, role: tab === "citizen" ? "citizen" : "admin" });
      router.push(tab === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-140px)] w-full max-w-6xl grid-cols-1 items-center gap-8 py-8 md:grid-cols-2">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="hidden md:block">
        {/* Left hero panel styled like screenshot */}
        <div className="relative overflow-hidden rounded-2xl border bg-accent p-6 text-accent-foreground">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.05),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.05),transparent_40%)]" />
          <div className="relative">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              <span className="opacity-90">Empowering </span>
              <span className="text-primary">Citizens</span>
              <span className="opacity-90">. </span>
              <span className="text-primary">Fixing</span>
              <span className="opacity-90"> Cities.</span>
            </h1>
            <p className="mt-3 max-w-md text-base text-accent-foreground/80">
              Report civic issues like potholes, broken lights, and garbage in real-time — and track resolutions instantly.
            </p>

            {/* Top CTAs replaced with Login / Sign Up */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#auth" onClick={() => setTab("citizen")} className="inline-flex">
                <Button className="h-10 rounded-full bg-primary text-primary-foreground hover:opacity-90">
                  Log In
                </Button>
              </a>
              <Link href="/register" className="inline-flex">
                <Button variant="secondary" className="h-10 rounded-full">
                  Sign Up
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FeatureCard icon={<MapPin className="h-5 w-5 text-primary" />} title="Report Issues" desc="Quick & easy" />
              <FeatureCard icon={<Users className="h-5 w-5 text-primary" />} title="Community" desc="Work together" />
              <FeatureCard icon={<CheckCircle className="h-5 w-5 text-primary" />} title="Get Results" desc="Track progress" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card id="auth" className="rounded-2xl border-primary/10 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-accent/30 p-1">
                <TabsTrigger value="citizen" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <User2 className="mr-2 h-4 w-4" /> Citizen
                </TabsTrigger>
                <TabsTrigger value="admin" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Admin
                </TabsTrigger>
              </TabsList>
              <TabsContent value="citizen" className="mt-4">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button className="h-11 w-full rounded-full" disabled={loading} type="submit">{loading ? "Signing in..." : "Sign In"}</Button>
                </form>
                <p className="mt-4 text-center text-sm">
                  Don&apos;t have an account? {" "}
                  <Link href="/register" className="text-primary hover:underline">Sign up</Link>
                </p>
                <DemoCreds role="citizen" />
              </TabsContent>
              <TabsContent value="admin" className="mt-4">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email2">Email Address</Label>
                    <Input id="email2" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password2">Password</Label>
                    <Input id="password2" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button className="h-11 w-full rounded-full" disabled={loading} type="submit">{loading ? "Signing in..." : "Sign In"}</Button>
                </form>
                <p className="mt-4 text-center text-sm">
                  Don&apos;t have an account? {" "}
                  <Link href="/register" className="text-primary hover:underline">Sign up</Link>
                </p>
                <DemoCreds role="admin" />
              </TabsContent>
            </Tabs>
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

function DemoCreds({ role }: { role: "citizen" | "admin" }) {
  const creds = role === "citizen" ? { email: "citizen@demo.dev", pass: "123456" } : { email: "admin@demo.dev", pass: "admin123" };
  return (
    <div className="mt-6 rounded-lg border border-accent/50 bg-accent/20 p-4 text-sm">
      <p className="font-medium">Demo credentials ({role})</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div><span className="text-muted-foreground">Email:</span> {creds.email}</div>
        <div><span className="text-muted-foreground">Password:</span> {creds.pass}</div>
      </div>
    </div>
  );
}