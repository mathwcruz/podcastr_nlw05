export function convertDurationToTimeString(duration: number): string {
  const hours = Math.floor(duration / 3600); // total de horas
  const minutes = Math.floor((duration % 3600) / 60); //resto da divisao / 60 (1 hora) = retorna o total de minutos do podcast
  const seconds = duration % 60; //resto da divisao em segundos

  const timeString = [hours, minutes, seconds]
    .map(unit => String(unit).padStart(2, "0"))
    .join(":"); //retorno => 01:15:08
  
    return timeString;
};