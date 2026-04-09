export const prerender = false;

import type { APIRoute } from "astro";
import * as v from "valibot";
import nodemailer from "nodemailer";
import { config } from "@/config";

const MIN_SUBMIT_TIME_MS = 10000;

const ContactSchema = v.object({
  firstName: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(2, "Vorname ist zu kurz"),
  ),
  lastName: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(2, "Nachname ist zu kurz"),
  ),
  email: v.pipe(v.string(), v.trim(), v.email("Ungültige E-Mail-Adresse")),
  phone: v.optional(v.pipe(v.string(), v.trim())),
  message: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(10, "Nachricht ist zu kurz"),
  ),
  _gotcha: v.pipe(v.string(), v.maxLength(0)),
  _timestamp: v.pipe(v.string(), v.minLength(1)),
});

export const POST: APIRoute = async ({ request }) => {
  const json = (key: string, value: string) =>
    Response.json({ [key]: value }, { status: key === "error" ? 400 : 200 });

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return json("error", "Ungültige Anfrage.");
  }

  const raw = {
    firstName: data.get("firstName")?.toString() ?? "",
    lastName: data.get("lastName")?.toString() ?? "",
    email: data.get("email")?.toString() ?? "",
    phone: data.get("phone")?.toString() ?? "",
    message: data.get("message")?.toString() ?? "",
    _gotcha: data.get("_gotcha")?.toString() ?? "",
    _timestamp: data.get("_timestamp")?.toString() ?? "",
  };

  // Honeypot
  if (raw._gotcha) {
    return json("success", "Nachricht wurde gesendet.");
  }

  // Time-based check
  const elapsed = Date.now() - Number(raw._timestamp);
  if (isNaN(elapsed) || elapsed < MIN_SUBMIT_TIME_MS) {
    return json("error", "Bitte versuche es in wenigen Sekunden erneut.");
  }

  // Validation
  const result = v.safeParse(ContactSchema, raw);
  if (!result.success) {
    const firstIssue = result.issues[0];
    return json("error", firstIssue.message);
  }

  const { firstName, lastName, email, phone, message } = result.output;
  const fullName = `${firstName} ${lastName}`;

  // Send mail
  if (
    !config.smtp.host ||
    !config.smtp.user ||
    !config.smtp.pass ||
    !config.smtp.from ||
    !config.smtp.to
  ) {
    return json("error", "SMTP ist nicht konfiguriert.");
  }

  let transporter: nodemailer.Transporter;
  try {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
    await transporter.verify();
  } catch (e) {
    console.error("SMTP connection failed:", e);
    return json("error", "Mailserver ist nicht erreichbar.");
  }

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: config.smtp.to,
      replyTo: email,
      subject: `Kontaktanfrage von ${fullName}`,
      text: [
        `Name: ${fullName}`,
        `E-Mail: ${email}`,
        phone ? `Telefon: ${phone}` : null,
        "",
        message,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    });
  } catch (e) {
    console.error("Mail send failed:", e);
    return json("error", "Nachricht konnte nicht gesendet werden.");
  }

  return json("success", "Nachricht wurde gesendet.");
};
