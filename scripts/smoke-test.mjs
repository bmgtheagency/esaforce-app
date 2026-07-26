import { spawn } from "node:child_process"
import { setTimeout as wait } from "node:timers/promises"

const port = 3100
const baseUrl = `http://127.0.0.1:${port}`
const adminPin = process.env.TEST_ADMIN_PIN

if (!adminPin) {
  throw new Error("TEST_ADMIN_PIN is required")
}

const server = spawn(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["run", "start", "--", "-H", "127.0.0.1", "-p", String(port)],
  {
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  },
)

let serverOutput = ""
server.stdout.on("data", (chunk) => {
  serverOutput += chunk
})
server.stderr.on("data", (chunk) => {
  serverOutput += chunk
})

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
    } catch {}
    await wait(500)
  }

  throw new Error(`Server did not become ready.\n${serverOutput}`)
}

async function jsonRequest(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init)
  const data = await response.json()
  return { response, data }
}

try {
  await waitForServer()

  const home = await fetch(baseUrl)
  const html = await home.text()
  if (!home.ok || !html.includes("ESAFORCE")) {
    throw new Error("Home page did not render the ESAFORCE app")
  }

  const orderPayload = {
    customerName: "Codex Smoke Test",
    phone: "+212 600 000 000",
    fulfillment: "pickup",
    pickupTime: "As soon as possible",
    notes: "Automated deployment verification",
    language: "en",
    items: [
      { productId: "protein-iced-latte", quantity: 1 },
      {
        productId: "custom-drink",
        quantity: 1,
        selections: {
          size: "medium",
          base: "skim-milk",
          coffee: "double",
          protein: "whey-vanilla",
          fruit: "none-fruit",
          flavor: "no-flavor",
          boost: "no-boost",
        },
      },
    ],
    subtotal: 86,
    total: 86,
  }

  const tampered = await jsonRequest("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...orderPayload, subtotal: 1, total: 1 }),
  })
  if (tampered.response.status !== 409) {
    throw new Error("Server accepted a client-tampered order total")
  }

  const created = await jsonRequest("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  })
  if (!created.response.ok || !created.data.orderCode) {
    throw new Error(`Order creation failed: ${JSON.stringify(created.data)}`)
  }

  const orderCode = created.data.orderCode
  const tracked = await jsonRequest(`/api/orders/${orderCode}`)
  if (
    !tracked.response.ok ||
    tracked.data.status !== "received" ||
    Number(tracked.data.total) !== 86
  ) {
    throw new Error(`Order tracking failed: ${JSON.stringify(tracked.data)}`)
  }

  const rejectedAdmin = await jsonRequest("/api/admin/orders", {
    headers: { "x-admin-pin": "WRONG-PIN" },
  })
  if (rejectedAdmin.response.status !== 401) {
    throw new Error("Kitchen API accepted an incorrect PIN")
  }

  const kitchen = await jsonRequest("/api/admin/orders", {
    headers: { "x-admin-pin": adminPin },
  })
  const storedOrder = Array.isArray(kitchen.data)
    ? kitchen.data.find((order) => order.order_code === orderCode)
    : null
  const customItem = storedOrder?.order_items?.find(
    (item) => item.name === "My ESAFORCE Mix",
  )

  if (
    !kitchen.response.ok ||
    !storedOrder ||
    customItem?.unit_price !== 44 ||
    customItem?.selections?.protein !== "Vanilla whey · 30 g"
  ) {
    throw new Error(`Kitchen order data is incomplete: ${JSON.stringify(kitchen.data)}`)
  }

  const updated = await jsonRequest("/api/admin/orders", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-pin": adminPin,
    },
    body: JSON.stringify({ orderCode, status: "preparing" }),
  })
  if (!updated.response.ok || updated.data.status !== "preparing") {
    throw new Error(`Kitchen status update failed: ${JSON.stringify(updated.data)}`)
  }

  const trackedAfterUpdate = await jsonRequest(`/api/orders/${orderCode}`)
  if (
    !trackedAfterUpdate.response.ok ||
    trackedAfterUpdate.data.status !== "preparing"
  ) {
    throw new Error("Customer tracking did not receive the kitchen status update")
  }

  console.log(JSON.stringify({
    home: "ok",
    tamperProtection: "ok",
    orderCode,
    storedTotal: Number(tracked.data.total),
    customDrinkPrice: Number(customItem.unit_price),
    wrongPinRejected: true,
    finalStatus: trackedAfterUpdate.data.status,
  }))
} finally {
  server.kill("SIGTERM")
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    wait(3000),
  ])
}
