(async function() {
    if(window._RISU_TRANS) return;
    window._RISU_TRANS = true;

    function CreateTranslatorAsync() {
        const CheckCode = "RISUAITRANS";
        return new Promise(async (resolve, reject) => {
            const frame = await CreateFrameAsync();
            const message = new MessageChannel();
            message.port1.start();
            setTimeout(() => {
                frame.contentWindow.postMessage(CheckCode, "*", [message.port2]);
                resolve(GetTranslator(message.port1));
            }, 5000);
        });
        function CreateFrameAsync() {
            return new Promise((resolve) => {
                const frame = document.createElement("iframe");
                frame.src = "https://www.deepl.com/translator";
                frame.tabIndex = -1;
                frame.style = "width: 500px; height: 500px; border: none;";
                frame.onload = () => resolve(frame);
                const div = document.createElement("div");
                div.style = "position: absolute; top: 0; left: 0; width: 0; height: 0; overflow: hidden;";
                div.append(frame);
                document.body.append(div);
            });
        }
        function GetTranslator(port) {
            let lastTask = Promise.resolve();
            return function(text, source, target) {
                const task = lastTask;
                return lastTask = new Promise(async (resolve) => {
                    await task;
                    console.log({text: text, source: source, target: target});
                    port.addEventListener("message", (evt) => resolve(evt.data), { once: true });
                    port.postMessage({text: text, source: source, target: target});
                });
            }
        }
    }
    const translate = await CreateTranslatorAsync();
    window.RunTranlateAsync = (text, source, target) => {
        return translate(text, source, target);
    };

    document.addEventListener("click", () => {
        const CheckCode = "CHAT_TRANS";
        const txtRisuTrans = document.getElementById("messageInputTranslate");
        if(txtRisuTrans == null || txtRisuTrans.hasAttribute(CheckCode)) return;

        const txtTrans = txtRisuTrans.cloneNode(true);
        txtTrans.setAttribute(CheckCode, "");
        txtRisuTrans.after(txtTrans);
        txtRisuTrans.remove();

        const txtChat = document.querySelector(".default-chat-screen > div:first-child textarea");

        DelayValueCheck(txtTrans, async (value) => {
            txtChat.value = await translate(value, null, "EN");
        });
        DelayValueCheck(txtChat, async (value) => {
            txtTrans.value = await translate(value, null, "KO");
        });
    });

    function DelayValueCheck(input, callback) {
        let value = input.value;
        let changed = false;
        setInterval(() => {
            const current = input.value
            if(current != value && changed) {
                value = current;
                callback(current);
            }
            changed = false;
        }, 2000);
        input.addEventListener("input", (evt) => changed = true);
    }
})();

