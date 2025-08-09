export function navigateDate(
  currentDate: Date,
  direction: "prev" | "next",
  view: "day" | "week" | "month"
): Date {
  const newDate = new Date(currentDate);

  if (view === "day") {
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
  } else if (view === "week") {
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
  } else if (view === "month") {
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
  }

  return newDate;
}

export function getWeekDates(date: Date): Date[] {
  const week = [];
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek);
    weekDate.setDate(startOfWeek.getDate() + i);
    week.push(weekDate);
  }
  return week;
}

export function getMonthDays(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: (Date | null)[] = [];

  for (
    let i = 0;
    i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1);
    i++
  ) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}