chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        if(!/^\w+:\/\/risuai\.xyz/.exec(details.initiator)) return;
        let responseHeaders = details.responseHeaders.filter(header => {
            const name = header.name.toLowerCase();
            return name != 'x-frame-options' && name != 'content-security-policy';
        });
        return { responseHeaders: responseHeaders };
    },
    {
        urls: ["*://www.deepl.com/translator*"],
        types: ["sub_frame"]
    },
    ["blocking", "responseHeaders"]
);