/**
 * Нагрузочный smoke: /api/health, /api/config, ранняя валидация /api/generate-kp (без PDF).
 * Требуется установленный k6: https://k6.io/docs/get-started/installation/
 *
 * Запуск (сервер уже слушает порт):
 *   pnpm run k6:smoke
 * Другой хост:
 *   BASE_URL=https://freonn.pro pnpm run k6:smoke
 */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    health: {
      executor: "constant-vus",
      vus: 10,
      duration: "30s",
      gracefulStop: "5s",
      exec: "hitHealth",
    },
    config: {
      executor: "constant-vus",
      vus: 5,
      duration: "30s",
      gracefulStop: "5s",
      exec: "hitConfig",
    },
    kp_validation: {
      executor: "constant-vus",
      vus: 2,
      duration: "25s",
      gracefulStop: "5s",
      startTime: "8s",
      exec: "hitGenerateKpValidation",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.1"],
    http_req_duration: ["p(95)<3000"],
  },
};

const BASE = __ENV.BASE_URL || "http://127.0.0.1:3000";

export function hitHealth() {
  const res = http.get(`${BASE}/api/health`);
  check(res, { "health 200": (r) => r.status === 200 });
  sleep(0.25);
}

export function hitConfig() {
  const res = http.get(`${BASE}/api/config`);
  check(res, { "config 200": (r) => r.status === 200 });
  sleep(0.25);
}

/** Пустое тело — сервер отвечает 400 до тяжёлой генерации; при лимите возможен 429. */
export function hitGenerateKpValidation() {
  const res = http.post(`${BASE}/api/generate-kp`, JSON.stringify({}), {
    headers: { "Content-Type": "application/json" },
  });
  check(res, {
    "kp early exit": (r) => r.status === 400 || r.status === 429 || r.status === 200,
  });
  sleep(0.8);
}
