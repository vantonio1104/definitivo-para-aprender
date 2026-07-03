# ================================================================
#  setup_entorno.ps1 — Script de preparación del entorno Windows
#  ComercioTech · Evaluación 4 · Fase 1 y Fase 4
#
#  EJECUTAR COMO ADMINISTRADOR:
#    clic derecho → "Ejecutar con PowerShell como Administrador"
#    o desde PowerShell admin:
#    Set-ExecutionPolicy Bypass -Scope Process
#    .\setup_entorno.ps1
#
#  QUÉ HACE ESTE SCRIPT:
#  1. Verifica versión de Windows y hardware
#  2. Crea los directorios C:\data\db y C:\data\log
#  3. Copia mongod.cfg al directorio de instalación de MongoDB
#  4. Configura permisos de carpetas para el servicio MongoDB
#  5. Configura reglas de Firewall (bloquear puerto 27017 externamente)
#  6. Reinicia el servicio MongoDB
#  7. Verifica que el servicio está corriendo
# ================================================================

$ErrorActionPreference = "Stop"
$mongoVersion = "8.2"
$mongoDir     = "C:\Program Files\MongoDB\Server\$mongoVersion"
$scriptDir    = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SETUP — Entorno MongoDB ComercioTech" -ForegroundColor Cyan
Write-Host "  Script: setup_entorno.ps1" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────
#  PASO 1: Verificar sistema operativo
# ─────────────────────────────────────────────
Write-Host "[1/7] Verificando sistema operativo..." -ForegroundColor Yellow
$sysInfo = Get-ComputerInfo | Select-Object WindowsProductName, OsBuildNumber, OsArchitecture
Write-Host "      SO:           $($sysInfo.WindowsProductName)"
Write-Host "      Build:        $($sysInfo.OsBuildNumber)"
Write-Host "      Arquitectura: $($sysInfo.OsArchitecture)"

$ram = (Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum / 1GB
$cpu = (Get-WmiObject Win32_Processor).Name
$libre = [math]::Round((Get-PSDrive C).Free / 1GB, 2)

Write-Host "      CPU:          $cpu"
Write-Host "      RAM:          $([math]::Round($ram, 2)) GB"
Write-Host "      Disco libre:  $libre GB en C:"
Write-Host "✅ [1/7] Sistema verificado" -ForegroundColor Green

# ─────────────────────────────────────────────
#  PASO 2: Verificar instalación de MongoDB
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "[2/7] Verificando instalación de MongoDB..." -ForegroundColor Yellow

$mongodPath = "$mongoDir\bin\mongod.exe"
if (-not (Test-Path $mongodPath)) {
    Write-Host "❌ MongoDB no encontrado en: $mongodPath" -ForegroundColor Red
    Write-Host "   Instalar MongoDB 8.x desde: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

$version = & $mongodPath --version 2>&1 | Select-String "db version"
Write-Host "      Versión: $version"
Write-Host "✅ [2/7] MongoDB detectado correctamente" -ForegroundColor Green

# ─────────────────────────────────────────────
#  PASO 3: Crear directorios de datos y logs
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "[3/7] Creando directorios de datos y logs..." -ForegroundColor Yellow

$directorios = @("C:\data\db", "C:\data\log", "C:\backups\mongodb", "C:\scripts\mongodb")
foreach ($dir in $directorios) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "      ✓ $dir"
}
Write-Host "✅ [3/7] Directorios creados" -ForegroundColor Green

# ─────────────────────────────────────────────
#  PASO 4: Copiar mongod.cfg
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "[4/7] Copiando mongod.cfg al directorio de MongoDB..." -ForegroundColor Yellow

$cfgOrigen  = Join-Path $scriptDir "mongod.cfg"
$cfgDestino = "$mongoDir\bin\mongod.cfg"

if (Test-Path $cfgOrigen) {
    # Hacer backup del cfg existente
    if (Test-Path $cfgDestino) {
        $backup = "$cfgDestino.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item $cfgDestino $backup
        Write-Host "      Backup del cfg anterior guardado en: $backup"
    }
    Copy-Item $cfgOrigen $cfgDestino -Force
    Write-Host "      Archivo copiado: $cfgOrigen → $cfgDestino"
    Write-Host "✅ [4/7] mongod.cfg copiado correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  [4/7] mongod.cfg no encontrado en $cfgOrigen" -ForegroundColor Yellow
    Write-Host "   Asegúrate de ejecutar este script desde la carpeta EV_4_mongodb"
}

# ─────────────────────────────────────────────
#  PASO 5: Configurar permisos en C:\data
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "[5/7] Configurando permisos para el servicio MongoDB..." -ForegroundColor Yellow

try {
    $acl  = Get-Acl "C:\data"
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        "NETWORK SERVICE",
        "FullControl",
        "ContainerInherit,ObjectInherit",
        "None",
        "Allow"
    )
    $acl.SetAccessRule($rule)
    Set-Acl "C:\data" $acl
    Write-Host "      Permisos de NETWORK SERVICE aplicados a C:\data"
    Write-Host "✅ [5/7] Permisos configurados" -ForegroundColor Green
} catch {
    Write-Host "⚠️  [5/7] No se pudieron configurar permisos: $_" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────
#  PASO 6: Reglas de Firewall
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "[6/7] Configurando reglas de Firewall para puerto 27017..." -ForegroundColor Yellow

# Eliminar reglas previas de MongoDB si existen
Get-NetFirewallRule -DisplayName "MongoDB*" -ErrorAction SilentlyContinue |
    Remove-NetFirewallRule -ErrorAction SilentlyContinue

# Regla 1: BLOQUEAR acceso externo al puerto 27017
New-NetFirewallRule `
    -DisplayName "MongoDB - Bloquear acceso externo" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 27017 `
    -Action Block `
    -Profile Any `
    -Description "Bloquea conexiones externas al puerto MongoDB 27017" `
    | Out-Null
Write-Host "      ✓ Regla BLOQUEAR acceso externo al 27017 creada"

# Regla 2: PERMITIR solo desde localhost (127.0.0.1)
New-NetFirewallRule `
    -DisplayName "MongoDB - Permitir localhost" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 27017 `
    -Action Allow `
    -RemoteAddress "127.0.0.1" `
    -Profile Any `
    -Description "Permite conexiones a MongoDB solo desde localhost" `
    | Out-Null
Write-Host "      ✓ Regla PERMITIR localhost (127.0.0.1) en 27017 creada"
Write-Host "✅ [6/7] Firewall configurado — MongoDB solo accesible desde localhost" -ForegroundColor Green

# ─────────────────────────────────────────────
#  PASO 7: Reiniciar servicio MongoDB
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "[7/7] Reiniciando servicio MongoDB..." -ForegroundColor Yellow

try {
    Restart-Service -Name "MongoDB" -Force
    Start-Sleep -Seconds 4

    $estado = (Get-Service -Name "MongoDB").Status
    if ($estado -eq "Running") {
        Write-Host "      Estado del servicio: $estado"
        Write-Host "✅ [7/7] Servicio MongoDB reiniciado y corriendo" -ForegroundColor Green
    } else {
        Write-Host "❌ [7/7] El servicio no está corriendo. Estado: $estado" -ForegroundColor Red
        Write-Host "   Revisar log en: C:\data\log\mongod.log"
    }
} catch {
    Write-Host "❌ [7/7] Error al reiniciar el servicio: $_" -ForegroundColor Red
}

# ─────────────────────────────────────────────
#  VERIFICACIÓN FINAL
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN FINAL DEL ENTORNO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Verificar puerto 27017
$puerto = netstat -an | findstr ":27017"
if ($puerto) {
    Write-Host "  Puerto 27017: $puerto"
} else {
    Write-Host "  ⚠️  Puerto 27017: no está escuchando (¿servicio detenido?)" -ForegroundColor Yellow
}

# Verificar directorios
@("C:\data\db", "C:\data\log", "C:\backups\mongodb") | ForEach-Object {
    $existe = Test-Path $_
    $sym = if ($existe) { "✓" } else { "✗" }
    Write-Host "  $sym Directorio: $_"
}

# Verificar reglas de firewall
$reglas = Get-NetFirewallRule -DisplayName "MongoDB*" | Select-Object DisplayName, Action
$reglas | ForEach-Object {
    Write-Host "  ✓ Firewall: $($_.DisplayName) → $($_.Action)"
}

Write-Host ""
Write-Host "  PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "  1. Ejecutar en mongosh (sin auth): mongosh crear_db.js"
Write-Host "  2. Ejecutar en mongosh (sin auth): mongosh crear_usuarios_mongodb.js"
Write-Host "  3. Habilitar authorization en mongod.cfg y reiniciar servicio"
Write-Host "  4. Verificar conexión Python:       python conexion_python\test_conexion.py"
Write-Host "  5. Programar backup automático:     .\setup_backup.ps1"
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Setup completado. Ver README.md para instrucciones detalladas." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
