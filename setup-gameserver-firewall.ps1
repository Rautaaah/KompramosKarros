param(
    [int]$StartPort = 200,
    [int]$EndPort = 260
)

$tcpRuleName = "Zekoro GameServer TCP $StartPort-$EndPort"
$udpRuleName = "Zekoro GameServer UDP $StartPort-$EndPort"
$portRange = "$StartPort-$EndPort"

Write-Host "Configuring firewall rules for game server ports $portRange..."

if (Get-NetFirewallRule -DisplayName $tcpRuleName -ErrorAction SilentlyContinue) {
    Remove-NetFirewallRule -DisplayName $tcpRuleName | Out-Null
}
if (Get-NetFirewallRule -DisplayName $udpRuleName -ErrorAction SilentlyContinue) {
    Remove-NetFirewallRule -DisplayName $udpRuleName | Out-Null
}

New-NetFirewallRule `
    -DisplayName $tcpRuleName `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort $portRange `
    -Profile Any | Out-Null

New-NetFirewallRule `
    -DisplayName $udpRuleName `
    -Direction Inbound `
    -Action Allow `
    -Protocol UDP `
    -LocalPort $portRange `
    -Profile Any | Out-Null

Write-Host "Firewall rules created:"
Get-NetFirewallRule -DisplayName $tcpRuleName, $udpRuleName | Format-Table -AutoSize
