const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatSessionDateTime(date: Date) {
  return dateTimeFormat.format(date);
}
