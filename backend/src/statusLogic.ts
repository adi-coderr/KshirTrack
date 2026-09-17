export type HealthStatus = 'safe' | 'warning' | 'spoiling';

export interface EvaluatedStatus {
  temp_status: HealthStatus;
  ph_status: HealthStatus;
  status: HealthStatus;
  estimated_hours_remaining: number;
}

/**
 * Temperature rules:
 * - Safe: 4.0°C – 8.0°C
 * - Warning: 2.0°C – <4.0°C OR >8.0°C – 10.0°C (within 2°C outside safe range)
 * - Spoiling: < 2.0°C OR > 10.0°C
 */
export function evaluateTemperature(tempC: number): HealthStatus {
  if (tempC >= 4.0 && tempC <= 8.0) {
    return 'safe';
  }
  if ((tempC >= 2.0 && tempC < 4.0) || (tempC > 8.0 && tempC <= 10.0)) {
    return 'warning';
  }
  return 'spoiling';
}

/**
 * pH rules:
 * - Safe: >= 6.4
 * - Warning: 6.0 – < 6.4
 * - Spoiling: < 6.0
 */
export function evaluatePH(ph: number): HealthStatus {
  if (ph >= 6.4) {
    return 'safe';
  }
  if (ph >= 6.0 && ph < 6.4) {
    return 'warning';
  }
  return 'spoiling';
}

/**
 * Resolves worst of two statuses
 */
export function worstStatus(statusA: HealthStatus, statusB: HealthStatus): HealthStatus {
  const severity: Record<HealthStatus, number> = {
    safe: 1,
    warning: 2,
    spoiling: 3,
  };
  return severity[statusA] >= severity[statusB] ? statusA : statusB;
}

/**
 * Heuristic for estimated hours remaining.
 * Base duration: 8.0 hours.
 * Time in safe zone elapses at 1x.
 * Time outside safe zone elapses at 2x (or 3x if critically spoiling).
 *
 * @param sessionStartedAt Date session started
 * @param readingsHistory Past readings in current session (chronological)
 * @param currentTemp Current temperature in C
 * @param currentPH Current pH
 */
export function calculateEstimatedHoursRemaining(
  sessionStartedAt: Date,
  readingsHistory: Array<{ timestamp: Date; temperature_c: number; ph: number }>,
  currentTemp: number,
  currentPH: number,
  initialHours: number = 8.0,
  chillingReachedAt?: Date | null
): number {
  // If milk has not reached the 4.0°C - 8.0°C chilling range yet, storage timer hasn't started
  if (!chillingReachedAt) {
    // If milk is spoiled (< 6.0 pH) even before chilling, shelf life is 0
    if (currentPH < 6.0 || currentTemp > 28.0) {
      return 0;
    }
    return initialHours;
  }

  const now = new Date();
  const effectiveStart = new Date(chillingReachedAt);
  const totalElapsedHours = Math.max(0, (now.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60));

  // Filter history to readings recorded since chilling was reached
  const chilledHistory = readingsHistory.filter(
    (r) => new Date(r.timestamp).getTime() >= effectiveStart.getTime()
  );

  if (chilledHistory.length === 0) {
    const decayMultiplier = (currentTemp >= 4.0 && currentTemp <= 8.0) ? 1.0 : 2.0;
    const remaining = initialHours - (totalElapsedHours * decayMultiplier);
    return Math.max(0, Math.round(remaining * 10) / 10);
  }

  // Calculate integrated degradation over chilled readings
  let degradedHours = 0;
  let lastTime = effectiveStart.getTime();

  for (const r of chilledHistory) {
    const rTime = new Date(r.timestamp).getTime();
    const intervalHours = Math.max(0, (rTime - lastTime) / (1000 * 60 * 60));
    const isSafe = r.temperature_c >= 4.0 && r.temperature_c <= 8.0;
    const isCritical = r.temperature_c > 12.0 || r.ph < 5.8;

    const rate = isCritical ? 3.0 : (!isSafe ? 2.0 : 1.0);
    degradedHours += intervalHours * rate;
    lastTime = rTime;
  }

  // Add remaining interval up to now with current reading
  const currentIntervalHours = Math.max(0, (now.getTime() - lastTime) / (1000 * 60 * 60));
  const isCurrentSafe = currentTemp >= 4.0 && currentTemp <= 8.0;
  const isCurrentCritical = currentTemp > 12.0 || currentPH < 5.8;
  const currentRate = isCurrentCritical ? 3.0 : (!isCurrentSafe ? 2.0 : 1.0);
  degradedHours += currentIntervalHours * currentRate;

  // If milk is spoiled (< 6.0 pH), shelf-life drops to 0 immediately
  if (currentPH < 6.0 || currentTemp > 16.0) {
    return 0;
  }

  const remaining = initialHours - degradedHours;
  return Math.max(0, Math.round(remaining * 10) / 10);
}

export function evaluateReading(
  tempC: number,
  ph: number,
  sessionStartedAt: Date,
  chillingReachedAt?: Date | null,
  readingsHistory: Array<{ timestamp: Date; temperature_c: number; ph: number }> = [],
  initialHours: number = 8.0
): EvaluatedStatus {
  const temp_status = evaluateTemperature(tempC);
  const ph_status = evaluatePH(ph);
  const status = worstStatus(temp_status, ph_status);
  const estimated_hours_remaining = calculateEstimatedHoursRemaining(
    sessionStartedAt,
    readingsHistory,
    tempC,
    ph,
    initialHours,
    chillingReachedAt
  );

  return {
    temp_status,
    ph_status,
    status,
    estimated_hours_remaining,
  };
}
