export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const DEFAULT_SIMULATION_VALUES = {
  rainfall: 45,
  temperature: 30,
  humidity: 70,
};

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function buildSimulationPayload(data = {}) {
  const rainfall = toNumber(data.rainfall, DEFAULT_SIMULATION_VALUES.rainfall);
  const temperature = toNumber(
    data.temperature,
    DEFAULT_SIMULATION_VALUES.temperature
  );
  const humidity = toNumber(
    data.humidity,
    DEFAULT_SIMULATION_VALUES.humidity
  );

  return {
    features: [rainfall, temperature, humidity],
  };
}

export async function simulate(data = {}) {
  if (!BACKEND_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }

  const payload = buildSimulationPayload(data);
  console.log("Simulate payload:", payload);

  try {
    const res = await fetch(`${BACKEND_URL}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Simulate request failed (${res.status}): ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Error in API call:", err);
    throw err;
  }
}
