import { supabase } from "./client";

export type NewIssueInput = {
  title: string;
  description: string;
  location: string;
  status?: string; // default pending
  lat?: number | null;
  lng?: number | null;
};

export async function createIssueWithMedia({
  issue,
  imageFiles,
  audioBlob,
}: {
  issue: NewIssueInput;
  imageFiles: File[];
  audioBlob?: Blob | null;
}) {
  // Ensure logged in
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("You must be logged in");

  // 1) Insert issue row
  const { data: issueRows, error: issueErr } = await supabase
    .from("issues")
    .insert({
      user_id: user.id,
      title: issue.title,
      description: issue.description,
      location: issue.location,
      status: issue.status ?? "Pending",
      lat: issue.lat ?? null,
      lng: issue.lng ?? null,
    })
    .select("id")
    .limit(1);
  if (issueErr) throw new Error(issueErr.message);
  const issueId = issueRows?.[0]?.id as number;
  if (!issueId) throw new Error("Failed to create issue");

  const mediaInserts: { issue_id: number; type: "image" | "audio"; url: string }[] = [];

  // 2) Upload images
  for (const file of imageFiles) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${issueId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) throw new Error(`Image upload failed: ${upErr.message}`);
    const { data: pub } = supabase.storage.from("images").getPublicUrl(path);
    mediaInserts.push({ issue_id: issueId, type: "image", url: pub.publicUrl });
  }

  // 3) Upload audio if any
  if (audioBlob) {
    const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: audioBlob.type || "audio/webm" });
    const path = `${issueId}/${Date.now()}-voice.webm`;
    const { error: aErr } = await supabase.storage.from("voice-notes").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (aErr) throw new Error(`Audio upload failed: ${aErr.message}`);
    const { data: pub } = supabase.storage.from("voice-notes").getPublicUrl(path);
    mediaInserts.push({ issue_id: issueId, type: "audio", url: pub.publicUrl });
  }

  // 4) Persist media rows
  if (mediaInserts.length) {
    const { error: mErr } = await supabase.from("media").insert(mediaInserts);
    if (mErr) throw new Error(mErr.message);
  }

  return issueId;
}

export type IssueRecord = {
  id: number;
  user_id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
  lat: number | null;
  lng: number | null;
};

export type MediaRecord = {
  id: number;
  issue_id: number;
  type: "image" | "audio";
  url: string;
  created_at: string;
};

export async function listIssuesWithMedia() {
  // Fetch issues
  const { data: issues, error } = await supabase
    .from("issues")
    .select("id, user_id, title, description, location, status, created_at, lat, lng")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const ids = (issues ?? []).map((i) => i.id);
  let media: MediaRecord[] = [];
  if (ids.length) {
    const { data: m, error: mErr } = await supabase
      .from("media")
      .select("id, issue_id, type, url, created_at")
      .in("issue_id", ids)
      .order("created_at", { ascending: true });
    if (mErr) throw new Error(mErr.message);
    media = m ?? [];
  }

  const map = new Map<number, { images: string[]; audios: string[] }>();
  for (const id of ids) map.set(id, { images: [], audios: [] });
  for (const m of media) {
    const entry = map.get(m.issue_id) || { images: [], audios: [] };
    if (m.type === "image") entry.images.push(m.url);
    else entry.audios.push(m.url);
    map.set(m.issue_id, entry);
  }

  return (issues ?? []).map((i) => ({
    ...i,
    images: map.get(i.id)?.images ?? [],
    audios: map.get(i.id)?.audios ?? [],
  }));
}

export async function updateIssueStatus(issueId: number, status: string) {
  const { error } = await supabase.from("issues").update({ status }).eq("id", issueId);
  if (error) throw new Error(error.message);
}