"use client";
export default function Footer() {
  return (
    <footer className="mt-10 border-t">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Samadhaan Setu. All rights reserved.
      </div>
    </footer>
  );
}