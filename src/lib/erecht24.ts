const API_BASE = "https://api.e-recht24.de/v1";

interface ERecht24Document {
  html_de: string;
}

async function fetchDocument(
  endpoint: string,
  apiKey: string,
): Promise<string> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      eRecht24: apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `[eRecht24] ${endpoint} failed: ${res.status} ${res.statusText}`,
    );
  }

  const data: ERecht24Document = await res.json();
  return data.html_de;
}

export async function getImpressum(apiKey: string): Promise<string> {
  return fetchDocument("/imprint", apiKey);
}

export async function getDatenschutz(apiKey: string): Promise<string> {
  return fetchDocument("/privacyPolicy", apiKey);
}
