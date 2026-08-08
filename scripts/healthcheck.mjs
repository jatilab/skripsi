try {
  const res = await fetch(`http://127.0.0.1:${process.env.PORT ?? 3000}/livez`)
  if (!res.ok) process.exit(1)
} catch {
  process.exit(1)
}
