const formatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })

export function formatLastPlayed(timestamp?: number) {
  return timestamp ? formatter.format(timestamp) : 'Never played'
}
