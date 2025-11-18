@echo off
REM Скрипт для развертывания через Putty/plink
REM Использование: deploy-via-putty.bat

echo ========================================
echo Развертывание webhook на сервере
echo ========================================
echo.

set SERVER=194.87.0.193
set USER=root
set PASS=6BFNsKPHU8
set PROJECT_DIR=/root/telegram-bot

echo [1/5] Копирование файлов на сервер...
echo.

REM Проверка наличия plink
where plink >nul 2>&1
if %errorlevel% neq 0 (
    echo ОШИБКА: plink не найден в PATH
    echo Установите Putty или добавьте plink.exe в PATH
    echo.
    echo Альтернатива: используйте WinSCP или скопируйте файлы вручную
    pause
    exit /b 1
)

echo Копирование full-deploy.sh...
pscp -pw %PASS% scripts\full-deploy.sh %USER%@%SERVER%:%PROJECT_DIR%/

echo Копирование update-database.sql...
pscp -pw %PASS% scripts\update-database.sql %USER%@%SERVER%:%PROJECT_DIR%/scripts/ 2>nul || echo SQL файл будет создан на сервере

echo.
echo [2/5] Выполнение скрипта развертывания на сервере...
echo.

plink -pw %PASS% %USER%@%SERVER% -m scripts\full-deploy.sh

echo.
echo [3/5] Проверка результата...
echo.

plink -pw %PASS% %USER%@%SERVER% "cd %PROJECT_DIR% && ls -la routes/telegram/ utils/telegram/"

echo.
echo ========================================
echo Развертывание завершено!
echo ========================================
echo.
echo Следующие шаги:
echo 1. Подключитесь к серверу через Putty
echo 2. Интегрируйте роут в главный файл приложения
echo 3. Реализуйте функции работы с БД
echo 4. Обновите базу данных
echo 5. Настройте SSL и webhook
echo.
pause

