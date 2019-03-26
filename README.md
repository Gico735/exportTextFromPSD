#Installation

Run `npm i -g exportref`

#What is this package for?

It exports text in JSON from specifically prepared layers from PSD files.

#How to use

Just run `exportref` command in bash terminal in the folder with PSD files. It will create **JSON file** with results and **debug.txt** if there are any issues.

#Known issues
For Windows users:
* If terminal gives you `command is unknown`, you should check the environment variables. For Windows 10: right-click **This PC** -> **properties** -> **advanced system settings** -> **environment variables**. Double-click *Path*, and add path to **npm** folder (by default `C:\Users\%USERNAME%\AppData\Roaming\npm`).

---

#Установка

`npm i -g exportref`

#Для чего нужен этот пакет?

Он экспортирует текст из специально подготовленных слоев в PSD-файлах в JSON-файл.

#Использование

Просто запустите команду `exportref` в терминале в папке с PSD-файлами. Будет создано два файла: **JSON** с результатами, и **debug.txt**, если были какие-то ошибки в процессе выполнения скрипта.

#Возможные проблемы
Для Windows:
* Если терминал выдает ошибку `command is unknown`, необходимо проверить системные переменные. Для Windows 10: правый клик на **Этот компьютер** -> **Свойства** -> **Дополнительные параметры системы** -> **Переменные среды**. Два раза кликните на *Path*, и добавьте путь до папки **npm** (по умолчанию `C:\Users\%USERNAME%\AppData\Roaming\npm`).