"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role !== "citizen") router.replace("/dashboard");
  }, [user, router]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard?submitted=1");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Report a Civic Issue</CardTitle>
            <CardDescription>Provide details so we can route it to the right department.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Pothole on Main St" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        <SelectItem value="road">Road</SelectItem>
                        <SelectItem value="lighting">Lighting</SelectItem>
                        <SelectItem value="sanitation">Sanitation</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="parks">Parks</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Priority</SelectLabel>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Address or landmark" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue" rows={5} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Photos</Label>
                  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
                    <img src="https://images.unsplash.com/photo-1501691223387-dd0500403074?q=80&w=600&auto=format&fit=crop" alt="placeholder" className="h-28 w-28 rounded object-cover" />
                    <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                    <Button type="button" variant="outline" size="sm">Upload</Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit">Submit Report</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Reporting Guidelines</CardTitle>
              <CardDescription>Help us resolve your issue faster.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <li>Provide clear location details.</li>
              <li>Attach a photo if possible.</li>
              <li>Do not include personal information in photos.</li>
              <li>Emergency? Contact local authorities immediately.</li>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}