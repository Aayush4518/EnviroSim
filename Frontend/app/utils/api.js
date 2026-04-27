export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:6969";

const DEFAULT_SIMULATION_VALUES = {
  rainfall: 45,
  temperature: 28,
  pollution: 50,
  vegetation: 60,
  month: new Date().getMonth() + 1,
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
  const pollution = toNumber(
    data.pollution ?? data.humidity,
    DEFAULT_SIMULATION_VALUES.pollution
  );
  const vegetation = toNumber(
    data.vegetation,
    DEFAULT_SIMULATION_VALUES.vegetation
  );
  const month = toNumber(data.month, DEFAULT_SIMULATION_VALUES.month);

  return {
    features: [rainfall, temperature, pollution],
    rainfall,
    temperature,
    pollution,
    vegetation,
    month,
  };
}

export async function simulate(data = {}) {
  const payload = buildSimulationPayload(data);

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
