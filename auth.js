// ==========================================
// СИСТЕМА АВТОРИЗАЦІЇ ТА СЕСІЙ // TC-SECURITY
// ==========================================

// Конфігурація облікових записів та звань
const USERS_DATABASE = {
    "vadym": { pass: "1234", name: "Вадим", rank: "Генерал Армії", clearance: "Level 4 // Top Secret", level: 4 },
    "captain": { pass: "7777", name: "Олексій", rank: "Капітан", clearance: "Level 3 // Confidential", level: 3 },
    "stalker": { pass: "2026", name: "Тінь", rank: "Заслужений Сталкер", clearance: "Level 2 // Restricted", level: 2 },
    "prof_olena": { pass: "password123", name: "Олена", rank: "Професор", clearance: "Level 4 // Top Secret", level: 4 },
    "colonel_oleksandr": { pass: "2007", name: "Олександр", rank: "Заслужений учасник", clearance: "Level 4 // Top Secret", level: 4 }
};

const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 хвилин у мілісекундах

// Перевірка стану сесії при завантаженні сторінки
document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    updateHeaderUserInfo();
});

function checkSession() {
    const isLoggedIn = localStorage.getItem("tc_logged_in");
    const isGuest = localStorage.getItem("tc_guest_mode");
    const lastActive = localStorage.getItem("tc_last_active");
    const now = Date.now();

    // Перевірка на 10 хвилин бездіяльності
    if (lastActive && (now - parseInt(lastActive)) > SESSION_TIMEOUT_MS) {
        logout("Час сесії вичерпано (10 хв бездіяльності). Потрібна повторна авторизація.");
        return;
    }

    if (isLoggedIn === "true" || isGuest === "true") {
        // Оновлюємо таймер активності при переході між сторінками
        localStorage.setItem("tc_last_active", Date.now().toString());
    } else {
        // Показываємо модальне вікно входу
        renderAuthModal();
    }
}

// Оновлення активності при кліках або натисканні клавіш
["click", "keydown", "mousemove"].forEach(eventType => {
    window.addEventListener(eventType, () => {
        if (localStorage.getItem("tc_logged_in") === "true" || localStorage.getItem("tc_guest_mode") === "true") {
            localStorage.setItem("tc_last_active", Date.now().toString());
        }
    });
});

// Малювання оверлея та форми входу прямо в DOM
function renderAuthModal() {
    if (document.getElementById("auth-modal-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "auth-modal-overlay";
    overlay.innerHTML = `
        <div class="auth-box">
            <h2>ІДЕНТИФІКАЦІЯ ОПЕРАТИВНИКА</h2>
            <div class="auth-sub">[ ПОТРІБЕН ДОСТУП ДО ТЕРМІНАЛА ]</div>
            
            <div id="auth-error" class="auth-error" style="display: none;"></div>

            <div id="login-form">
                <input type="text" id="auth-username" placeholder="Логін (позивний)" autocomplete="off">
                <input type="password" id="auth-password" placeholder="Код допуску (пароль)">
                
                <div class="auth-actions">
                    <button id="btn-login" onclick="handleLogin()">УВІЙТИ</button>
                    <button id="btn-guest" onclick="handleGuest()">ОЗНАЙОМЛЕННЯ</button>
                </div>
            </div>
        </div>
    `;

    // Inject стилів для модального вікна
    const style = document.createElement("style");
    style.innerHTML = `
        #auth-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(11, 15, 25, 0.96); backdrop-filter: blur(8px);
            display: flex; justify-content: center; align-items: center;
            z-index: 99999; font-family: 'JetBrains Mono', monospace;
        }
        .auth-box {
            background: #111827; border: 1px solid #1f2937; padding: 35px 30px;
            border-radius: 8px; width: 100%; max-width: 420px; text-align: center;
            box-shadow: 0 0 25px rgba(0,0,0,0.8);
        }
        .auth-box h2 { color: #ffffff; font-size: 1.4rem; margin-bottom: 5px; }
        .auth-sub { color: #3b82f6; font-size: 0.75rem; margin-bottom: 25px; letter-spacing: 1px; }
        .auth-box input {
            width: 100%; background: #0b0f19; border: 1px solid #374151; color: #ffffff;
            padding: 12px 15px; margin-bottom: 12px; border-radius: 6px; font-family: inherit;
            font-size: 0.9rem; outline: none; transition: border-color 0.2s;
        }
        .auth-box input:focus { border-color: #3b82f6; }
        .auth-actions { display: flex; gap: 10px; margin-top: 10px; }
        .auth-actions button {
            flex: 1; padding: 12px; border-radius: 6px; font-weight: 700;
            font-family: inherit; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
        }
        #btn-login { background: #1f2937; color: #ffffff; border: 1px solid #3b82f6; }
        #btn-login:hover { background: #3b82f6; box-shadow: 0 0 10px rgba(59,130,246,0.4); }
        #btn-guest { background: transparent; color: #9ca3af; border: 1px solid #374151; }
        #btn-guest:hover { color: #ffffff; border-color: #6b7280; background: #1f2937; }
        .auth-error { color: #ef4444; font-size: 0.8rem; margin-bottom: 15px; background: rgba(239,68,68,0.1); padding: 8px; border-radius: 4px; border: 1px solid #ef4444; }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);
}

// Авторизація за заготовленими обліковими даними
function handleLogin() {
    const user = document.getElementById("auth-username").value.trim().toLowerCase();
    const pass = document.getElementById("auth-password").value;
    const errorBox = document.getElementById("auth-error");

    if (USERS_DATABASE[user] && USERS_DATABASE[user].pass === pass) {
        const userData = USERS_DATABASE[user];
        localStorage.setItem("tc_logged_in", "true");
        localStorage.removeItem("tc_guest_mode");
        localStorage.setItem("tc_user_name", userData.name);
        localStorage.setItem("tc_user_rank", userData.rank);
        localStorage.setItem("tc_user_clearance", userData.clearance);
        localStorage.setItem("tc_last_active", Date.now().toString());
        // Записуємо числову вагу рівня допуску
        localStorage.setItem("tc_user_level", userData.level.toString());

        document.getElementById("auth-modal-overlay").remove();
        updateHeaderUserInfo();
        alert(`Вітаю, ${userData.rank} ${userData.name}! Доступ підтверджено.`);
    } else {
        errorBox.textContent = "ПОМИЛКА: Невірне кодове ім'я або пароль!";
        errorBox.style.display = "block";
    }
}

// Вхід у режимі Ознайомлення
function handleGuest() {
    localStorage.setItem("tc_guest_mode", "true");
    localStorage.removeItem("tc_logged_in");
    localStorage.setItem("tc_user_name", "Гість");
    localStorage.setItem("tc_user_rank", "Спостерігач");
    localStorage.setItem("tc_user_clearance", "Level 1 // Basic");
    localStorage.setItem("tc_user_level", "1"); // <-- Обов'язково скидаємо рівень до 1!
    localStorage.setItem("tc_last_active", Date.now().toString());

    document.getElementById("auth-modal-overlay").remove();
    updateHeaderUserInfo();
}

// Функція виходу / скидання сесії
function logout(message) {
    localStorage.removeItem("tc_logged_in");
    localStorage.removeItem("tc_guest_mode");
    localStorage.removeItem("tc_user_name");
    localStorage.removeItem("tc_user_rank");
    localStorage.removeItem("tc_user_clearance");
    localStorage.removeItem("tc_user_level"); // <-- Видаляємо рівень
    localStorage.removeItem("tc_last_active");
    if (message) alert(message);
    location.reload();
}

// Динамічне виведення звання оперативника у шапці сайту
function updateHeaderUserInfo() {
    const header = document.querySelector("header");
    if (!header) return;

    const rank = localStorage.getItem("tc_user_rank");
    const name = localStorage.getItem("tc_user_name");

    if (rank && name) {
        let userBadge = document.getElementById("tc-user-badge");
        if (!userBadge) {
            userBadge = document.createElement("div");
            userBadge.id = "tc-user-badge";
            userBadge.style.cssText = "font-size: 0.8rem; color: #3b82f6; background: #0b0f19; padding: 4px 10px; border-radius: 4px; border: 1px solid #1f2937; margin-left: 15px; display: inline-block;";
            header.appendChild(userBadge);
        }
        userBadge.innerHTML = `👤 <strong>${rank}</strong> ${name} <a href="#" onclick="logout()" style="color: #ef4444; margin-left: 8px; text-decoration: none;">[Вийти]</a>`;
    }
}

// Перевірка прав доступу при відкритті файлу в архіві
// ==========================================
// ЄДИНА БАЗА ДАНИХ АРХІВУ (Текст, Зображення, Зовнішні файли)
// ==========================================
const ARCHIVE_FILES = {
    "FILE_001_PROTOCOLS.LOG": {
        type: "text",
        requiredLevel: 1,
        title: "ПРОТОКОЛ №1",
        content: "Усі оперативники зобов'язані дотримуватися протоколу рівня Secure-7. Будь-яка несанкціонована передача координат об'єкта карається негайним відключенням від мережі."
    },
    "FILE_042_SUPER_SERVER_HISTORY.DAT": {
        type: "text",
        requiredLevel: 2,
        title: "ІСТОРІЯ ОБ'ЄКТА",
        content: "Початкові етапи колонізації Королівства Без Назви виявили аномальні коливання енергії у міру розширення інфраструктури та підключення автономних ботів."
    },
    "FILE_108_ANOMALY_SUBJECTS.ENC": {
        type: "text",
        requiredLevel: 3,
        title: "ЗАСЕКРЕЧЕНО [LEVEL 3]",
        content: "Виявлено невідомі суб'єкти поблизу захисного периметра. Ведеться постійний моніторинг частот та перехоплення пакетів даних."
    },
    "FILE_999_CORE_SYSTEM_KEY.RAW": {
        type: "text",
        requiredLevel: 4,
        title: "КРИТИЧНИЙ ДОПУСК [LEVEL 4]",
        content: "Головний ключ ядра системи. Використовується для аварійного перезапуску всіх вузлів зв'язку організації «Таємниці Світу»."
    },
    "FILE_042_ANOMALY_PHOTO.JPG": {
        type: "image",
        requiredLevel: 2,
        title: "ФОТОАЛЬБОМ АНОМАЛІЇ",
        url: "images/anomaly_042.jpg" // Заміниш на реальний шлях до фото, коли буде потрібно
    },
    "FILE_108_SECRET_DOC.PDF": {
        type: "external",
        requiredLevel: 3,
        url: "documents/file_108.pdf" // Відкриється в окремій вкладці
    },
    "FILE_109_SECRET_DOC.HTML": {
        type: "external",
        requiredLevel: 4,
        url: "documents/document_109.html" // Відкриється в окремій вкладці
    }
};

// Головна функція відкриття файлу з перевіркою рівнів допуску
function openFile(fileName, requiredLevel) {
    const file = ARCHIVE_FILES[fileName];
    const userLevel = parseInt(localStorage.getItem("tc_user_level") || "1");

    // Якщо файла немає в базі, але він є в HTML — створюємо базову текстову заглушку
    if (!file) {
        if (userLevel >= requiredLevel) {
            showTextModal(fileName, "Зміст цього файлу завантажується з центрального сервера.");
        } else {
            alert(`[ПОМИЛКА ДОСТУПУ]: Файл ${fileName} НЕДОСТУПНИЙ!\nПотрібен рівень допуску: Level ${requiredLevel}. Ваш рівень: Level ${userLevel}.`);
        }
        return;
    }

    // Перевірка прав допуску
    if (userLevel >= file.requiredLevel) {
        if (file.type === "text") {
            showTextModal(file.title, file.content);
        } else if (file.type === "image") {
            showImageModal(file.title, file.url);
        } else if (file.type === "external") {
            window.open(file.url, "_blank");
        }
    } else {
        alert(`[ПОМИЛКА ДОСТУПУ]: Файл ${fileName} НЕДОСТУПНИЙ!\nПотрібен рівень допуску: Level ${file.requiredLevel}.\nВаш поточний рівень: Level ${userLevel}.`);
    }
}

// Функція виведення текстового модального вікна
function showTextModal(title, content) {
    document.getElementById("modal-file-title").textContent = `📁 ${title}`;
    document.getElementById("modal-file-content").innerHTML = `<p>${content}</p>`;
    document.getElementById("file-reader-modal").style.display = "flex";
}

// Функція виведення зображення у модальному вікні (зберігає стиль термінала!)
function showImageModal(title, imageUrl) {
    document.getElementById("modal-file-title").textContent = `🖼️ ГРАФІЧНИЙ ДОКАЗ // ${title}`;
    document.getElementById("modal-file-content").innerHTML = `
        <div style="text-align: center;">
            <img src="${imageUrl}" alt="Засекречене фото" style="max-width: 100%; max-height: 300px; border-radius: 4px; border: 1px solid #3b82f6;" onerror="this.onerror=null; this.src=''; this.parentNode.innerHTML='<span style=\'color: #ef4444;\'>[ПОМИЛКА]: Файл зображення не знайдено на сервері у папка/шляху.</span>';">
        </div>
    `;
    document.getElementById("file-reader-modal").style.display = "flex";
}

// Закриття вікна читання
function closeFileReader() {
    document.getElementById("file-reader-modal").style.display = "none";
}

// Перевірка доступу до мережевих вузлів (з правильним блокуванням)
function checkNetworkAccess(targetPage, requiredLevel) {
    const userLevel = parseInt(localStorage.getItem("tc_user_level") || "1");

    if (userLevel >= requiredLevel) {
        window.location.href = targetPage;
    } else {
        alert(`[ПОМИЛКА ДОСТУПУ]: Вузол зв'язку заблоковано!\nПотрібен мінімальний рівень допуску: Level ${requiredLevel}.\nВаш поточний рівень: Level ${userLevel}.`);
        return false;
    }
}
