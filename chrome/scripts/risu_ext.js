(function() {
    const script = document.createElement("script");
    script.defer = true;
    script.src = chrome.runtime.getURL("scripts/risu.js");
    document.body.append(script);
})();