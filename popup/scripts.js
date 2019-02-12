const addWebsiteError = document.getElementById("add-website-error");
const addWebsiteInput = document.getElementById("add-website-input");
const addWebsiteButton = document.getElementById("add-website-button");
const prodWebsitesContainer = document.getElementById("prod-websites");
const addWebsiteMatchIndicator = document.getElementById("add-website-match-indicator");

let currentMatch = "";

chrome.storage.sync.get("urls", function (obj) {
    updateProdWebsites(obj.urls);
});

loadLanguageStrings();
addWebsiteInput.min = 0;
addWebsiteInput.value = 0;
addWebsiteInput.oninput = function () {
    updateMatchIndicatorValue();
    showError(false);
}
updateMatchIndicatorValue();

addWebsiteButton.onclick = function () {
    const url = currentMatch;
    chrome.storage.sync.get("urls", function (obj) {
        if (obj.urls.indexOf(url) >= 0) {
            showError(chrome.i18n.getMessage("websiteDuplicationError"));
            return;
        }
        obj.urls.push(url);
        chrome.storage.sync.set({ urls: obj.urls }, function () {
            updateProdWebsites(obj.urls);
            sendOverlayUpdateRequest();
        });
    });
}

function loadLanguageStrings() {
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
        const key = node.getAttribute("data-i18n");
        node.innerText = chrome.i18n.getMessage(key);
    });
}

function updateProdWebsites(urls) {
    prodWebsitesContainer.innerHTML = "";
    urls.forEach(url => {
        appendProdWebsite(url);
    })
    if (prodWebsitesContainer.innerHTML == "") {
        prodWebsitesContainer.innerHTML = '<p id="no-content">' + chrome.i18n.getMessage("noProdWebsites") + '</p>';
    }
}

function appendProdWebsite(url) {
    const container = document.createElement("div");
    container.classList = ["prod-website"];

    const address = document.createElement("p");
    address.classList = ["prod-website-address"];
    address.innerText = url;

    const removeButton = document.createElement("button");
    removeButton.classList = ["prod-website-remove"];
    removeButton.innerText = "X";
    removeButton.onclick = function () {
        removeProdWebsiteButtonClick(url);
    }
    container.append(address, removeButton);
    prodWebsitesContainer.appendChild(container);
}

function removeProdWebsiteButtonClick(urlToRemove) {
    chrome.storage.sync.get("urls", function (obj) {
        const newUrls = obj.urls.filter(url => {
            return url != urlToRemove;
        });
        chrome.storage.sync.set({ urls: newUrls }, function () {
            updateProdWebsites(newUrls);
            sendOverlayUpdateRequest();
        });
    });
}

function sendOverlayUpdateRequest() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_OVERLAY" });
    });
}

function updateMatchIndicatorValue() {
    chrome.tabs.getSelected(null, function (tab) {
        const indicatorLevel = Math.round(addWebsiteInput.value);
        addWebsiteMatchIndicator.innerHTML = getMatchIndicatorValue(tab.url, indicatorLevel);
        addWebsiteInput.max = getUrlParts(tab.url).length - 1;
        currentMatch = getMatchUrl(tab.url, indicatorLevel);
    });
}

function showError(error) {
    if (error == false) {
        addWebsiteError.innerHTML = "&nbsp;";
    } else {
        addWebsiteError.innerText = error;
    }
}

function getUrlParts(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^\n\s]+)$/gi, "$1");
    return url.split("/");
}

function getMatchUrl(url, level) {
    const parts = getUrlParts(url);
    return parts.slice(0, level + 1).join("/");
}

function getMatchIndicatorValue(url, level) {
    const parts = getUrlParts(url);
    const fullUrl = parts.join("/");
    const indicatedPart = parts.slice(0, level + 1).join("/");
    return fullUrl.replace(indicatedPart, '<span class="indicated">' + indicatedPart + '</span>');
}