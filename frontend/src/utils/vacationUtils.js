export const checkVacationOverlap = (eventDateStr, vacations) => {
  if (!eventDateStr || !vacations || vacations.length === 0) return [];
  
  // Normalizamos la fecha del evento a medianoche
  const eDate = new Date(eventDateStr);
  eDate.setHours(0, 0, 0, 0);
  
  const overlappingMembers = [];

  for (const v of vacations) {
    const start = new Date(v.start_date);
    start.setHours(0, 0, 0, 0);
    
    // Si es un solo día o end_date es nulo, end = start. Si no, tomamos end_date
    const end = (v.is_single_day || !v.end_date) ? new Date(start) : new Date(v.end_date);
    end.setHours(23, 59, 59, 999);
    
    // Verificamos si la fecha del evento cae dentro de las vacaciones
    if (eDate >= start && eDate <= end) {
      if (!overlappingMembers.includes(v.member_name)) {
        overlappingMembers.push(v.member_name);
      }
    }
  }

  return overlappingMembers;
};
