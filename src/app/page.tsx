"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Users, CheckCircle, User2, ShieldCheck } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, login, loading } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [tab, setTab] = useState("citizen");

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

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
    <div className="relative mx-auto w-full max-w-6xl py-8">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-background to-background/60 p-6 md:p-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(234,179,8,0.08),transparent_40%)]" />
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Left hero */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="max-w-xl">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Empowering Citizens. <span className="text-primary">Fixing Cities.</span>
              </h1>
              <p className="mt-4 text-base text-foreground/70">
                Report issues, track progress and build better neighborhoods together.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FeatureCard icon={<MapPin className="h-5 w-5 text-primary" />} title="Report" desc="Raise tickets" />
                <FeatureCard icon={<Users className="h-5 w-5 text-primary" />} title="Collaborate" desc="Work together" />
                <FeatureCard icon={<CheckCircle className="h-5 w-5 text-primary" />} title="Resolve" desc="See outcomes" />
              </div>
            </div>
          </motion.div>

          {/* Right: login/signup tabs */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="w-full">
            <Card className="rounded-2xl border-primary/10 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome</CardTitle>
                <CardDescription>Sign in or create an account</CardDescription>
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
                  </TabsContent>
                </Tabs>
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