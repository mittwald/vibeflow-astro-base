"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [timestamp, setTimestamp] = useState(() => Date.now().toString());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.currentTarget);
    formData.set("_timestamp", timestamp);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.success);
        (e.target as HTMLFormElement).reset();
        setTimestamp(Date.now().toString());
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage("Ein Fehler ist aufgetreten.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            Vorname <span className="text-destructive">*</span>
          </Label>
          <Input id="firstName" name="firstName" required minLength={2} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Nachname <span className="text-destructive">*</span>
          </Label>
          <Input id="lastName" name="lastName" required minLength={2} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            E-Mail-Adresse <span className="text-destructive">*</span>
          </Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefonnummer</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Nachricht <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={10}
          className="min-h-[15rem]"
        />
      </div>

      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
      </div>

      <input type="hidden" name="_timestamp" value={timestamp} />

      <Button type="submit" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? "Wird gesendet…" : "Nachricht senden"}
      </Button>

      <p className="text-muted-foreground text-sm">
        Detaillierte Informationen zum Umgang mit Nutzerdaten findest du in
        unserer{" "}
        <a
          href="/datenschutz"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground underline underline-offset-4"
        >
          Datenschutzerklärung
        </a>
        .
      </p>

      {status === "success" && (
        <p className="text-success text-sm">{message}</p>
      )}
      {status === "error" && (
        <p className="text-destructive text-sm">{message}</p>
      )}
    </form>
  );
}
