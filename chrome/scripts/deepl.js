(async function() {
    // Wait Attach Port
    const portTask = new Promise((resolve) => {
        const CheckCode = "RISUAITRANS";
        window.addEventListener("message", MessageListener);
        function MessageListener(evt) {
            if(evt.data != CheckCode) return;
            window.removeEventListener("message", MessageListener);
            evt.ports[0].postMessage(CheckCode);
            resolve(evt.ports[0]);
        }
    });

    // Wait Translator Load
    const loadTask = new Promise((resolve) => {
        loop();
        function loop() {
            if(window._webTranslator_LMT != null) {
                setTimeout(resolve, 5000);
                return;
            }
            setTimeout(loop, 500);
        }
    });


    // Get Translators
    await loadTask;
    const translator = window._webTranslator_LMT;
    const triggerContext = translator.features.get("/translator/core/triggerSourceTranslation");
    const translateContext = translator.features.get("/translator/core/translateSourceSentences");
    const sourceLangContext = translator.features.get("/translator/core/sourceLanguages");
    const targetLangContext = translator.features.get("/translator/core/targetLanguages");
    const sourceTextInput = document.querySelector("d-textarea[aria-labelledby=translation-source-heading]");
    const port = await portTask;

    // 제한해제
    _webTranslator_LMT.features.get("/translator/core/config").set("CONFIG__MAX_NUM_CHARACTERS", 100000);

    // states
    let lastSentences = [];
    let translateState = false;
    let requestState = false;

    // Remove Banner
    const banner = document.querySelector("[data-testid=dl-cookieBanner]");
    if(banner != null) banner.remove();

    // on requset started. 
    triggerContext.onSourceTranslationShouldUpdate.push(() => requestState = false);

    // on new translations arrived.
    translateContext.onTranslationsHaveChanged.push((evt) => {
        if(translateState) {
            Response(evt.langContext.targetSentences);
            translateState = false;
        } 
    });

    // on message port event.
    port.onmessage = (evt) => {
        const data = evt.data;
        Request(data.text, data.source, data.target);
    };
    console.log("DeepL Translator Loaded");
    
    function Request(text, source, target) {
        // Set translate data
        sourceTextInput.value = text;
        ChangeLanguage(sourceLangContext, source);
        ChangeLanguage(targetLangContext, target);

        setTimeout(() => {
            // Check Changed
            translateState = true;
            requestState = true;
            triggerContext.checkForChangedSourceEdit();
            if(requestState) {
                // if not changed, send current translations.
                Response(lastSentences);
            }
        }, 0);
    }

    function Response(sentences) {
        lastSentences = sentences;
        const result = sentences.map((v) => v.getText()).join("");
        port.postMessage(result);
    }

    function ChangeLanguage(context, lang) {
        if(lang == null || lang.length == 0) return;
        lang = lang.toLowerCase();
        for(const item of context.getLanguages()) {
            if(item.lang.toLowerCase() == lang) {
                context.setCurrentLanguage(item);
                return;
            }
        }
    }
})();