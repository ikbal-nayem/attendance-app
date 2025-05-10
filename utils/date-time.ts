import { isNull } from './validation';

export const parseDate = (dateString: string) => {
  if (isNull(dateString)) return undefined;
  const [datePart, timePart] = dateString?.split(' ');
  const [day, month, year] = datePart?.split('/').map(Number);
  const [time, modifier] = timePart?.split(' ');
  let [hours, minutes, seconds] = time?.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return new Date(year, month - 1, day, hours, minutes, seconds);
};

export const parseResponseDate = (dateString?: string) => {
  if (!dateString) return new Date();
  const [day, month, year] = dateString?.split('/').map(Number);
  return new Date(year, month - 1, day);
};

export const parseResponseTime = (timeString?: string) => {
  // Time string response format: "17:19:24" (24-hour format)
  if (!timeString) return undefined;
  const [hours, minutes, seconds] = timeString?.split(':').map(Number);
  return new Date(0, 0, 0, hours, minutes, seconds).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const generateRequestDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const getDuration = (startDate: Date, endDate: Date) => {
  const diff = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
};
