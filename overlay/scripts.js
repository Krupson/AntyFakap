const currentUrl = location.href.replace(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^\n\s]+)$/gi, "$1");

applyOverlayIfProd();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type == "UPDATE_OVERLAY") {
        applyOverlayIfProd();
    }
});

function isOverlayAdded() {
    return document.getElementById("anty-fakap-overlay") != undefined;
}

function applyOverlayIfProd() {
    chrome.storage.sync.get("urls", function (obj) {
        let match = obj.urls.find(function (url) {
            return currentUrl.startsWith(url);
        });
        if (match != undefined) {
            addOverlay();
        } else {
            removeOverlay();
        }
    });
}

function addOverlay() {
    if (!isOverlayAdded()) {
        let overlay = document.createElement("div");
        overlay.id = "anty-fakap-overlay"
        document.body.appendChild(overlay);
    }
}

function removeOverlay() {
    if (isOverlayAdded()) {
        let overlay = document.getElementById("anty-fakap-overlay");
        document.body.removeChild(overlay);
    }
}