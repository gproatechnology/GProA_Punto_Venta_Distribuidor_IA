<#
.SYNOPSIS
    GProA Punto de Venta - Git Auto-Push
.DESCRIPTION
    Este script automatiza el proceso de commit y push para el proyecto GProA Punto de Venta.
    Incluye validaciones, selección de archivos y manejo de conflictos.
.NOTES
    Requiere: git instalado y configurado en el PATH.
#>

# ================= CONFIGURACIÓN =================
$BRANCH_NAME = "main"
$REPO_URL = "https://github.com/gproatechnology/GProA_Punto_Venta_Distribuidor_IA.git"
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$ROOT_DIR = Split-Path -Parent $SCRIPT_DIR
$LOG_FILE = Join-Path $SCRIPT_DIR "git_push.log"

# ================= FUNCIONES DE UI =================
function Write-Success { param($m) Write-Host "[OK] $m" -ForegroundColor Green }
function Write-Error   { param($m) Write-Host "[ERROR] $m" -ForegroundColor Red }
function Write-Warning { param($m) Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Info    { param($m) Write-Host "[INFO] $m" -ForegroundColor Cyan }

function Show-Banner {
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host "  G P r o A   P U N T O   D E   V E N T A   -   G I T   A U T O - P U S H" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

# ================= FUNCIONES DE GIT =================
function Test-GitInstalled {
    try { $null = git --version 2>&1; return $true } catch { return $false }
}

function Test-GitRepository {
    try { $null = git rev-parse --git-dir 2>&1; return $true } catch { return $false }
}

function Get-CurrentBranch {
    return git rev-parse --abbrev-ref HEAD 2>$null
}

function Invoke-GitWithLog($command, $actionDescription) {
    Write-Info "$actionDescription..."
    $output = Invoke-Expression $command 2>&1
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        Write-Error "Fallo: $actionDescription"
        Write-Host $output -ForegroundColor Red
        $logEntry = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $actionDescription`n$output`n"
        Add-Content -Path $LOG_FILE -Value $logEntry
        return $false
    } else {
        if ($output) { Write-Host $output -ForegroundColor Gray }
        $logEntry = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] OK: $actionDescription`n"
        Add-Content -Path $LOG_FILE -Value $logEntry
        return $true
    }
}

# ================= MENÚ PRINCIPAL =================
Clear-Host
Show-Banner

# 1. Verificar git instalado
if (-not (Test-GitInstalled)) {
    Write-Error "Git no está instalado o no está en el PATH."
    Read-Host "Presiona Enter para salir"
    exit 1
}

# 2. Verificar que estamos en un repositorio git
Push-Location $ROOT_DIR
if (-not (Test-GitRepository)) {
    Write-Error "El directorio $ROOT_DIR no es un repositorio Git válido."
    Pop-Location
    Read-Host "Presiona Enter para salir"
    exit 1
}

# 3. Mostrar estado actual
Write-Host "`nEstado actual del repositorio:" -ForegroundColor Yellow
git status -s
if ($LASTEXITCODE -ne 0) { git status }

# 4. Verificar rama actual
$currentBranch = Get-CurrentBranch
Write-Info "Rama actual: $currentBranch"
Write-Info "Rama destino: $BRANCH_NAME"

if ($currentBranch -ne $BRANCH_NAME) {
    Write-Warning "Estás en la rama '$currentBranch', no en '$BRANCH_NAME'."
    $resp = Read-Host "¿Cambiar a la rama '$BRANCH_NAME'? (s/N)"
    if ($resp -eq 's') {
        if (-not (Invoke-GitWithLog "git checkout $BRANCH_NAME" "Cambiando a rama $BRANCH_NAME")) {
            Pop-Location
            Read-Host "Presiona Enter para salir"
            exit 1
        }
    } else {
        Write-Error "Operación cancelada."
        Pop-Location
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

# 5. Verificar cambios pendientes
$changes = git status --porcelain
if (-not $changes) {
    Write-Warning "No hay cambios para commitear."
    Pop-Location
    Read-Host "Presiona Enter para salir"
    exit 0
} else {
    Write-Host "`nCambios detectados:" -ForegroundColor Yellow
    Write-Host $changes -ForegroundColor Gray
}

# 6. Menú de opciones
Write-Host "`nOpciones:" -ForegroundColor Cyan
Write-Host "  [1] Agregar todos los cambios (git add .)"
Write-Host "  [2] Agregar archivos específicos"
Write-Host "  [3] Ver diff antes de agregar"
Write-Host "  [4] Cancelar"
$opt = Read-Host "`nSelecciona (1-4)"

if ($opt -eq "4") {
    Write-Info "Operación cancelada."
    Pop-Location
    Read-Host "Presiona Enter para salir"
    exit 0
}
elseif ($opt -eq "3") {
    Write-Info "Ejecutando git diff..."
    git diff
    $confirm = Read-Host "`n¿Agregar cambios? (s/N)"
    if ($confirm -eq 's') {
        $addResult = Invoke-GitWithLog "git add ." "Agregando todos los archivos"
    } else {
        Pop-Location
        Read-Host "Presiona Enter para salir"
        exit 0
    }
}
elseif ($opt -eq "2") {
    Write-Info "Archivos a agregar (separados por espacio):"
    $files = Read-Host "Archivos"
    if ([string]::IsNullOrWhiteSpace($files)) {
        Write-Error "No se especificaron archivos."
        Pop-Location
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    $addResult = Invoke-GitWithLog "git add $files" "Agregando archivos"
    if (-not $addResult) {
        Pop-Location
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}
else {
    $addResult = Invoke-GitWithLog "git add ." "Agregando todos los archivos"
    if (-not $addResult) {
        Pop-Location
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

# 7. Mensaje del commit
$defaultMsg = "punto-venta: updates"
$msg = Read-Host "`nMensaje del commit (Enter para '$defaultMsg')"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = $defaultMsg }

$commitResult = Invoke-GitWithLog "git commit -m `"$msg`"" "Creando commit"
if (-not $commitResult) {
    Pop-Location
    Read-Host "Presiona Enter para salir"
    exit 1
}

# 8. Pull antes de push
$pullOption = Read-Host "`n¿Hacer 'git pull' antes de push? (s/N)"
if ($pullOption -eq 's') {
    Invoke-GitWithLog "git pull origin $BRANCH_NAME" "Sincronizando con remote"
}

# 9. Push
$pushResult = Invoke-GitWithLog "git push origin $BRANCH_NAME" "Subiendo a $BRANCH_NAME"

# ================= INFORME FINAL =================
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "                     INFORME FINAL" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

$lastCommitHash = git rev-parse --short HEAD 2>$null
$lastCommitMsg = git log -1 --pretty=%B 2>$null
$lastCommitDate = git log -1 --pretty=%cd --date=local 2>$null
$commitStats = git show --stat --oneline -1 2>$null
$commitFiles = git show --name-only --pretty=format: 2>$null | Where-Object { $_ -ne "" }

Write-Info "Hash: $lastCommitHash"
Write-Info "Fecha: $lastCommitDate"
Write-Info "Mensaje: $lastCommitMsg"
Write-Info "Rama: $BRANCH_NAME"

$fileCount = ($commitFiles | Measure-Object).Count
Write-Info "Archivos: $fileCount"

if ($fileCount -gt 0 -and $fileCount -le 20) {
    Write-Host "`n[Archivos]" -ForegroundColor Yellow
    foreach ($file in $commitFiles) {
        Write-Host "  - $file" -ForegroundColor Gray
    }
}

Write-Host "`n[Estadísticas]" -ForegroundColor Yellow
Write-Host $commitStats -ForegroundColor Gray

Write-Host ""
if ($pushResult) {
    Write-Host ("=" * 60) -ForegroundColor Green
    Write-Success "Cambios subidos a '$BRANCH_NAME'."
} else {
    Write-Host ("=" * 60) -ForegroundColor Red
    Write-Error "Error al subir cambios."
}
Write-Host ("=" * 60) -ForegroundColor DarkGray

$logReport = @"
=== INFORME FINAL ===
Hash: $lastCommitHash
Fecha: $lastCommitDate
Mensaje: $lastCommitMsg
Rama: $BRANCH_NAME
Archivos: $fileCount
Push: $(if ($pushResult) { "ÉXITO" } else { "FALLO" })
"@
Add-Content -Path $LOG_FILE -Value $logReport

Pop-Location
Read-Host "`nPresiona Enter para salir"