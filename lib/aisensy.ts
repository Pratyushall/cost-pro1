// lib/aisensy.ts
const {
  AISENSY_API_URL,
  AISENSY_API_KEY,
  AISENSY_TEMPLATE_NAME,
  AISENSY_LANGUAGE = "en",
  AISENSY_SOURCE,
  AISENSY_SENDER,
} = process.env;

if (!AISENSY_API_URL || !AISENSY_API_KEY || !AISENSY_TEMPLATE_NAME) {
  // eslint-disable-next-line no-console
  console.warn(
    "[AiSensy] Missing envs. Check AISENSY_API_URL/KEY/TEMPLATE_NAME."
  );
}

export type TemplateParam = { name: string; value: string };

export async function sendOtpViaAiSensy(opts: {
  to: string; // "91XXXXXXXXXX"
  otp: string; // e.g., "1234"
  ttlMinutes: number | string;
}) {
  const { to, otp, ttlMinutes } = opts;

  // Match your template’s variable list/order exactly:
  const parameters: TemplateParam[] = [
    { name: "1", value: otp },
    { name: "2", value: String(ttlMinutes) },
  ];

  // Common payload shape (your dashboard may show slightly different keys)
  const payload: any = {
    destination: to, // "91XXXXXXXXXX"
    template: {
      name: AISENSY_TEMPLATE_NAME,
      language: AISENSY_LANGUAGE,
      parameters,
    },
  };

  // Optional depending on your account settings
  if (AISENSY_SOURCE) payload.source = AISENSY_SOURCE;
  if (AISENSY_SENDER) payload.source = AISENSY_SENDER; // if your account uses "source" for sender number

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Use ONE of these depending on the example in your dashboard:
  headers["Authorization"] = AISENSY_API_KEY as string;
  // headers["authKey"] = AISENSY_API_KEY as string;

  const res = await fetch(AISENSY_API_URL as string, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data?.message === "string" ? data.message : "AiSensy send failed";
    throw new Error(`${msg}: ${res.status} ${res.statusText}`);
  }
  return data;
}
