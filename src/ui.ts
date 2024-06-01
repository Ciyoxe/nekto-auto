import { Event } from './event';

export class AutoUi {
    private updatePosition() {
        const main = document.querySelector(".chat-box.col-xs-12");

        if (main) {
            const mainRect = main.getBoundingClientRect();
            this.ui.style.left  = `${mainRect.right + 10}px`;
        } else {
            this.ui.style.left  = ``;
            this.ui.style.right = `50px`;
        }
    }

    onCapturingToggle = new Event<boolean>();
    onLeavingToggle   = new Event<boolean>();
    onMessagingToggle = new Event<boolean>();
    onSkippingToggle  = new Event<boolean>();
    
    ui: HTMLElement;

    constructor() {
        this.ui = document.createElement("div");

        this.ui.className          = "main_step chat-box";
        this.ui.style.margin       = "0";
        this.ui.style.position     = "fixed";
        this.ui.style.padding      = "10px";
        this.ui.style.top          = "60px";
        this.ui.style.width        = "300px";
        this.ui.style.height       = "600px";
        this.ui.style.borderRadius = "10px";
        this.ui.style.zIndex       = "2";

        this.ui.style.flexDirection = "column";
        this.ui.style.display       = "flex";
        this.ui.style.gap           = "10px";

        this.ui.innerHTML = `
        <button id="autoui-capturing" class="btn btn-default checked">Запись действий \u2713</button>
        <button id="autoui-leaving"   class="btn btn-default">Завершение чатов \u2717</button>
        <button id="autoui-messaging" class="btn btn-default">Отправка сообщений \u2717</button>
        <button id="autoui-skipping"  class="btn btn-default">Переключение чатов \u2717</button>
        <br>
        <div id="autoui-status"></div>
        <br>
        <div id="autoui-debug" style="overflow-y: scroll; background: #0002; border-radius: 4px; padding: 4px; height: 100%;"></div>
        `;

        document.body.appendChild(this.ui);

        this.ui.querySelector<HTMLElement>("#autoui-capturing")!.onclick = (ev) => {
            const element = ev.target as HTMLElement;

            if (element.classList.contains("checked")) {
                element.textContent = "Запись действий \u2717";
                element.classList.remove("checked");
                this.onCapturingToggle.emit(false);
            } else {
                element.textContent = "Запись действий \u2713";
                element.classList.add("checked");
                this.onCapturingToggle.emit(true);
            }
        }
        this.ui.querySelector<HTMLElement>("#autoui-leaving")!.onclick = (ev) => {
            const element = ev.target as HTMLElement;

            if (element.classList.contains("checked")) {
                element.textContent = "Завершение чатов \u2717";
                element.classList.remove("checked");
                this.onLeavingToggle.emit(false);
            } else {
                element.textContent = "Завершение чатов \u2713";
                element.classList.add("checked");
                this.onLeavingToggle.emit(true);
            }
        }
        this.ui.querySelector<HTMLElement>("#autoui-messaging")!.onclick = (ev) => {
            const element = ev.target as HTMLElement;

            if (element.classList.contains("checked")) {
                element.textContent = "Отправка сообщений \u2717";
                element.classList.remove("checked");
                this.onMessagingToggle.emit(false);
            } else {
                element.textContent = "Отправка сообщений \u2713";
                element.classList.add("checked");
                this.onMessagingToggle.emit(true);
            }
        }
        this.ui.querySelector<HTMLElement>("#autoui-skipping")!.onclick = (ev) => {
            const element = ev.target as HTMLElement;
            
            if (element.classList.contains("checked")) {
                element.textContent = "Переключение чатов \u2717";
                element.classList.remove("checked");
                this.onSkippingToggle.emit(false);
            } else {
                element.textContent = "Переключение чатов \u2713";
                element.classList.add("checked");
                this.onSkippingToggle.emit(true);
            }
        }

        setInterval(() => this.updatePosition(), 1000);
    }

    setStatus(status: string) {
        this.ui.querySelector<HTMLElement>("#autoui-status")!.innerHTML = status;
    }
    setDebug(debug: string) {
        this.ui.querySelector<HTMLElement>("#autoui-debug")!.innerHTML = debug;
    }
}