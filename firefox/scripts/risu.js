(async function () {
    if (window._RISU_TRANS) return;
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
                frame.src = MobileCheck() ? "https://www.deepl.com/translator-mobile" : "https://www.deepl.com/translator";
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
            return function (text, source, target) {
                const task = lastTask;
                return lastTask = new Promise(async (resolve) => {
                    await task;
                    console.log({ text: text, source: source, target: target });
                    port.addEventListener("message", (evt) => resolve(evt.data), { once: true });
                    port.postMessage({ text: text, source: source, target: target });
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
        const txtTransOld = document.getElementById("messageInputTranslate");
        if (txtTransOld == null || txtTransOld.hasAttribute(CheckCode)) return;

        const txtTrans = txtTransOld.cloneNode(true);
        txtTrans.setAttribute(CheckCode, "");
        txtTransOld.after(txtTrans);
        txtTransOld.remove();

        const txtChatOld = document.querySelector(".default-chat-screen > div:first-child textarea");
        const buttonArea = txtChatOld.parentElement;

        const txtChat = txtChatOld.cloneNode(true);
        txtChatOld.after(txtChat);
        txtChatOld.remove();

        DelayValueCheck(txtTrans, async (value) => {
            txtChat.value = await translate(value, null, "EN");
            txtChatOld.value = txtChat.value;
            txtChatOld.dispatchEvent(new Event('input', { bubbles: true }));
        });
        DelayValueCheck(txtChat, async (value) => {
            txtTrans.value = await translate(value, null, "KO");
        });
        txtChat.addEventListener("input", () => {
            txtChatOld.value = txtChat.value;
            txtChatOld.dispatchEvent(new Event('input', { bubbles: true }));
        });

        txtTrans.addEventListener("keydown", EnterEvent);
        txtChat.addEventListener("keydown", EnterEvent);
        buttonArea.addEventListener("click", (evt) => {
            const buttonIcon = buttonArea.querySelector(".lucide-send");
            if (buttonIcon != null && buttonIcon.parentElement.contains(evt.target)) {
                txtTrans.value = txtChat.value = "";
            }
        })

        function EnterEvent(evt) {
            if (evt.keyCode == 13) {
                buttonArea.querySelector(".lucide-send").parentElement.click();
                evt.preventDefault();
            }
        }
    });

    function DelayValueCheck(input, callback) {
        let value = input.value;
        input.addEventListener("input", Check, { once: true });

        function Check() {
            const current = input.value;
            if (value != current) {
                callback(value = current);
                setTimeout(Check, 1000);
            } else {
                input.addEventListener("input", Check, { once: true });
            }
        }
    }

    function MobileCheck() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
})();

