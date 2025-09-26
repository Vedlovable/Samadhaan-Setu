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
import { User2, ShieldCheck, MapPin, Users, CheckCircle, ChevronRight, Camera, Route, Bell, BarChart3, Smartphone, Lock, Shield, Database } from "lucide-react";

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
    <div className="mx-auto w-full max-w-6xl px-4">
      {/* HERO */}
      <div className="mx-auto grid min-h-[70dvh] w-full grid-cols-1 items-center gap-8 py-10 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="order-1 md:order-none">
          {/* Left hero panel styled to match reference (black card, yellow accents) */}
          <div className="relative overflow-hidden rounded-2xl border bg-black p-6 text-white shadow-xl">
            <div className="absolute inset-0 pointer-events-none [background:radial-gradient(600px_circle_at_0%_0%,rgba(255,255,255,0.06),transparent_50%),radial-gradient(500px_circle_at_100%_100%,rgba(255,255,0,0.08),transparent_50%)]" />
            <div className="relative">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                <span className="opacity-90">Empowering </span>
                <span className="text-[#FFD700]">Citizens</span>
                <span className="opacity-90">. </span>
                <span className="text-[#FFD700]">Fixing</span>
                <span className="opacity-90"> Cities.</span>
              </h1>
              <p className="mt-3 max-w-md text-base text-white/80">
                Report civic issues like potholes, broken lights, and garbage in real-time — and track resolutions instantly.
              </p>

              {/* Top CTAs as per reference */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button onClick={() => router.push("/report")} className="h-10 rounded-full bg-[#FFD700] text-black hover:opacity-90">
                  Report an Issue
                </Button>
                <Button onClick={() => router.push("/dashboard")} variant="secondary" className="h-10 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20">
                  Explore Map
                </Button>
              </div>

              {/* Mock illustration card inline (top-right badge style) */}
              <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-24 rounded bg-white/10" />
                  <div className="h-6 w-6 rounded-full bg-[#FFD700]" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="col-span-2 rounded-md border border-white/10 bg-black/60 p-3 text-sm text-white/70">
                    <span className="opacity-70">Report Issue</span>
                    <div className="mt-2 h-20 rounded-md bg-white/5" />
                  </div>
                  <div className="flex flex-col items-stretch justify-between">
                    <div className="h-8 rounded-md bg-white/10" />
                    <Button className="mt-3 rounded-md bg-[#FFD700] px-3 py-2 text-xs font-medium text-black hover:opacity-90">Submit Report</Button>
                  </div>
                </div>
              </div>

              {/* Stats below hero as per reference */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-white/80">
                <Stat value="5,247" label="Issues Reported" />
                <Stat value="4,891" label="Issues Resolved" />
                <Stat value="93%" label="Resolution Rate" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Auth card on the right */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card id="auth" className="rounded-2xl border-primary/10 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-full bg-accent/30 p-1">
                  <TabsTrigger value="citizen" className="rounded-full data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">
                    <User2 className="mr-2 h-4 w-4" /> Citizen
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="rounded-full data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">
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
                    <Button className="h-11 w-full rounded-full bg-[#FFD700] text-black hover:opacity-90" disabled={loading} type="submit">{loading ? "Signing in..." : "Sign In"}</Button>
                  </form>
                  <p className="mt-4 text-center text-sm">
                    Don&apos;t have an account? {" "}
                    <Link href="/register" className="text-[#FFD700] hover:underline">Sign up</Link>
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
                    <Button className="h-11 w-full rounded-full bg-[#FFD700] text-black hover:opacity-90" disabled={loading} type="submit">{loading ? "Signing in..." : "Sign In"}</Button>
                  </form>
                  <p className="mt-4 text-center text-sm">
                    Don&apos;t have an account? {" "}
                    <Link href="/register" className="text-[#FFD700] hover:underline">Sign up</Link>
                  </p>
                  <DemoCreds role="admin" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* How It Works */}
      <section className="py-14">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            How It <span className="text-[#FFD700]">Works</span>
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            From problem to solution in three simple steps. Our streamlined process ensures your civic concerns get the attention they deserve.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StepCard
            icon={<Camera className="h-5 w-5 text-black" />}
            title="Capture the Issue"
            bullets={["Take a photo", "Add location & details", "Choose category", "Optional anonymity"]}
          />
          <StepCard
            icon={<CheckCircle className="h-5 w-5 text-black" />}
            title="Submit & Track Progress"
            bullets={["Instant submission", "Real-time updates", "Progress milestones", "Responsive officials"]}
          />
          <StepCard
            icon={<ShieldCheck className="h-5 w-5 text-black" />}
            title="Resolved by Municipality"
            bullets={["Automatic routing", "Prioritised resolution", "Provide feedback", "Complete transparency"]}
          />
        </div>
        <div className="mt-8 flex justify-center">
          <Button onClick={() => router.push("/report")} className="rounded-full bg-[#FFD700] px-6 text-black hover:opacity-90">
            Start Reporting Issues <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Live Issue Map */}
      <section className="py-14">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Live Issue <span className="text-[#FFD700]">Map</span>
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            See real-time civic issues reported in your area. Track progress, explore patterns, and stay informed about your community.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
          {/* Map placeholder */}
          <div className="rounded-2xl border bg-muted/40 p-4">
            <div className="h-[320px] w-full rounded-lg border border-dashed bg-white" />
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <Legend color="#22c55e" label="Fixed" />
              <Legend color="#f97316" label="In Progress" />
              <Legend color="#ef4444" label="Severe" />
            </div>
          </div>
          {/* Filters */}
          <div className="flex flex-col gap-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Filter Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FilterRow label="All Issues" count={5} active={false} />
                <FilterRow label="Potholes" count={2} active={false} />
                <FilterRow label="Street Lights" count={1} active={false} />
                <FilterRow label="Garbage" count={1} active={true} />
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div>Overflowing trash bin</div>
                <div>Broken street light</div>
                <div>Pothole near 7th Ave</div>
              </CardContent>
            </Card>
            <Button onClick={() => router.push("/dashboard")} variant="secondary" className="rounded-full">Explore Full Map</Button>
          </div>
        </div>
      </section>

      {/* Built for Everyone - dark section */}
      <section className="rounded-3xl bg-black px-4 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Built for <span className="text-[#FFD700]">Everyone</span></h2>
            <p className="mx-auto mt-2 max-w-2xl text-white/70">
              Whether you're a concerned citizen or a municipal administrator, our platform provides the tools you need to make a difference.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#FFD700] text-black">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-xl font-semibold">For Citizens</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li>Easy reporting</li>
                <li>Live issue updates</li>
                <li>See community impact</li>
                <li>Get notified on resolution</li>
              </ul>
              <Button onClick={() => router.push("/report")} className="mt-5 rounded-full bg-[#FFD700] text-black hover:opacity-90">Start Reporting</Button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white text-black p-6">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-black text-white">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="text-xl font-semibold">For Administrators</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>Centralised intake</li>
                <li>Automated prioritisation</li>
                <li>Team workflows</li>
                <li>Policy insights</li>
              </ul>
              <Button onClick={() => router.push("/admin")} variant="secondary" className="mt-5 rounded-full bg-black text-white hover:bg-black/80">Admin Dashboard</Button>
            </div>
          </div>

          {/* mid stats */}
          <div className="mt-10 grid grid-cols-2 gap-4 text-center text-sm md:grid-cols-4">
            <Stat value="50+" label="Cities using Platform" dark />
            <Stat value="25k+" label="Active Citizens" dark />
            <Stat value="95%" label="Resolution Rate" dark />
            <Stat value="48h" label="Avg. Resolution Time" dark />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-14">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Powerful <span className="text-[#FFD700]">Features</span></h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Everything you need to report, track, and resolve civic issues efficiently. Built with cutting-edge technology for maximum impact.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Feature icon={<MapPin className="h-5 w-5 text-black" />} title="Real-time Issue Tracking" bullets={["Live progress", "Status updates", "Clear timelines", "Public transparency"]} />
          <Feature icon={<Camera className="h-5 w-5 text-black" />} title="Photo & Location Uploads" bullets={["Geo-tag photos", "Attach multiple images", "High-quality uploads", "Simple mobile flow"]} />
          <Feature icon={<Route className="h-5 w-5 text-black" />} title="Automated Routing" bullets={["Auto-assign tasks", "Department matching", "Priority sorting", "Smart escalation"]} />
          <Feature icon={<Smartphone className="h-5 w-5 text-black" />} title="Cross-Device Support" bullets={["Accessible on any device", "Responsive UI", "Offline-friendly", "Shareable links"]} />
          <Feature icon={<BarChart3 className="h-5 w-5 text-black" />} title="Analytics & Insights" bullets={["Actionable metrics", "Trend analysis", "Exportable reports", "Team performance"]} />
          <Feature icon={<Bell className="h-5 w-5 text-black" />} title="Smart Notifications" bullets={["Real-time alerts", "Status changes", "Community updates", "Admin reminders"]} />
        </div>
      </section>

      {/* Security */}
      <section className="py-14">
        <div className="mx-auto max-w-5xl rounded-2xl border bg-black p-6 text-white">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">Enterprise-Grade Security</h3>
              <p className="mt-2 text-white/70">
                Your data and privacy are our top priorities. We use industry-leading security measures to prevent unauthorised access and ensure complete protection.
              </p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-white/80">
                <li>Data Encryption</li>
                <li>Privacy Protocols</li>
                <li>24/7 Monitoring</li>
                <li>Audit Trails</li>
              </ul>
              <Button variant="secondary" className="mt-6 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20">Security Details</Button>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="mb-3 text-sm font-medium text-white/80">Security Status</h4>
              <ProgressRow label="Data Encryption" value={92} />
              <ProgressRow label="Privacy Protocols" value={87} />
              <ProgressRow label="Audit Trails" value={91} />
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                <MiniStat icon={<Lock className="h-4 w-4" />} label="User" value="OK" />
                <MiniStat icon={<Shield className="h-4 w-4" />} label="Operator" value="OK" />
                <MiniStat icon={<Database className="h-4 w-4" />} label="Compliance" value="OK" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="rounded-2xl bg-black px-6 py-12 text-center text-white">
        <h3 className="text-2xl font-semibold">Join the movement. <span className="text-[#FFD700]">Make your city better.</span></h3>
        <p className="mx-auto mt-2 max-w-2xl text-white/70">Be part of a community that's actively working to improve civic infrastructure. Your voice matters, and every report makes a difference.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Button onClick={() => router.push("/report")} className="rounded-full bg-[#FFD700] text-black hover:opacity-90">Report Now</Button>
          <Button onClick={() => router.push("/dashboard")} variant="secondary" className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20">Explore Issues</Button>
        </div>
      </section>

      {/* Final Footer */}
      <footer className="mt-12 border-t pt-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#FFD700] font-bold text-black">SS</span>
              <span className="font-semibold">Samadhaan Setu</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Empowering citizens to make a real difference in their communities. Report issues, track progress, and see the impact of your actions.
            </p>
            <div className="mt-3 flex gap-3 text-sm text-muted-foreground">
              <span>© 2025</span>
              <span>All rights reserved.</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/register">Register</Link></li>
              <li><Link href="/report">Report Issue</Link></li>
              <li><Link href="/dashboard">Explore Map</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Accessibility</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          Accessibility Statement
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD700]">
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

function Stat({ value, label, dark = false }: { value: string; label: string; dark?: boolean }) {
  return (
    <div className={dark ? "rounded-xl border border-white/10 bg-white/5 p-4" : "rounded-xl border bg-white p-4"}>
      <div className={dark ? "text-lg font-semibold text-white" : "text-lg font-semibold"}>{value}</div>
      <div className={dark ? "text-xs text-white/70" : "text-xs text-muted-foreground"}>{label}</div>
    </div>
  );
}

function StepCard({ icon, title, bullets }: { icon: React.ReactNode; title: string; bullets: string[] }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#FFD700] text-black">
        {icon}
      </div>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FFD700]" /> {b}</li>
        ))}
      </ul>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function FilterRow({ label, count, active }: { label: string; count: number; active?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${active ? "border-[#FFD700] bg-[#FFF8CC]" : "bg-white"}`}>
      <span className={active ? "font-medium text-black" : "text-gray-700"}>{label}</span>
      <span className={`ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs ${active ? "bg-black text-white" : "bg-muted text-foreground"}`}>{count}</span>
    </div>
  );
}

function Feature({ icon, title, bullets }: { icon: React.ReactNode; title: string; bullets: string[] }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#FFD700] text-black">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FFD700]" /> {b}</li>
        ))}
      </ul>
      <button className="mt-4 inline-flex items-center text-sm font-medium text-[#111] underline decoration-transparent hover:decoration-[#111]">Learn More</button>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-xs text-white/80"><span>{label}</span><span>{value}%</span></div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-[#FFD700]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-center gap-2 text-white/90">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-1 text-center text-sm font-semibold text-white">{value}</div>
    </div>
  );
}