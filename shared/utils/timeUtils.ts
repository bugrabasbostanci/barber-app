/**
 * Time utility functions for the barber appointment system
 * Consolidates time-related operations from existing utilities
 */

// Re-export time slot generation from existing lib
export * from "@/lib/utils/dates/time-slots";

// Additional time utilities
export interface TimeRange {
  start: string;
  end: string;
}

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

export function addMinutesToTime(
  timeStr: string,
  minutesToAdd: number
): string {
  const totalMinutes = timeToMinutes(timeStr) + minutesToAdd;
  return minutesToTime(totalMinutes);
}

export function subtractMinutesFromTime(
  timeStr: string,
  minutesToSubtract: number
): string {
  const totalMinutes = timeToMinutes(timeStr) - minutesToSubtract;
  return minutesToTime(Math.max(0, totalMinutes));
}

export function getTimeDifferenceInMinutes(
  startTime: string,
  endTime: string
): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

export function isTimeAfter(time1: string, time2: string): boolean {
  return timeToMinutes(time1) > timeToMinutes(time2);
}

export function isTimeBefore(time1: string, time2: string): boolean {
  return timeToMinutes(time1) < timeToMinutes(time2);
}

export function isTimeEqual(time1: string, time2: string): boolean {
  return timeToMinutes(time1) === timeToMinutes(time2);
}

export function isTimeInRange(
  time: string,
  startTime: string,
  endTime: string
): boolean {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

export function doTimeRangesOverlap(
  range1: TimeRange,
  range2: TimeRange
): boolean {
  const start1 = timeToMinutes(range1.start);
  const end1 = timeToMinutes(range1.end);
  const start2 = timeToMinutes(range2.start);
  const end2 = timeToMinutes(range2.end);

  return start1 < end2 && start2 < end1;
}

export function mergeTimeRanges(ranges: TimeRange[]): TimeRange[] {
  if (ranges.length <= 1) return ranges;

  // Sort by start time
  const sorted = [...ranges].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
  );
  const merged: TimeRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (
      doTimeRangesOverlap(last, current) ||
      timeToMinutes(last.end) === timeToMinutes(current.start)
    ) {
      // Merge overlapping ranges
      last.end = isTimeAfter(current.end, last.end) ? current.end : last.end;
    } else {
      merged.push(current);
    }
  }

  return merged;
}

export function generateTimeRange(
  startTime: string,
  endTime: string,
  intervalMinutes: number
): string[] {
  const times: string[] = [];
  let currentTime = startTime;

  while (
    isTimeBefore(currentTime, endTime) ||
    isTimeEqual(currentTime, endTime)
  ) {
    times.push(currentTime);
    currentTime = addMinutesToTime(currentTime, intervalMinutes);
  }

  return times;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

export function getTimeRangeDuration(
  startTime: string,
  endTime: string
): string {
  const minutes = getTimeDifferenceInMinutes(startTime, endTime);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} dakika`;
  } else if (remainingMinutes === 0) {
    return `${hours} saat`;
  } else {
    return `${hours} saat ${remainingMinutes} dakika`;
  }
}

export function roundTimeToInterval(
  timeStr: string,
  intervalMinutes: number
): string {
  const minutes = timeToMinutes(timeStr);
  const rounded = Math.round(minutes / intervalMinutes) * intervalMinutes;
  return minutesToTime(rounded);
}

export function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export function isCurrentTimeBetween(
  startTime: string,
  endTime: string
): boolean {
  const currentTime = getCurrentTime();
  return isTimeInRange(currentTime, startTime, endTime);
}

export function getNextAvailableTime(
  currentTime: string,
  intervalMinutes: number
): string {
  return addMinutesToTime(currentTime, intervalMinutes);
}

export function getPreviousAvailableTime(
  currentTime: string,
  intervalMinutes: number
): string {
  return subtractMinutesFromTime(currentTime, intervalMinutes);
}
