Set-StrictMode -Version Latest
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "Checking mobile project environment..."

if (-not (Test-Path './package.json')) {
  Write-Error "This script must be run from the mobile project folder where package.json exists."
  exit 1
}

if (-not (Test-Path './android')) {
  Write-Warning "The android/ folder is missing from this mobile project."
  Write-Host "If this is a bare React Native app, restore the native android/ directory from source control or recreate it on a machine with the React Native CLI."
  Write-Host "Suggested command to recreate if the project is a proper bare React Native app:"
  Write-Host "  npx react-native init stride-mobile" -ForegroundColor Yellow
  Write-Host "Then move the generated android/ and ios/ folders into this mobile project and restore any custom native configuration."
  exit 1
}

if (-not (Test-Path './node_modules')) {
  Write-Host "Installing npm dependencies..."
  npm install
}

Write-Host "Running React Native doctor..."
npx react-native doctor --fix

Write-Host "Starting Android build and run..."
npx react-native run-android
