import { parseLocalDate } from './dateUtils';

export const OFFICIAL_MEMBERS = ["Pedro", "Pipa", "Alfonso", "Luis"];

/**
 * Devuelve la lista de nombres de integrantes que están de vacaciones en la fecha indicada.
 */
export const checkVacationOverlap = (eventDateStr, vacations) => {
  if (!eventDateStr || !vacations || vacations.length === 0) return [];
  
  const eDate = parseLocalDate(eventDateStr);
  eDate.setHours(0, 0, 0, 0);
  
  const overlappingMembers = [];

  for (const v of vacations) {
    const start = parseLocalDate(v.start_date);
    start.setHours(0, 0, 0, 0);
    
    const end = (v.is_single_day || !v.end_date) ? new Date(start) : parseLocalDate(v.end_date);
    end.setHours(23, 59, 59, 999);
    
    if (eDate >= start && eDate <= end) {
      if (!overlappingMembers.includes(v.member_name)) {
        overlappingMembers.push(v.member_name);
      }
    }
  }

  return overlappingMembers;
};

/**
 * Devuelve los objetos completos de vacaciones que coinciden con un día concreto (Date o string).
 */
export const getVacationsForDay = (day, month, year, vacations = []) => {
  if (!vacations || vacations.length === 0) return [];

  const target = new Date(year, month, day, 12, 0, 0, 0);

  return vacations.filter(v => {
    const start = parseLocalDate(v.start_date);
    start.setHours(0, 0, 0, 0);

    const end = (v.is_single_day || !v.end_date) ? new Date(start) : parseLocalDate(v.end_date);
    end.setHours(23, 59, 59, 999);

    return target >= start && target <= end;
  });
};

/**
 * Comprueba si un rango de vacaciones entra en conflicto con eventos existentes en la agenda.
 */
export const getConflictingEvents = (startDateStr, endDateStr, isSingleDay, events = []) => {
  if (!startDateStr || !events || events.length === 0) return [];

  const start = parseLocalDate(startDateStr);
  start.setHours(0, 0, 0, 0);

  const effectiveEndStr = (isSingleDay || !endDateStr) ? startDateStr : endDateStr;
  const end = parseLocalDate(effectiveEndStr);
  end.setHours(23, 59, 59, 999);

  if (start > end) return [];

  return events.filter(ev => {
    if (!ev.fecha) return false;
    const evDate = parseLocalDate(ev.fecha);
    evDate.setHours(12, 0, 0, 0);
    return evDate >= start && evDate <= end;
  });
};

/**
 * Calcula el número de días de un periodo de vacaciones (inclusive).
 */
export const calculateVacationDays = (startDateStr, endDateStr, isSingleDay) => {
  if (!startDateStr) return 0;
  if (isSingleDay || !endDateStr || startDateStr === endDateStr) return 1;

  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
};

/**
 * Determina si una vacación está actualmente en curso ('active') o próxima ('upcoming').
 */
export const getVacationStatus = (startDateStr, endDateStr, isSingleDay) => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const start = parseLocalDate(startDateStr);
  start.setHours(0, 0, 0, 0);

  const end = (isSingleDay || !endDateStr) ? parseLocalDate(startDateStr) : parseLocalDate(endDateStr);
  end.setHours(23, 59, 59, 999);

  if (today >= start && today <= end) return 'active';
  if (today < start) return 'upcoming';
  return 'past';
};
