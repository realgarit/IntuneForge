$ClientID = "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx"
$RedirectURI = "msalxxxxx-xxxx-xxxx-xxxx-xxxxxx://auth"
$PackageType = "EXE"
$PackageName = "JabraDirect"
$Publisher = "Jabra"
$AppVersion = "6.21.01701"
$DownloadURL = "https://jabraxpressonlineprdstor.blob.core.windows.net/jdo/JabraDirectSetup.exe"
$TenantName = "example.onmicrosoft.com"
$Assignment = "g_devices_testing"
$InstallArgs = "JabraDirectSetup.exe /install /quiet /norestart"
$UninstallArgs  = "JabraDirectSetup.exe /uninstall /quiet /norestart"
$DetectionArgs = @'
if (Test-Path 'HKLM:\SOFTWARE\WOW6432Node\Jabra\Direct') {
    $regValue = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\WOW6432Node\Jabra\Direct' -Name 'Version').Version
    $currentVersion = [version]($regValue.Trim())
    $targetVersion = [version]'6.9.16301'
    
    if ($currentVersion -ge $targetVersion) {
        Write-Output "Detected"
    }
    else {
        throw "Installed version '$regValue' does not meet the required version '$targetVersion'."
    }
}
else {
    throw "Registry key 'HKLM:\SOFTWARE\WOW6432Node\Jabra\Direct' not found."
}
'@

.\intune-packager-main.ps1 -ClientID $ClientID `
                                        -RedirectURI $RedirectURI `
                                        -PackageType $PackageType `
                                        -PackageName $PackageName `
                                        -Publisher $Publisher `
                                        -AppVersion $AppVersion `
                                        -DownloadURL $DownloadURL `
                                        -TenantName $TenantName `
                                        -Assignment $Assignment `
                                        -InstallArgs $InstallArgs `
                                        -UninstallArgs $UninstallArgs `
                                        -DetectionArgs $DetectionArgs
