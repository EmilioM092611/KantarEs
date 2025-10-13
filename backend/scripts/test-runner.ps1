# backend/scripts/test-runner.ps1
# Script de PowerShell para ejecutar tests en Windows

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Arg1 = "",
    
    [switch]$Open
)

# Colores
function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "==================================" -ForegroundColor Blue
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Verificar Redis
function Test-Redis {
    Write-Header "Verificando Redis"
    
    $redisRunning = docker ps | Select-String "redis"
    
    if (-not $redisRunning) {
        Write-Warning-Custom "Redis no esta corriendo. Iniciando..."
        pnpm redis:start
        Start-Sleep -Seconds 3
    }
    
    $redisRunning = docker ps | Select-String "redis"
    if ($redisRunning) {
        Write-Success "Redis esta corriendo"
        return $true
    } else {
        Write-Error-Custom "No se pudo iniciar Redis"
        return $false
    }
}

# Tests Unitarios
function Invoke-UnitTests {
    Write-Header "Ejecutando Tests Unitarios"
    
    $result = pnpm test:unit
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Tests unitarios pasaron"
        return $true
    } else {
        Write-Error-Custom "Tests unitarios fallaron"
        return $false
    }
}

# Tests de Integración
function Invoke-IntegrationTests {
    Write-Header "Ejecutando Tests de Integración"
    
    $result = pnpm test:integration
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Tests de integración pasaron"
        return $true
    } else {
        Write-Error-Custom "Tests de integración fallaron"
        return $false
    }
}

# Tests E2E
function Invoke-E2ETests {
    Write-Header "Ejecutando Tests E2E"
    
    $result = pnpm test:e2e
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Tests E2E pasaron"
        return $true
    } else {
        Write-Error-Custom "Tests E2E fallaron"
        return $false
    }
}

# Generar Cobertura
function Invoke-Coverage {
    Write-Header "Generando Reporte de Cobertura"
    
    $result = pnpm test:cov
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Reporte de cobertura generado"
        
        # Mostrar resumen si existe
        $coverageFile = "coverage/coverage-summary.json"
        if (Test-Path $coverageFile) {
            Write-Header "Resumen de Cobertura"
            $coverage = Get-Content $coverageFile | ConvertFrom-Json
            Write-Host "  Lines:      $($coverage.total.lines.pct)%"
            Write-Host "  Branches:   $($coverage.total.branches.pct)%"
            Write-Host "  Functions:  $($coverage.total.functions.pct)%"
            Write-Host "  Statements: $($coverage.total.statements.pct)%"
        }
        
        # Abrir reporte HTML
        if ($Open) {
            $htmlReport = "coverage/lcov-report/index.html"
            if (Test-Path $htmlReport) {
                Start-Process $htmlReport
            }
        }
        
        return $true
    } else {
        Write-Error-Custom "Falló la generación de cobertura"
        return $false
    }
}

# Verificar Umbral de Cobertura
function Test-CoverageThreshold {
    param([int]$Threshold = 70)
    
    Write-Header "Verificando Umbrales de Cobertura"
    
    $coverageFile = "coverage/coverage-summary.json"
    if (-not (Test-Path $coverageFile)) {
        Write-Error-Custom "No se encontró reporte de cobertura"
        return $false
    }
    
    $coverage = Get-Content $coverageFile | ConvertFrom-Json
    $lines = [math]::Round($coverage.total.lines.pct, 2)
    $branches = [math]::Round($coverage.total.branches.pct, 2)
    $functions = [math]::Round($coverage.total.functions.pct, 2)
    $statements = [math]::Round($coverage.total.statements.pct, 2)
    
    Write-Host "  Lines:      $lines%"
    Write-Host "  Branches:   $branches%"
    Write-Host "  Functions:  $functions%"
    Write-Host "  Statements: $statements%"
    Write-Host ""
    
    if ($lines -ge $Threshold) {
        Write-Success "Cobertura de líneas cumple el umbral ($Threshold%)"
        return $true
    } else {
        Write-Error-Custom "Cobertura de líneas ($lines%) no cumple el umbral ($Threshold%)"
        return $false
    }
}

# Limpiar archivos temporales
function Invoke-Cleanup {
    Write-Header "Limpiando Archivos Temporales"
    
    if (Test-Path "coverage") { Remove-Item -Recurse -Force "coverage" }
    if (Test-Path ".nyc_output") { Remove-Item -Recurse -Force ".nyc_output" }
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
    
    Write-Success "Limpieza completada"
}

# Tests de módulo específico
function Invoke-ModuleTests {
    param([string]$Module)
    
    Write-Header "Ejecutando Tests de: $Module"
    
    $result = pnpm test -- $Module
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Tests de $Module pasaron"
        return $true
    } else {
        Write-Error-Custom "Tests de $Module fallaron"
        return $false
    }
}

# Modo watch
function Invoke-WatchMode {
    Write-Header "Iniciando Modo Watch"
    Write-Warning-Custom "Presiona Ctrl+C para salir"
    
    pnpm test:watch
}

# Pre-commit checks
function Invoke-PreCommit {
    Write-Header "Ejecutando Pre-Commit Checks"
    
    $failed = 0
    
    # Lint
    Write-Host "Ejecutando Linter..." -ForegroundColor Blue
    pnpm lint
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Linter falló"
        $failed++
    }
    
    # Type check
    Write-Host "Verificando tipos TypeScript..." -ForegroundColor Blue
    pnpm tsc --noEmit
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Type check falló"
        $failed++
    }
    
    # Tests unitarios
    if (-not (Invoke-UnitTests)) {
        $failed++
    }
    
    if ($failed -eq 0) {
        Write-Success "Pre-commit checks pasaron"
        return $true
    } else {
        Write-Error-Custom "$failed check(s) fallaron"
        return $false
    }
}

# Suite completa (CI)
function Invoke-CI {
    Write-Header "Ejecutando Suite Completa (CI Mode)"
    
    $failed = 0
    
    if (-not (Test-Redis)) { $failed++ }
    if (-not (Invoke-UnitTests)) { $failed++ }
    if (-not (Invoke-IntegrationTests)) { $failed++ }
    if (-not (Invoke-E2ETests)) { $failed++ }
    if (-not (Invoke-Coverage)) { $failed++ }
    if (-not (Test-CoverageThreshold -Threshold 70)) { $failed++ }
    
    if ($failed -eq 0) {
        Write-Success "Suite completa pasó exitosamente"
        return $true
    } else {
        Write-Error-Custom "$failed suite(s) fallaron"
        return $false
    }
}

# Función principal
switch ($Command.ToLower()) {
    "unit" {
        Test-Redis | Out-Null
        Invoke-UnitTests
    }
    "integration" {
        Test-Redis | Out-Null
        Invoke-IntegrationTests
    }
    "e2e" {
        Test-Redis | Out-Null
        Invoke-E2ETests
    }
    "coverage" {
        Test-Redis | Out-Null
        Invoke-Coverage
    }
    "check-coverage" {
        $threshold = if ($Arg1) { [int]$Arg1 } else { 70 }
        Test-CoverageThreshold -Threshold $threshold
    }
    "module" {
        if (-not $Arg1) {
            Write-Error-Custom "Especifica el nombre del módulo"
            exit 1
        }
        Test-Redis | Out-Null
        Invoke-ModuleTests -Module $Arg1
    }
    "watch" {
        Test-Redis | Out-Null
        Invoke-WatchMode
    }
    "pre-commit" {
        Invoke-PreCommit
    }
    "ci" {
        Invoke-CI
    }
    "cleanup" {
        Invoke-Cleanup
    }
    "all" {
        Test-Redis | Out-Null
        Invoke-UnitTests
        Invoke-IntegrationTests
        Invoke-E2ETests
        Invoke-Coverage
    }
    default {
        Write-Host "Test Runner - Sistema KantarEs (PowerShell)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Uso: .\test-runner.ps1 [comando] [opciones]" -ForegroundColor White
        Write-Host ""
        Write-Host "Comandos disponibles:" -ForegroundColor Yellow
        Write-Host "  unit              - Ejecutar tests unitarios"
        Write-Host "  integration       - Ejecutar tests de integración"
        Write-Host "  e2e               - Ejecutar tests E2E"
        Write-Host "  coverage          - Generar reporte de cobertura"
        Write-Host "  coverage -Open    - Generar y abrir reporte"
        Write-Host "  check-coverage [threshold] - Verificar umbral"
        Write-Host "  module <nombre>   - Ejecutar tests de módulo específico"
        Write-Host "  watch             - Modo watch para desarrollo"
        Write-Host "  pre-commit        - Ejecutar checks pre-commit"
        Write-Host "  ci                - Ejecutar suite completa (CI)"
        Write-Host "  cleanup           - Limpiar archivos temporales"
        Write-Host "  all               - Ejecutar todos los tests"
        Write-Host ""
        Write-Host "Ejemplos:" -ForegroundColor Green
        Write-Host "  .\test-runner.ps1 unit"
        Write-Host "  .\test-runner.ps1 module productos"
        Write-Host "  .\test-runner.ps1 coverage -Open"
        Write-Host "  .\test-runner.ps1 check-coverage 75"
        Write-Host ""
    }
}