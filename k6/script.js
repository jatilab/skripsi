import http from 'k6/http'
import { Counter } from 'k6/metrics'

const timeoutErrors = new Counter('timeout_errors')
const connErrors = new Counter('conn_errors')
const serverErrors = new Counter('server_errors')
const clientErrors = new Counter('client_errors')
const status502 = new Counter('http_502')
const status503 = new Counter('http_503')
const status504 = new Counter('http_504')
const statusOther5xx = new Counter('http_other_5xx')
const readyzRequests = new Counter('readyz_requests')
const livezFailures = new Counter('livez_failures')

const baseUrl = `https://${__ENV.APP_DOMAIN}`
const rate = __ENV.RATE || 5
const duration = __ENV.DURATION || '2m'

export const options = {
  scenarios: {
    readyz: {
      executor: 'constant-arrival-rate',
      rate: rate,
      timeUnit: '1s',
      duration: duration,
      preAllocatedVUs: 20,
      maxVUs: 100,
      exec: 'probeReadyz',
      tags: { probe: 'readyz' },
    },
    livez: {
      executor: 'constant-arrival-rate',
      rate: 1,
      timeUnit: '1s',
      duration: duration,
      preAllocatedVUs: 2,
      maxVUs: 5,
      exec: 'probeLivez',
      tags: { probe: 'livez' },
    },
  },
  thresholds: {
    'http_req_failed{probe:readyz}': ['rate<0.01'],
    'http_req_duration{probe:readyz}': ['p(95)<1000'],
  },
}

export function probeReadyz() {
  const res = http.get(`${baseUrl}/readyz`)
  readyzRequests.add(1)
  if (res.error) {
    if (res.error.toLowerCase().includes('timeout')) {
      timeoutErrors.add(1)
    } else {
      connErrors.add(1)
    }
  } else if (res.status >= 500) {
    serverErrors.add(1)
    if (res.status === 502) {
      status502.add(1)
    } else if (res.status === 503) {
      status503.add(1)
    } else if (res.status === 504) {
      status504.add(1)
    } else {
      statusOther5xx.add(1)
    }
  } else if (res.status >= 400) {
    clientErrors.add(1)
  }
}

export function probeLivez() {
  const res = http.get(`${baseUrl}/livez`)
  if (res.status !== 200) {
    livezFailures.add(1)
  }
}
