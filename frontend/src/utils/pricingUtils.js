/**
 * Utility functions for profitability gradients and pricing benchmarks.
 * 
 * Reglas de Rentabilidad (Acabado Mate Elegante):
 * - Evento con equipo propio (equipo = true): Media objetivo = 750 €
 * - Evento con equipo del cliente (equipo = false): Media objetivo = 600 €
 * - Media general del grupo (Estadísticas): Media objetivo = 700 €
 * 
 * Escala de gradientes mate (sin brillos neón):
 * - Ratio >= +20%: Verde esmeralda mate (#34d399 / #10b981)
 * - 0% <= Ratio < +20%: Verde equilibrado mate (#4ade80)
 * - -15% <= Ratio < 0%: Ámbar mate (#fbbf24)
 * - -30% <= Ratio < -15%: Naranja mate (#fb923c)
 * - Ratio < -30%: Rojo coral mate (#f87171)
 */

export const getProfitabilityGradient = (price, target = 700) => {
  const numPrice = Number(price) || 0;
  const numTarget = Number(target) || 700;

  if (numPrice === 0) {
    return {
      color: '#94a3b8',
      background: 'rgba(148, 163, 184, 0.08)',
      border: 'rgba(148, 163, 184, 0.20)',
      glow: 'none',
      status: 'neutral',
      diff: -numTarget,
      ratio: -1,
      badgeText: 'Sin precio',
    };
  }

  const diff = numPrice - numTarget;
  const ratio = diff / numTarget;

  if (ratio >= 0.20) {
    // Muy por encima: Verde esmeralda mate
    return {
      color: '#34d399',
      background: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.32)',
      glow: 'none',
      status: 'very_high',
      diff,
      ratio,
      badgeText: `+${diff.toLocaleString()} € s/ media`,
    };
  } else if (ratio >= 0) {
    // Igual o por encima de la media: Verde equilibrado mate
    return {
      color: '#4ade80',
      background: 'rgba(74, 222, 128, 0.10)',
      border: 'rgba(74, 222, 128, 0.26)',
      glow: 'none',
      status: 'high',
      diff,
      ratio,
      badgeText: diff === 0 ? 'En la media' : `+${diff.toLocaleString()} € s/ media`,
    };
  } else if (ratio >= -0.15) {
    // Ligeramente por debajo: Ámbar mate
    return {
      color: '#fbbf24',
      background: 'rgba(251, 191, 36, 0.10)',
      border: 'rgba(251, 191, 36, 0.26)',
      glow: 'none',
      status: 'warning',
      diff,
      ratio,
      badgeText: `${diff.toLocaleString()} € s/ media`,
    };
  } else if (ratio >= -0.30) {
    // Por debajo: Naranja mate
    return {
      color: '#fb923c',
      background: 'rgba(251, 146, 60, 0.10)',
      border: 'rgba(251, 146, 60, 0.28)',
      glow: 'none',
      status: 'low',
      diff,
      ratio,
      badgeText: `${diff.toLocaleString()} € s/ media`,
    };
  } else {
    // Muy por debajo: Rojo coral mate
    return {
      color: '#f87171',
      background: 'rgba(248, 113, 113, 0.12)',
      border: 'rgba(248, 113, 113, 0.32)',
      glow: 'none',
      status: 'critical',
      diff,
      ratio,
      badgeText: `${diff.toLocaleString()} € s/ media`,
    };
  }
};

/**
 * Rentabilidad de un evento individual en función de quién aporta el equipo.
 * - equipo === true  -> media objetivo 750 €
 * - equipo === false -> media objetivo 600 €
 */
export const getEventPriceGradient = (presupuesto, equipo) => {
  const target = Boolean(equipo) ? 750 : 600;
  return {
    ...getProfitabilityGradient(presupuesto, target),
    target,
    soundOrigin: Boolean(equipo) ? 'Nosotros' : 'Cliente',
  };
};

/**
 * Rentabilidad de la media general de actuaciones.
 * - Media objetivo = 700 €
 */
export const getAveragePriceGradient = (averagePrice) => {
  return {
    ...getProfitabilityGradient(averagePrice, 700),
    target: 700,
  };
};
