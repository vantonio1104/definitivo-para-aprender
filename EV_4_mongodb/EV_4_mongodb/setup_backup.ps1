# ================================================================
#  setup_backup.ps1 — Automatización de backups MongoDB
#  ComercioTech · Evaluación 4 · Fase 4 (Seguridad y Disponibilidad)
#
#  EJECUTAR COMO ADMINISTRADOR para registrar la tarea programada:
#    .\setup_backup.ps1
#
#  BACKUP MANUAL (sin registrar la tarea):
#    .\setup_backup.ps1 -SoloEjecutar
# ================================================================

param(
    [switch]$SoloEjecutar   # Si se pasa este flag, ejecuta el backup ahora y no registra la tarea
)

$mongoDir   = "C:\Program Files\MongoDB\Server\8.2\bin"
$backupDir  = "C:\backups\mongodb"
$logBackup  = "C:\data\log\backup_log.txt"
$scriptSelf = $MyInvocation.MyCommand.Definition

# ─────────────────────────────────────────────
#  FUNCIÓN: Ejecutar un backup ahora
# ─────────────────────────────────────────────
function Invoke-Backup {
    $fecha    = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $destino  = "$backupDir\backup_$fecha"
    $zipFile  = "$backupDir\backup_$fecha.zip"

    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Iniciando backup de MongoDB..." -ForegroundColor Cyan

    # Crear directorio de backup
    New-Item -ItemType Directory -Force -Path $destino | Out-Null

    # Ejecutar mongodump
    # NOTA: Cambiar la contraseña por la real o usar variable de entorno
    $mongodump = "$mongoDir\mongodump.exe"
    & $mongodump `
        --uri="mongodb://comerciotech_app:App@CT_2024Secure!@127.0.0.1:27017/comerciotech" `
        --out="$destino" `
        2>&1 | Out-File -Append -FilePath $logBackup

    if ($LASTEXITCODE -eq 0) {
        # Comprimir el directorio de backup
        Compress-Archive -Path "$destino\*" -DestinationPath $zipFile -CompressionLevel Optimal
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Backup comprimido: $zipFile" -ForegroundColor Green

        # Eliminar directorio sin comprimir
        Remove-Item -Recurse -Force $destino

        # Eliminar backups con más de 7 días
        $eliminados = 0
        Get-ChildItem $backupDir -Filter "*.zip" |
            Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
            ForEach-Object {
                Remove-Item $_.FullName -Force
                $eliminados++
            }

        # Registrar en log
        $logMsg = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] BACKUP OK: $zipFile | Eliminados: $eliminados archivos viejos"
        Add-Content -Path $logBackup -Value $logMsg
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $logMsg" -ForegroundColor Green

    } else {
        $errMsg = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR en backup — revisar log mongodump"
        Add-Content -Path $logBackup -Value $errMsg
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $errMsg" -ForegroundColor Red
    }
}

# ─────────────────────────────────────────────
#  SI SE LLAMA CON -SoloEjecutar: hacer backup ahora y salir
# ─────────────────────────────────────────────
if ($SoloEjecutar) {
    Invoke-Backup
    exit 0
}

# ─────────────────────────────────────────────
#  REGISTRAR TAREA PROGRAMADA (backup cada 60 minutos)
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SETUP — Backup Automático MongoDB ComercioTech" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Crear directorio de backups
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
Write-Host "✓ Directorio de backups: $backupDir"

# Eliminar tarea existente si la hay
Unregister-ScheduledTask -TaskName "MongoDB_Backup_Comerciotech" -Confirm:$false -ErrorAction SilentlyContinue

# Definir la acción: ejecutar este mismo script con -SoloEjecutar
$accion = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NonInteractive -ExecutionPolicy Bypass -File `"$scriptSelf`" -SoloEjecutar"

# Trigger: ejecutar cada 60 minutos, comenzando ahora
$trigger = New-ScheduledTaskTrigger `
    -RepetitionInterval (New-TimeSpan -Minutes 60) `
    -Once `
    -At (Get-Date).AddMinutes(5)   # Primera ejecución en 5 minutos

# Configuración de la tarea
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15) `
    -RunOnlyIfNetworkAvailable $false `
    -StartWhenAvailable $true

# Principal: ejecutar como SYSTEM con privilegios elevados
$principal = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -LogonType ServiceAccount `
    -RunLevel Highest

# Registrar la tarea
Register-ScheduledTask `
    -TaskName "MongoDB_Backup_Comerciotech" `
    -Action $accion `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Backup automático horario de MongoDB para el sistema ComercioTech" `
    -Force | Out-Null

Write-Host "✅ Tarea programada registrada: 'MongoDB_Backup_Comerciotech'" -ForegroundColor Green
Write-Host "   Frecuencia: cada 60 minutos"
Write-Host "   Primera ejecución: en 5 minutos"
Write-Host "   Directorio de backups: $backupDir"
Write-Host "   Log de operaciones: $logBackup"

# Ejecutar el primer backup ahora
Write-Host ""
Write-Host "Ejecutando primer backup inmediato..." -ForegroundColor Yellow
Invoke-Backup

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Para verificar la tarea: Abrir Task Scheduler → buscar" -ForegroundColor Cyan
Write-Host "  'MongoDB_Backup_Comerciotech'" -ForegroundColor Cyan
Write-Host "  Para ejecutar backup manual:" -ForegroundColor Cyan
Write-Host "    .\setup_backup.ps1 -SoloEjecutar" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
