import type { APIRoute } from "astro";
import nodemailer from "nodemailer";
import * as v from "valibot";
import { config } from "@/config";

export const prerender = false;

const MIN_SUBMIT_TIME_MS = 5000;

const contactSchema = v.object({
  firstName: v.pipe(v.string(), v.minLength(2)),
  lastName: v.pipe(v.string(), v.minLength(2)),
  email: v.pipe(v.string(), v.email()),
  phone: v.optional(v.string()),
  message: v.pipe(v.string(), v.minLength(10)),
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  if (value(formData, "_gotcha")) {
    return json({ success: "Danke für deine Nachricht." });
  }

  const timestamp = Number(value(formData, "_timestamp"));
  if (!timestamp || Date.now() - timestamp < MIN_SUBMIT_TIME_MS) {
    return json(
      { error: "Bitte warte einen Moment und versuche es erneut." },
      400,
    );
  }

  const parsed = v.safeParse(contactSchema, {
    firstName: value(formData, "firstName"),
    lastName: value(formData, "lastName"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    message: value(formData, "message"),
  });

  if (!parsed.success) {
    return json({ error: "Bitte prüfe deine Eingaben." }, 400);
  }

  const smtp = config.smtp;
  if (!smtp.host || !smtp.user || !smtp.pass || !smtp.from || !smtp.to) {
    return json({ error: "SMTP ist nicht konfiguriert." }, 500);
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const { firstName, lastName, email, phone, message } = parsed.output;

  await transporter.sendMail({
    from: smtp.from,
    to: smtp.to,
    replyTo: email,
    subject: `Neue Kontaktanfrage von ${firstName} ${lastName}`,
    text: [
      `Name: ${firstName} ${lastName}`,
      `E-Mail: ${email}`,
      phone ? `Telefon: ${phone}` : undefined,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return json({ success: "Danke für deine Nachricht." });
};
