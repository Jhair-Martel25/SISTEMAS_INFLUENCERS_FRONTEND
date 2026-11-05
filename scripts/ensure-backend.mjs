import { spawn } from 'node:child_process'
import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BACKEND_PORT = 3000
const BACKEND_CANDIDATE_PATHS = [
  path.resolve(__dirname, '../../../BACKEND_SP/SISTEMA_INFLUENCER_BACKEND'),
  path.resolve('C:/Users/elcha/Downloads/BACKEND_SP/SISTEMA_INFLUENCER_BACKEND'),
  path.resolve(__dirname, '../../../sistema-influencer-backend'),
  path.resolve(__dirname, '../../../BACKEND/SISTEMA_INFLUENCER_BACKEND'),
]

function checkBackendOnline(port = BACKEND_PORT, timeoutMs = 800) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port,
        path: '/ubigeo/autocompletar?q=lima&limite=1',
        timeout: timeoutMs,
      },
      (res) => {
        resolve(res.statusCode !== undefined)
      },
    )

    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
  })
}

async function waitForBackend(port = BACKEND_PORT, maxSeconds = 12) {
  const start = Date.now()
  while (Date.now() - start < maxSeconds * 1000) {
    const isOnline = await checkBackendOnline(port, 500)
    if (isOnline) return true
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}

async function main() {
  const isAlreadyOnline = await checkBackendOnline(BACKEND_PORT, 600)
  if (isAlreadyOnline) {
    console.log(`\x1b[32m[Backend]\x1b[0m Servidor backend ya esta en linea en http://localhost:${BACKEND_PORT}`)
    return
  }

  const backendDir = BACKEND_CANDIDATE_PATHS.find((p) => fs.existsSync(p))

  if (!backendDir) {
    console.warn(
      `\x1b[33m[Backend Warning]\x1b[0m No se encontro la carpeta del backend en las rutas esperadas. Verifica que el backend este corriendo manualmente en http://localhost:${BACKEND_PORT}`,
    )
    return
  }

  console.log(`\x1b[36m[Backend]\x1b[0m Iniciando backend automaticamente desde: ${backendDir}...`)

  const mainJsPath = path.join(backendDir, 'dist', 'src', 'main.js')
  let child

  if (process.platform === 'win32') {
    if (fs.existsSync(mainJsPath)) {
      child = spawn(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          `Start-Process -FilePath "node.exe" -ArgumentList "dist/src/main.js" -WorkingDirectory "${backendDir}" -WindowStyle Hidden`,
        ],
        { stdio: 'ignore', windowsHide: true },
      )
    } else {
      child = spawn(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          `Start-Process -FilePath "npm.cmd" -ArgumentList "run start:dev" -WorkingDirectory "${backendDir}" -WindowStyle Hidden`,
        ],
        { stdio: 'ignore', windowsHide: true },
      )
    }
  } else {
    if (fs.existsSync(mainJsPath)) {
      child = spawn(process.execPath, [mainJsPath], {
        cwd: backendDir,
        detached: true,
        stdio: 'ignore',
      })
    } else {
      child = spawn('npm', ['run', 'start:dev'], {
        cwd: backendDir,
        detached: true,
        stdio: 'ignore',
      })
    }
    child.unref()
  }

  const ok = await waitForBackend(BACKEND_PORT, 10)
  if (ok) {
    console.log(`\x1b[32m[Backend]\x1b[0m ✓ Backend iniciado exitosamente y respondiendo en http://localhost:${BACKEND_PORT}`)
  } else {
    console.warn(`\x1b[33m[Backend]\x1b[0m El backend fue lanzado (PID: ${child.pid}), completando su arranque en segundo plano...`)
  }
}

main().catch((err) => {
  console.error('[Backend Init Error]:', err)
})
