# PowerShell скрипт для автоматического обновления настроек Telegram бота
# Использование: .\scripts\update-bot-config.ps1

param(
    [string]$ApiUrl = "http://194.87.0.193",
    [string]$BotUsername = "JARVIS_SHEVA_bot",
    [string]$BotToken = "7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8",
    [string]$ChannelChatId = "-1003018207910",
    [string]$ChannelLink = "https://t.me/+vZtVvSSVltwzYmMy"
)

Write-Host "🚀 Скрипт обновления настроек Telegram бота" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host ""

# Проверка наличия curl или Invoke-WebRequest
$useCurl = $false
if (Get-Command curl -ErrorAction SilentlyContinue) {
    $useCurl = $true
}

$apiBaseUrl = "$ApiUrl/api"

Write-Host "🔄 Обновление настроек бота..." -ForegroundColor Yellow
Write-Host "📡 API URL: $apiBaseUrl" -ForegroundColor Gray
Write-Host "🤖 Bot: $BotUsername" -ForegroundColor Gray
Write-Host "🔑 Token: $($BotToken.Substring(0, 10))..." -ForegroundColor Gray
Write-Host "📢 Channel Chat ID: $ChannelChatId" -ForegroundColor Gray
Write-Host ""

try {
    # Получаем текущие настройки
    Write-Host "📥 Получение текущих настроек..." -ForegroundColor Yellow
    
    if ($useCurl) {
        $getResponse = curl -s "$apiBaseUrl/bot-setting" | ConvertFrom-Json
    } else {
        $getResponse = Invoke-RestMethod -Uri "$apiBaseUrl/bot-setting" -Method Get -ErrorAction Stop
    }
    
    if (-not $getResponse.id) {
        throw "Не удалось получить настройки бота"
    }
    
    Write-Host "✅ Текущие настройки получены (ID: $($getResponse.id))" -ForegroundColor Green
    Write-Host ""
    
    # Подготавливаем данные для обновления
    $updateData = @{
        id = $getResponse.id
        bot_username = $BotUsername
        bot_token = $BotToken
        active = $true
    }
    
    # Копируем остальные поля из текущих настроек
    $getResponse.PSObject.Properties | ForEach-Object {
        if ($updateData.Keys -notcontains $_.Name) {
            $updateData[$_.Name] = $_.Value
        }
    }
    
    # Обновляем настройки
    Write-Host "📤 Отправка обновленных настроек..." -ForegroundColor Yellow
    
    $jsonBody = $updateData | ConvertTo-Json -Depth 10
    
    if ($useCurl) {
        $updateResponse = curl -s -X PUT "$apiBaseUrl/bot-setting/$($getResponse.id)" `
            -H "Content-Type: application/json" `
            -d $jsonBody | ConvertFrom-Json
    } else {
        $updateResponse = Invoke-RestMethod -Uri "$apiBaseUrl/bot-setting/$($getResponse.id)" `
            -Method Put `
            -Body $jsonBody `
            -ContentType "application/json" `
            -ErrorAction Stop
    }
    
    Write-Host "✅ Настройки бота успешно обновлены!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Обновленные данные:" -ForegroundColor Cyan
    Write-Host "  - Bot Username: $($updateResponse.bot_username)" -ForegroundColor Gray
    Write-Host "  - Bot Token: $($updateResponse.bot_token.Substring(0, 10))..." -ForegroundColor Gray
    Write-Host "  - Active: $(if ($updateResponse.active) { '✅' } else { '❌' })" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "=" * 50 -ForegroundColor Cyan
    Write-Host "✅ Обновление завершено успешно!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "   1. Проверьте работу бота в Telegram" -ForegroundColor Gray
    Write-Host "   2. Проверьте отправку уведомлений в канал" -ForegroundColor Gray
    Write-Host "   3. Убедитесь, что Web App открывается корректно" -ForegroundColor Gray
    
} catch {
    Write-Host ""
    Write-Host "❌ Ошибка при обновлении настроек:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Проверьте:" -ForegroundColor Yellow
    Write-Host "   1. Доступность API сервера: $ApiUrl" -ForegroundColor Gray
    Write-Host "   2. Правильность токена бота" -ForegroundColor Gray
    Write-Host "   3. Логи сервера на наличие ошибок" -ForegroundColor Gray
    exit 1
}

