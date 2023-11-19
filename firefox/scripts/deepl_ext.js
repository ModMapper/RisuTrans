(function() {
    // RISUAI Check
    if(!/^\w+:\/\/risuai\.xyz\//.exec(document.referrer)) return;

    const script = document.createElement("script");
    script.defer = true;
    script.src = browser.extension.getURL("scripts/deepl.js");
    document.body.append(script);
})();