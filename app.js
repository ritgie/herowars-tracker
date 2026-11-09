const defaultMembers = [
    { id: "350301620", name: "A   I   M", zone: "Asia/Manila", country: "Philippinen", authHash: "hash-350301620" },
    { id: "350334136", name: "Arican", zone: "Asia/Tokyo", country: "Japan", authHash: "hash-350334136" },
    { id: "350229387", name: "Babacan", zone: "Asia/Bangkok", country: "tbd (Standard)", authHash: "hash-350229387" },
    { id: "350342532", name: "Bob", zone: "Europe/Berlin", country: "Europa", authHash: "hash-350342532" },
    { id: "350305384", name: "Faezshura", zone: "Asia/Kuala_Lumpur", country: "Malaysia", authHash: "hash-350305384" },
    { id: "350316317", name: "Fern", zone: "Europe/Kyiv", country: "Ukraine", authHash: "hash-350316317" },
    { id: "354240626", name: "Friar Tuck", zone: "Europe/Kyiv", country: "Ukraine", authHash: "hash-354240626" },
    { id: "350291331", name: "Giannis", zone: "Europe/Athens", country: "Griechenland", authHash: "hash-350291331" },
    { id: "350293572", name: "Grim Cat", zone: "Europe/Moscow", country: "Russland", authHash: "hash-350293572" },
    { id: "353429821", name: "Gur", zone: "Europe/Kyiv", country: "Ukraine", authHash: "hash-353429821" },
    { id: "352309706", name: "ICQ", zone: "America/Santiago", country: "Chile", authHash: "hash-352309706" },
    { id: "350329640", name: "K E N N Y", zone: "Europe/Kyiv", country: "Ukraine", authHash: "hash-350329640" },
    { id: "350264276", name: "kacok", zone: "Europe/Kyiv", country: "Ukraine", authHash: "hash-350264276" },
    { id: "356574113", name: "Kieman", zone: "Europe/Vienna", country: "Österreich", authHash: "hash-356574113" },
    { id: "350218852", name: "KOREA - no.19", zone: "Asia/Seoul", country: "Sued-Korea", authHash: "hash-350218852" },
    { id: "350270263", name: "LostInTexas", zone: "America/Chicago", country: "Texas", authHash: "hash-350270263" },
    { id: "352499542", name: "Losungchih", zone: "Asia/Seoul", country: "Sued-Korea", authHash: "hash-352499542" },
    { id: "350318894", name: "Nagami", zone: "Asia/Tokyo", country: "Japan", authHash: "hash-350318894" },
    { id: "350258418", name: "Rammstein", zone: "Asia/Bangkok", country: "Thailand", authHash: "hash-350258418" },
    { id: "350290279", name: "sMarioo", zone: "Asia/Bangkok", country: "tbd (Standard)", authHash: "hash-350290279" },
    { id: "350234201", name: "Tut", zone: "Europe/Kyiv", country: "Ukraine", authHash: "hash-350234201" },
    { id: "350316066", name: "Vanessa", zone: "Europe/Kyiv", country: "Ukraine", authHash: "hash-350316066" },
    { id: "350246180", name: "Vira", zone: "Europe/Warsaw", country: "Polen", authHash: "hash-350246180" },
    { id: "350349949", name: "VooDoo", zone: "America/Chicago", country: "Texas", authHash: "hash-350349949" },
    { id: "350234840", name: "Vox", zone: "Europe/Kyiv", country: "Ukraine", authHash: "hash-350234840" },
    { id: "350227794", name: "xzshka", zone: "Asia/Bangkok", country: "tbd (Standard)", authHash: "hash-350227794" }
];

// 2. Das Übersetzungswörterbuch (Deutsch & Englisch als Fallback)
const translations = {
    de: {
        title: "HeroWars Arena Reset Tracker",
        subtitle: "Finger weg von Gildenmitgliedern in der roten Phase!",
        editBtn: "✏️ Bearbeiten",
        localTime: "Ortszeit",
        resetIn: "Reset in",
        dangerStatus: "⚠️ GEFAHR: FINGER WEG!",
        safeStatus: "✅ Sicher zu attackieren",
        modalTitle: " bearbeiten",
        modalSecurity: "Bitte gib deine geheime Gilden-PIN ein, um deine Zeitzone anzupassen.",
        labelPin: "Deine geheime PIN:",
        placeholderPin: "Deine PIN eingeben",
        labelCountry: "Neues Land / Zeitzone wählen:",
        btnSave: "Speichern",
        btnCancel: "Abbrechen",
        alertWrongPin: "Falsche Gilden-PIN! Zugriff verweigert."
    },
    en: {
        title: "HeroWars Arena Reset Tracker",
        subtitle: "Do not attack guild members during their red phase!",
        editBtn: "✏️ Edit",
        localTime: "Local Time",
        resetIn: "Reset in",
        dangerStatus: "⚠️ DANGER: DO NOT ATTACK!",
        safeStatus: "✅ Safe to attack",
        modalTitle: "Edit ",
        modalSecurity: "Please enter your secret guild PIN to adjust your time zone.",
        labelPin: "Your secret PIN:",
        placeholderPin: "Enter your PIN",
        labelCountry: "Select new country / time zone:",
        btnSave: "Save",
        btnCancel: "Cancel",
        alertWrongPin: "Incorrect guild PIN! Access denied."
    }
};

// Systemsprache ermitteln (wenn nicht 'de', dann standardmäßig 'en')
const userLang = navigator.language.startsWith("de") ? "de" : "en";
const lang = translations[userLang];

let members = [...defaultMembers];
let currentEditingMemberId = null;

function generateHash(input) {
    return "hash-" + input.trim();
}

// Statische Oberflächentexte übersetzen
function applyStaticTranslations() {
    document.getElementById("main-title").innerText = lang.title;
    document.getElementById("main-subtitle").innerText = lang.subtitle;
    document.getElementById("label-pin").innerText = lang.labelPin;
    document.getElementById("label-country").innerText = lang.labelCountry;
    document.getElementById("btn-save").innerText = lang.btnSave;
    document.getElementById("btn-cancel").innerText = lang.btnCancel;
}

function loadSavedData() {
    const saved = localStorage.getItem("hw_tracker_custom_zones");
    if (saved) {
        const customZones = JSON.parse(saved);
        members = defaultMembers.map(m => {
            if (customZones[m.id]) {
                return { ...m, zone: customZones[m.id].zone, country: customZones[m.id].country };
            }
            return m;
        });
    }
}

function updateTracker() {
    const listElement = document.getElementById("member-list");
    if (!listElement) return;
    
    // Altes Layout leeren, damit gelöschte Mitglieder komplett verschwinden
    listElement.innerHTML = "";
    
    const now = new Date();

    // Vor dem Zeichnen berechnen wir für jeden Spieler die Restzeit zum Sortieren
    const membersWithTime = members.map(member => {
        try {
            const localTimeString = now.toLocaleString("en-US", { timeZone: member.zone });
            const localDate = new Date(localTimeString);
            
            let resetDate = new Date(localDate);
            resetDate.setHours(20, 0, 0, 0);

            if (localDate >= resetDate) {
                resetDate.setDate(resetDate.getDate() + 1);
            }

            // Differenz in Millisekunden
            const diffMs = resetDate - localDate;
            return { member, localDate, diffMs };
        } catch (e) {
            console.error(e);
            return { member, localDate: now, diffMs: 999999999 }; // Fehlerhafte Zeitzonen nach unten schieben
        }
    });

    // Sortieren! Geringste Restzeit (Hot Phase) kommt nach oben
    membersWithTime.sort((a, b) => a.diffMs - b.diffMs);

    // Jetzt zeichnen wir die Karten in der neuen, sortierten Reihenfolge
    membersWithTime.forEach(({ member, localDate, diffMs }) => {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        // Den timeString für den Reset-Countdown generieren
        const timeString = `${diffHours}h ${diffMinutes}m`;

        const isHotPhase = (diffHours === 0); 

        // Karte neu erstellen
        const card = document.createElement("div");
        card.id = `card-${member.id}`;
        
        listElement.appendChild(card);

        card.className = `card ${isHotPhase ? 'warning' : ''}`;
        
        // --- Datums- und Uhrzeitkomponenten einzeln für die Formatierung extrahieren ---
        const currentLangTag = userLang === "de" ? "de-DE" : "en-US";
        
        const weekday = localDate.toLocaleDateString(currentLangTag, { weekday: 'short' });
        const datePart = localDate.toLocaleDateString(currentLangTag, { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timePart = localDate.toLocaleTimeString(currentLangTag, { hour: '2-digit', minute: '2-digit', hour12: userLang !== "de" });

        // Zusammenbauen des Strings: Ortszeit: <Wochentag> - <Datum> - <Uhrzeit>
        const fullDateTimeString = `${lang.localTime}: ${weekday} - ${datePart} - ${timePart}`;

        card.innerHTML = `
            <button class="edit-btn" onclick="openEditModal('${member.id}')">${lang.editBtn}</button>
            <h3>${member.name}</h3>
            <p style="margin: 0; font-size: 0.85em; color: #8a8ab0;">${member.country}</p>
            <!-- Kompakte Schriftgröße und Umbruchschutz für die einzeilige Anzeige -->
            <div class="time-info" style="font-size: 0.85em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><strong>${fullDateTimeString}</strong></div>
            <div class="time-info">${lang.resetIn}: <span class="countdown">${timeString}</span></div>
            <div class="status-text ${isHotPhase ? 'danger' : 'safe'}">
                ${isHotPhase ? lang.dangerStatus : lang.safeStatus}
            </div>
        `;
    });
}

window.openEditModal = function(id) {
    const member = members.find(m => m.id === id);
    if (!member) return;

    currentEditingMemberId = id;
    
    // Modal-Texte dynamisch übersetzen
    document.getElementById("modal-title").innerText = userLang === "de" ? member.name + lang.modalTitle : lang.modalTitle + member.name;
    document.getElementById("modal-security-info").innerText = lang.modalSecurity;
    
    const inputField = document.getElementById("input-id");
    inputField.value = "";
    inputField.placeholder = lang.placeholderPin;
    
    const select = document.getElementById("select-country");
    for (let option of select.options) {
        if (option.value.startsWith(member.zone)) {
            select.value = option.value;
            break;
        }
    }

    document.getElementById("edit-modal").style.display = "flex";
}

document.getElementById("btn-cancel").addEventListener("click", () => {
    document.getElementById("edit-modal").style.display = "none";
});

document.getElementById("btn-save").addEventListener("click", () => {
    const enteredPassword = document.getElementById("input-id").value.trim();
    const member = members.find(m => m.id === currentEditingMemberId);
    
    if (!member) return;

    const enteredHash = generateHash(enteredPassword);

    if (enteredHash !== member.authHash) {
        alert(lang.alertWrongPin);
        return;
    }

    const selectValue = document.getElementById("select-country").value;
    const [zone, country] = selectValue.split("|");

    let saved = localStorage.getItem("hw_tracker_custom_zones");
    let customZones = saved ? JSON.parse(saved) : {};
    
    customZones[currentEditingMemberId] = { zone, country };
    localStorage.setItem("hw_tracker_custom_zones", JSON.stringify(customZones));

    loadSavedData(); // Lädt die Daten direkt neu in die Liste
    updateTracker();

    document.getElementById("edit-modal").style.display = "none";
});

// Start-Aufrufe (stehen ganz links am Rand)
applyStaticTranslations();
loadSavedData();
setInterval(updateTracker, 1000);
updateTracker();
// Test fuer Git Push
