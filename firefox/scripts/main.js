browser.webRequest.onHeadersReceived.addListener(
    async function(details) {
        if(!/^\w+:\/\/risuai\.xyz\//.exec(details.documentUrl)) return;
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