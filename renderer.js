function displayResults(response) {
    const analysisResult = response.data.attributes.results;

    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = "";

    const table = document.createElement('table');
    table.classList.add('result-table');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const headers = ['Антивирус', 'Категория', 'Результат', 'Метод проверки', 'Последнее обновление'];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    for (const engineName in analysisResult) {
        const engineData = analysisResult[engineName];

        const dataRow = document.createElement('tr');

        const values = [
            engineName,
            engineData.category,
            engineData.result,
            engineData.method === 'blacklist' ? 'Сверка по сигнатурам' : engineData.method,
            formatDate(engineData.engine_update)
        ];

        values.forEach(valueText => {
            const td = document.createElement('td');
            td.textContent = valueText || 'УГРОЗ НЕ ОБНАРУЖЕНО';
            dataRow.appendChild(td);
        });

        tbody.appendChild(dataRow);
    }

    table.appendChild(tbody);
    resultContainer.appendChild(table);
}

function formatDate(dateString) {
    if (dateString) {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${day}.${month}.${year}`;
    }
    return 'Н / Д';
}

function startFileCheck() {
    const checkButton = document.getElementById('checkButton');
    checkButton.disabled = true;
    checkButton.textContent = "Идет проверка...";

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('file', file);

    const options = {
        method: 'POST',
        headers: {
            'x-apikey': '04451a9bd610836831241b436c92544e8dd6b85462ee383990da87a52c357234'
        },
        body: formData
    };

    fetch('https://www.virustotal.com/api/v3/files', options)
        .then(response => response.json())
        .then(response => {
            const analysisId = response.data.id;
            console.log("ID анализа:", analysisId);
            const countdownSeconds = 40;
            updateCountdown(checkButton, countdownSeconds);
            sendAnalysisRequest(analysisId, countdownSeconds);
        })
        .catch(err => console.error(err));
}

function updateCountdown(button, seconds) {
    button.disabled = true;
    button.textContent = `Подождите ${seconds} секунд`;
    const timer = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            button.textContent = `Подождите ${seconds} секунд`;
        } else {
            clearInterval(timer);
            button.textContent = "Проверить";
            button.disabled = false;
        }
    }, 1000);
}

function sendAnalysisRequest(analysisId, countdownSeconds) {
    const options = {
        method: 'GET',
        headers: {
            'x-apikey': '9e22a2a153a193389b868ac9bb6a457a79be471e2dd8d07444d1a89e596a3f74'
        }
    };

    const checkResults = () => {
        fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, options)
            .then(response => response.json())
            .then(response => {
                console.log(response);
                if (response.data.attributes.status === 'completed') {
                    displayResults(response);
                    showNotification("Результат получен");
                } else {
                    showNotification("Повторная отправка запроса...");
                    setTimeout(checkResults, 5000);
                }
            })
            .catch(err => {
                console.error(err);
                showNotification("Ошибка при получении результатов. Повторная отправка запроса...");
                setTimeout(checkResults, 5000);
            });
    };

    setTimeout(checkResults, countdownSeconds * 1000);
}

function showNotification(message) {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.textContent = message;
}

document.getElementById('checkButton').addEventListener('click', startFileCheck);