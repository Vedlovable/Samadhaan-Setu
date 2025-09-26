"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mic, Square, RotateCcw, Play } from "lucide-react";
import MapView from "@/components/map/MapView";
import { createIssueWithMedia } from "@/lib/supabase/issues";

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
  // Voice note state
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // Map pick state
  const [picked, setPicked] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [geoPin, setGeoPin] = useState<[number, number] | undefined>(undefined);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // stop tracks
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic permission or recording error", err);
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
      setRecording(false);
    }
  };

  const resetRecording = () => {
    setRecording(false);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    chunksRef.current = [];
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((f) => /image\/(jpeg|png)/i.test(f.type));
    const readers = await Promise.all(
      accepted.map(
        (file) =>
          new Promise<string>((resolve) => {
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result));
            fr.readAsDataURL(file);
          })
      )
    );
    setImages((prev) => [...prev, ...readers]);
    setImageFiles((prev) => [...prev, ...accepted]);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGeoPin([lat, lng]);
        setPicked({ lat, lng });
      },
      () => {
        // ignore errors
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Try Supabase create + uploads first
    try {
      await createIssueWithMedia({
        issue: {
          title,
          description,
          location,
          status: "Pending",
          lat: picked?.lat ?? null,
          lng: picked?.lng ?? null,
        },
        imageFiles: imageFiles,
        audioBlob: audioBlob,
      });
      router.push("/dashboard?submitted=1");
      return;
    } catch (err) {
      // Fallback to localStorage for demo continuity
      console.warn("Supabase createIssueWithMedia failed, falling back to localStorage:", err);
    }

    // Placeholder: prepare form data including audio file if present
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("priority", priority);
    formData.append("location", location);
    formData.append("description", description);
    if (picked) {
      formData.append("lat", String(picked.lat));
      formData.append("lng", String(picked.lng));
      if (picked.address) formData.append("address", picked.address);
    }
    if (audioBlob) {
      const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: audioBlob.type || "audio/webm" });
      formData.append("voice_note", file);
    }
    images.forEach((dataUrl, i) => {
      formData.append(`image_${i}`, dataUrl);
    });

    // Persist to localStorage for admin map/list preview (no backend yet)
    try {
      const raw = localStorage.getItem("reports");
      const reports = raw ? JSON.parse(raw) : [];
      reports.push({
        id: Date.now(),
        title,
        category,
        priority,
        description,
        location,
        status: "open",
        lat: picked?.lat ?? null,
        lng: picked?.lng ?? null,
        address: picked?.address ?? null,
        images,
        // new fields for admin/user views
        audio: audioUrl || null,
        reportedBy: user?.name || "Citizen",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("reports", JSON.stringify(reports));
    } catch {}

    // TODO: POST to /api/report (Supabase integration later)
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
                <div className="sm:col-span-2">
                  <Label>Pick location on map</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>Use My Location</Button>
                      {picked && (
                        <span className="text-xs text-muted-foreground">
                          Selected: {picked.lat.toFixed(6)}, {picked.lng.toFixed(6)}{picked.address ? ` • ${picked.address}` : ""}
                        </span>
                      )}
                    </div>
                    <MapView
                      allowDropPin
                      enableReverseGeocode
                      onPick={(d) => setPicked(d)}
                      selectedPin={geoPin}
                      heightClassName="h-[400px] md:h-[600px]"
                    />
                  </div>
                </div>
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <div
                    className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center"
                  >
                    {images.length === 0 ? (
                      <>
                        <p className="text-sm text-muted-foreground">Upload JPG or PNG (multiple)</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Upload Photos</Button>
                      </>
                    ) : (
                      <div className="w-full">
                        <div className="mb-3 flex flex-wrap gap-2">
                          {images.map((src, idx) => (
                            <div key={idx} className="relative">
                              <img src={src} alt={`upload-${idx}`} className="h-20 w-20 rounded object-cover" />
                              <button type="button" onClick={() => removeImage(idx)} className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white">×</button>
                            </div>
                          ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Add more</Button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Voice Note */}
                <div className="space-y-2 sm:col-span-2">
                  <Label>Voice Note (optional)</Label>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-muted-foreground">{recording ? "Recording..." : audioUrl ? "Recorded audio ready" : "Record a short voice note to add more context"}</div>
                      <div className="flex items-center gap-2">
                        <AnimatePresence initial={false}>
                          {!recording && !audioUrl && (
                            <motion.button type="button" onClick={startRecording} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} whileTap={{ scale: 0.92 }} aria-label="Start recording">
                              <Mic className="h-5 w-5" />
                            </motion.button>
                          )}
                          {recording && (
                            <motion.button type="button" onClick={stopRecording} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-sm" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} whileTap={{ scale: 0.92 }} aria-label="Stop recording">
                              <Square className="h-5 w-5" />
                            </motion.button>
                          )}
                          {!recording && audioUrl && (
                            <div className="flex items-center gap-2">
                              <a href={audioUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground" aria-label="Play">
                                <Play className="h-5 w-5" />
                              </a>
                              <button type="button" onClick={resetRecording} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground" aria-label="Re-record">
                                <RotateCcw className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    {/* Inline player */}
                    {!recording && audioUrl && (
                      <audio src={audioUrl} controls className="mt-3 w-full" />
                    )}
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