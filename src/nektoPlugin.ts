import { Event } from "./event";

export type ChatStatus = 
    | null
    | "captcha-solving"
    | "in-active-chat"
    | "chat-finished-by-nekto"
    | "chat-finished-by-self"
    | "chat-end-confirmation"
    | "in-params-menu"
    | "in-queue-waiting";
export type ChatState = 
  | {
    status: null,
} | {
    status: "captcha-solving",
} | {
    status  : "in-active-chat",

    sendMessage : (text: string) => void,
    exitChat    : () => void,
} | {
    status: "chat-finished-by-nekto" | "chat-finished-by-self",

    exitToMenu : () => void,
    nextChat   : () => void,
} | {
    status: "chat-end-confirmation",

    confirmExit : () => void,
    cancelExit  : () => void,
} | {
    status: "in-params-menu",

    startChat : () => void,
} | {
    status: "in-queue-waiting",

    exitQueue : () => void,
};


export class NektoPlugin {
    private updateStatus() {
        const currStatus = getStatus();
        const prevStatus = this.state.status;

        if (currStatus === prevStatus)
            return;

        switch (currStatus) {
            case "captcha-solving":
                this.state = {
                    status: "captcha-solving",
                };
                break;
            case "in-params-menu":
                this.state = {
                    status: "in-params-menu",
                    startChat,
                }
                break;
            case "in-queue-waiting":
                this.state = {
                    status: "in-queue-waiting",
                    exitQueue,
                }
                break;
            case "chat-end-confirmation":
                this.state = {
                    status: "chat-end-confirmation",
                    confirmExit,
                    cancelExit,
                }
                break;
            case "in-active-chat":
                this.state = {
                    status  : "in-active-chat",
                    sendMessage,
                    exitChat,
                }
                break;
            case "chat-finished-by-nekto":
                this.state = {
                    status: "chat-finished-by-nekto",
                    exitToMenu,
                    nextChat,
                }
                break;
            case "chat-finished-by-self":
                this.state = {
                    status: "chat-finished-by-self",
                    exitToMenu,
                    nextChat,
                }
                break;
            default:
                this.state = { status: null }
        }

        this.onStateChanged.emit({ prev: prevStatus, curr: currStatus });
    }

    private updateMessages() {
        const newMessages = getMessages();

        if (this.messages.length < newMessages.length) {
            for (let i = this.messages.length; i < newMessages.length; i++) {
                this.messages.push(newMessages[i]);
                this.onNewMessage.emit(newMessages[i]);
            }
        }
    }

    private updateTyping() {
        const isTyping = isUserTyping();

        if (this.isUserTyping !== isTyping) {
            this.isUserTyping = isTyping;
            this.onUserTyping.emit(isTyping);
        }
    }
    
    private init() {
        this.onStateChanged.on(({ prev, curr }) => {
            if (curr === "in-active-chat" && prev !== "chat-end-confirmation")
                this.messages.length = 0;
        })

        const update = ()=> {
            this.updateTyping();
            this.updateStatus();
            this.updateMessages();

            if (this.updateTime !== null)
                setTimeout(update, this.updateTime);
        };
        update();
    }

    /** Time in milliseconds between each update, null to disable */
    updateTime     = 1000 as number | null;
    state          = { status: null } as ChatState;
    messages       = [] as { text: string, self: boolean }[];
    isUserTyping   = false;

    onStateChanged = new Event<{ prev: ChatStatus, curr: ChatStatus }>();
    onNewMessage   = new Event<{ text: string, self: boolean }>();
    onUserTyping   = new Event<boolean>();
    
    constructor() {
        this.init();
    }

    get status() { return this.state.status; }
}

function getMessages() {
    const blocks   = document.querySelectorAll(".mess_block");
    const messages = [] as { text: string, self: boolean }[];
    
    for (const block of blocks) {
        const self = block.classList.contains("self");
        const text = block.querySelector(".window_chat_dialog_text")?.textContent;

        if (text !== undefined && text !== null) 
            messages.push({ text, self });
    }
    return messages;
}
function sendMessage(text: string) {
    const inputBlock = document.querySelector<HTMLElement>(".input_block");
    const sendButton = document.querySelector<HTMLElement>("#sendMessageBtn");

    if (inputBlock === null || sendButton === null) {
        throw new Error("Not in chat state");
    }
    inputBlock.textContent = text;
    sendButton.click();
}
function exitChat() {
    const exitButton = document.querySelector<HTMLElement>(".close_dialog_btn");

    if (exitButton === null) {
        throw new Error("Not in chat state");
    }
    exitButton.click();
}
function exitToMenu() {
    for (const button of document.querySelectorAll<HTMLElement>(".talk_over_button")) {
        if (button.textContent?.includes("Изменить параметры")) {
            button.click();
            return;
        }
    }
    throw new Error("Not in chat-finished state");
}
function nextChat() {
    for (const button of document.querySelectorAll<HTMLElement>(".talk_over_button")) {
        if (button.textContent?.includes("Начать новый чат")) {
            button.click();
            return;
        }
    }
    throw new Error("Not in chat-finished state");
}
function confirmExit() {
    const button = document.querySelector<HTMLElement>(".swal2-confirm");

    if (button === null) {
        throw new Error("Not in confirmation state");
    }
    button.click();
}
function cancelExit() {
    const button = document.querySelector<HTMLElement>(".swal2-cancel");

    if (button === null) {
        throw new Error("Not in confirmation state");
    }
    button.click();
}
function startChat() {
    const button = document.querySelector<HTMLElement>("#searchCompanyBtn");

    if (button === null) {
        throw new Error("Not in params-menu state");
    }
    button.click();
}
function exitQueue() {
    const button = document.querySelector<HTMLElement>(".btn-stop-search");

    if (button === null) {
        throw new Error("Not in queue-waiting state");
    }
    button.click();
}
function getStatus() {
    const mask_block = document.querySelector<HTMLElement>("#mask_cap");
    if (mask_block !== null && mask_block.style.display !== "none")
        return "captcha-solving";

    if (document.querySelector(".mainStep.chat-box") !== null)
        return "in-params-menu";
    if (document.querySelector("#search_company_loading") !== null)
        return "in-queue-waiting";
    if (document.querySelector(".swal2-popup") !== null)
        return "chat-end-confirmation";

    if (document.querySelector(".chat_step") !== null) {
        const endStatus = document.querySelector<HTMLElement>(".status-end");

        if (endStatus !== null && endStatus.style.display !== "none") {
            const overlay = document.querySelector(".talk_over_text");

            if (overlay !== null && overlay.textContent?.startsWith("Собеседник завершил чат"))
                return "chat-finished-by-nekto";
            else
                return "chat-finished-by-self";
        }
        return "in-active-chat";
    }

    return null;
}
function isUserTyping() {
    const marker = document.querySelector<HTMLElement>(".window_chat_dialog_write span");

    if (marker === null)
        return false;

    return marker.style.visibility !== "hidden";
}