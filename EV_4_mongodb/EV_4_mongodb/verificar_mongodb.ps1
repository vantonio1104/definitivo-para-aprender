# ================================================================
#  verificar_mongodb.ps1 — Script de diagnóstico rápido
#  ComercioTech · Evaluación 4
#
#  EJECUTAR DESDE POWERSHELL (no requiere admin para la mayoría de checks):
#    .\verificar_mongodb.ps1
#
#  QUÉ VERIFICA:
#  - Versión de mongod instalada
#  - Estado del servicio Windows
#  - Puerto 27017 escuchando
#  - Acceso al directorio de datos
#  - Log de MongoDB (últimas 10 líneas)
#  - Conectividad básica con mongosh
# ================================================================

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DIAGNÓSTICO — MongoDB ComercioTech" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ── 1. Versión de mongod ──────────────────────
Write-Host "[CHECK 1] Versión de mongod:" -ForegroundColor Yellow
try {
    $ver = & mongod --version 2>&1
    $ver | Select-String "db version" | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
} catch {
    Write-Host "  ❌ mongod no encontrado en PATH" -ForegroundColor Red
}

# ── 2. Estado del servicio Windows ───────────
Write-Host ""
Write-Host "[CHECK 2] Estado del servicio 'MongoDB':" -ForegroundColor Yellow
$svc = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($svc) {
    $color = if ($svc.Status -eq "Running") { "Green" } else { "Red" }
    Write-Host "  Estado:     $($svc.Status)" -ForegroundColor $color
    Write-Host "  Inicio:     $($svc.StartType)"
    Write-Host "  Nombre:     $($svc.DisplayName)"
} else {
    Write-Host "  ❌ Servicio 'MongoDB' no encontrado" -ForegroundColor Red
}

# ── 3. Puerto 27017 ──────────────────────────
Write-Host ""
Write-Host "[CHECK 3] Puerto 27017 TCP:" -ForegroundColor Yellow
$puerto = netstat -an 2>&1 | findstr ":27017"
if ($puerto) {
    $puerto | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
    if ($puerto -match "0\.0\.0\.0:27017") {
        Write-Host "  ⚠️  ADVERTENCIA: MongoDB expuesto en todas las IPs (0.0.0.0)" -ForegroundColor Yellow
        Write-Host "     Ajustar bindIp: 127.0.0.1 en mongod.cfg" -ForegroundColor Yellow
    }
    if ($puerto -match "127\.0\.0\.1:27017") {
        Write-Host "  ✅ Correcto: solo escucha en localhost (127.0.0.1)" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ Puerto 27017 no está escuchando — ¿servicio detenido?" -ForegroundColor Red
}

# ── 4. Directorios de datos ───────────────────
Write-Host ""
Write-Host "[CHECK 4] Directorios de datos y logs:" -ForegroundColor Yellow
@{
    "C:\data\db"        = "Datos de MongoDB"
    "C:\data\log"       = "Logs del servidor"
    "C:\backups\mongodb"= "Backups automáticos"
}.GetEnumerator() | ForEach-Object {
    $existe = Test-Path $_.Key
    $sym = if ($existe) { "✅" } else { "❌" }
    $color = if ($existe) { "Green" } else { "Red" }
    Write-Host "  $sym $($_.Key)  ($($_.Value))" -ForegroundColor $color
}

# ── 5. Últimas líneas del log ─────────────────
Write-Host ""
Write-Host "[CHECK 5] Últimas 10 líneas del log de MongoDB:" -ForegroundColor Yellow
$logPath = "C:\data\log\mongod.log"
if (Test-Path $logPath) {
    Get-Content $logPath -Tail 10 | ForEach-Object {
        $color = if ($_ -match '"s":"E"') { "Red" } `
            elseif ($_ -match '"s":"W"') { "Yellow" } `
            else { "Gray" }
        Write-Host "  $_" -ForegroundColor $color
    }
} else {
    Write-Host "  ⚠️  Log no encontrado en: $logPath" -ForegroundColor Yellow
}

# ── 6. Reglas de Firewall ─────────────────────
Write-Host ""
Write-Host "[CHECK 6] Reglas de Firewall para MongoDB:" -ForegroundColor Yellow
$reglas = Get-NetFirewallRule -DisplayName "MongoDB*" -ErrorAction SilentlyContinue
if ($reglas) {
    $reglas | Select-Object DisplayName, Action, Enabled | ForEach-Object {
        $color = if ($_.Enabled -eq "True") { "Green" } else { "Yellow" }
        Write-Host "  [$($_.Action)] $($_.DisplayName) — Habilitada: $($_.Enabled)" -ForegroundColor $color
    }
} else {
    Write-Host "  ⚠️  No hay reglas de Firewall para MongoDB" -ForegroundColor Yellow
    Write-Host "     Ejecutar setup_entorno.ps1 para configurarlas" -ForegroundColor Yellow
}

# ── 7. Ping a MongoDB ─────────────────────────
Write-Host ""
Write-Host "[CHECK 7] Ping a MongoDB (sin autenticación):" -ForegroundColor Yellow
try {
    $ping = & mongosh --eval "db.adminCommand({ping:1})" --quiet 2>&1
    if ($ping -match "ok.*1" -or $ping -match '"ok" : 1') {
        Write-Host "  ✅ MongoDB responde: { ok: 1 }" -ForegroundColor Green
    } elseif ($ping -match "Authentication failed" -or $ping -match "Unauthorized") {
        Write-Host "  ✅ MongoDB responde (autenticación requerida — correcto)" -ForegroundColor Green
    } else {
        Write-Host "  Respuesta: $ping" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ❌ No se pudo conectar a MongoDB: $_" -ForegroundColor Red
}

# ── RESUMEN ───────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  COMANDOS ÚTILES:" -ForegroundColor Cyan
Write-Host "  Iniciar servicio:    Start-Service -Name MongoDB" -ForegroundColor Gray
Write-Host "  Detener servicio:    Stop-Service -Name MongoDB" -ForegroundColor Gray
Write-Host "  Reiniciar servicio:  Restart-Service -Name MongoDB" -ForegroundColor Gray
Write-Host "  Ver log en vivo:     Get-Content C:\data\log\mongod.log -Wait" -ForegroundColor Gray
Write-Host "  Conectar shell:      mongosh -u comerciotech_app -p --authenticationDatabase comerciotech" -ForegroundColor Gray
Write-Host "  Backup manual:       .\setup_backup.ps1 -SoloEjecutar" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
