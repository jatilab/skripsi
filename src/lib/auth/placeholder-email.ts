export function placeholderEmail(username: string): string {
  const domain = window.location.host.replace(/:\d+$/, '')
  return `${username}@${domain.includes('.') ? domain : 'skripsi.local'}`
}
