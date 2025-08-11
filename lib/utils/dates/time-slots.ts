import { BUSINESS_RULES } from "@/lib/constants";

export interface TimeSlot {
  start: string;
  end: string;
  full: string;
}

export function generateTimeSlots(): TimeSlot[] {
  const slots = [];
  let hours = 9;
  let minutes = 30;

  while (hours < 21 || (hours === 21 && minutes <= 30)) {
    const startTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    let endMinutes = minutes + BUSINESS_RULES.APPOINTMENT_DURATION;
    let endHours = hours;
    if (endMinutes >= 60) {
      endHours += Math.floor(endMinutes / 60);
      endMinutes = endMinutes % 60;
    }
    const endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;

    slots.push({
      start: startTime,
      end: endTime,
      full: `${startTime} - ${endTime}`,
    });

    minutes += BUSINESS_RULES.APPOINTMENT_DURATION;
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
    }
  }

  return slots;
}