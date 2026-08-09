import fs from 'node:fs'

const duringFile = process.argv[2] ?? 'k6/k6-results.json'
const baselineFile = process.argv[3] ?? 'k6/k6-baseline.json'
const TAG = '{probe:readyz}'

function summarize(file) {
  if (!fs.existsSync(file)) return null
  const m = JSON.parse(fs.readFileSync(file)).metrics
  const counter = (name) => m[name]?.count ?? 0
  const pick = (name) => m[name + TAG] ?? m[name]
  const failed = pick('http_req_failed')?.value ?? 0
  const dur = pick('http_req_duration') ?? {}
  return {
    reqs: counter('readyz_requests') || m.http_reqs.count,
    failedRate: failed * 100,
    p90: Math.round(dur['p(90)']),
    p95: Math.round(dur['p(95)']),
    max: Math.round(dur.max),
    timeouts: counter('timeout_errors'),
    conn: counter('conn_errors'),
    s502: counter('http_502'),
    s503: counter('http_503'),
    s504: counter('http_504'),
    sOther5xx: counter('http_other_5xx'),
    livez: counter('livez_failures'),
    client: counter('client_errors'),
  }
}

function cell(v, unit = '') {
  return v === null || v === undefined
    ? '—'
    : typeof v === 'number'
      ? `${v}${unit}`
      : `${v}${unit}`
}

const during = summarize(duringFile)
const baseline = summarize(baselineFile)
const rows = [
  ['Total requests', during?.reqs, baseline?.reqs],
  [
    'Failure rate',
    during ? `${during.failedRate.toFixed(2)}%` : null,
    baseline ? `${baseline.failedRate.toFixed(2)}%` : null,
  ],
  ['Latency p90', cell(during?.p90, ' ms'), cell(baseline?.p90, ' ms')],
  ['Latency p95', cell(during?.p95, ' ms'), cell(baseline?.p95, ' ms')],
  ['Latency max', cell(during?.max, ' ms'), cell(baseline?.max, ' ms')],
  ['Timeout errors', during?.timeouts, baseline?.timeouts],
  ['Connection errors', during?.conn, baseline?.conn],
  ['HTTP 502', during?.s502, baseline?.s502],
  ['HTTP 503', during?.s503, baseline?.s503],
  ['HTTP 504', during?.s504, baseline?.s504],
  ['Other 5xx', during?.sOther5xx, baseline?.sOther5xx],
  ['Livez failures', during?.livez, baseline?.livez],
  ['4xx errors', during?.client, baseline?.client],
]

const table = [
  '## k6 Availability Check',
  '',
  `| Metrics | During deployment | Steady state |`,
  `|---|---|---|`,
  ...rows.map(([name, d, b]) => `| ${name} | ${cell(d)} | ${cell(b)} |`),
  '',
].join('\n')

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, table)
} else {
  console.log(table)
}
