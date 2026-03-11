export function formatUsDateTime(value: string | number | Date): string {
  const d = value instanceof Date ? value : new Date(value)
  const pad = (n: number) => n.toString().padStart(2, '0')

  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const year = d.getFullYear()

  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  const seconds = pad(d.getSeconds())

  return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`
}

