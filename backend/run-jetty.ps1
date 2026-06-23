# Starts Karigar backend on http://localhost:8080/karigar-backend
# Uses embedded H2 by default (./data/) — no Oracle required.
# For Oracle: $env:KARIGAR_USE_H2 = "false"; $env:DB_URL = "jdbc:oracle:thin:@..."

$ErrorActionPreference = "Stop"
$backendRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendRoot

# Maven needs a JDK (javac), not only a JRE
if (-not $env:JAVA_HOME) {
    $jc = Get-Command javac -ErrorAction SilentlyContinue
    if ($jc) {
        $env:JAVA_HOME = Split-Path (Split-Path $jc.Source)
    } elseif (Test-Path "C:\Program Files\Java\jdk-17") {
        $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
    }
}

# Embedded H2 in ./data/ — set to false only when using Oracle
if (-not $env:KARIGAR_USE_H2) {
    $env:KARIGAR_USE_H2 = "true"
}

$mavenDir = Join-Path $backendRoot ".tools\apache-maven-3.9.6"
$mvn = Join-Path $mavenDir "bin\mvn.cmd"

if (-not (Test-Path $mvn)) {
    $zip = Join-Path $backendRoot ".tools\apache-maven-3.9.6-bin.zip"
    New-Item -ItemType Directory -Force -Path (Split-Path $zip) | Out-Null
    Write-Host "Downloading Maven 3.9.6 (one-time)..."
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile $zip -UseBasicParsing
    Expand-Archive -Path $zip -DestinationPath (Join-Path $backendRoot ".tools") -Force
}

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Error "Java not found on PATH. Install JDK 11+ and add to PATH."
    exit 1
}
if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME "bin\javac.exe"))) {
    Write-Warning "JAVA_HOME not set to a JDK, or javac missing. Maven may fail to compile. Install JDK 11+ and set JAVA_HOME."
}

Write-Host "Starting Jetty (Ctrl+C to stop). Backend: http://localhost:8080/karigar-backend"
& $mvn -q jetty:run
