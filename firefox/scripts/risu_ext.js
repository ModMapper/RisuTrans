(function() {
    const script = document.createElement("script");
    script.defer = true;
    script.src = browser.extension.getURL("scripts/risu.js");
    document.body.append(script);
})();