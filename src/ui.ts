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

    onLeavingToggle   = new Event<boolean>();
    onMessagingToggle = new Event<boolean>();
    onSkippingToggle  = new Event<boolean>();
    onHotkeysToggle   = new Event<boolean>();
    onThemeToggle     = new Event<boolean>();
    onDataAccess      = new Event();
    
    ui: HTMLElement;

    constructor() {
        this.ui = document.createElement("div");

        Object.assign(this.ui.style, {
            margin        : "0",
            padding       : "10px",
            position      : "fixed",
            top           : "60px",
            width         : "300px",
            height        : "600px",
            borderRadius  : "10px",
            zIndex        : "2",
            flexDirection : "column",
            display       : "flex",
            gap           : "10px",
        });
        
        this.ui.className = "main_step chat-box";
        this.ui.innerHTML = `
        <button id="autoui-leaving"   class="btn btn-default">Завершение чатов \u2717</button>
        <button id="autoui-messaging" class="btn btn-default">Отправка сообщений \u2717</button>
        <button id="autoui-skipping"  class="btn btn-default">Переключение чатов \u2717</button>
        <button id="autoui-hotkeys"   class="btn btn-default">Хоткеи \u2717</button>
        <button id="autoui-theme"     class="btn btn-default">Темная тема \u2717</button>
        <button id="autoui-data"      class="btn btn-default">Данные чатов</button>
        <br>
        <div id="autoui-status"></div>
        <br>
        <div id="autoui-debug" style="overflow-y: scroll; background: #0002; border-radius: 4px; padding: 4px; height: 100%;"></div>
        `;
        document.body.appendChild(this.ui);

        this.ui.querySelector<HTMLElement>("#autoui-leaving")!.onclick = (ev) => {
            this.onLeavingToggle.emit(toggleBtn(ev, "Завершение чатов"));
        }
        this.ui.querySelector<HTMLElement>("#autoui-messaging")!.onclick = (ev) => {
            this.onMessagingToggle.emit(toggleBtn(ev, "Отправка сообщений"));
        }
        this.ui.querySelector<HTMLElement>("#autoui-skipping")!.onclick = (ev) => {
            this.onSkippingToggle.emit(toggleBtn(ev, "Переключение чатов"));
        }
        this.ui.querySelector<HTMLElement>("#autoui-theme")!.onclick = (ev) => {
            this.onThemeToggle.emit(toggleBtn(ev, "Темная тема"));
        }
        this.ui.querySelector<HTMLElement>("#autoui-hotkeys")!.onclick = (ev) => {
            this.onHotkeysToggle.emit(toggleBtn(ev, "Хоткеи"));
        }
        this.ui.querySelector<HTMLElement>("#autoui-data")!.onclick = () => {
            this.onDataAccess.emit();
        };

        this.ui.querySelector<HTMLElement>("#autoui-hotkeys")!.title = `
        ctrl + ➡ - Завершить чат
        ctrl + ⬆ - Откатить сохранение
        ctrl + ⬇ - Написать первым
        `;

        setInterval(() => this.updatePosition(), 1000);
    }
    setStatus(status: string) {
        this.ui.querySelector<HTMLElement>("#autoui-status")!.innerHTML = status;
    }
    setDebug(debug: string) {
        this.ui.querySelector<HTMLElement>("#autoui-debug")!.innerHTML = debug;
    }
}

function toggleBtn(ev: MouseEvent, title: string) {
    const element = ev.target as HTMLElement;

    if (element.classList.contains("checked")) {
        element.textContent = title + " \u2717";
        element.classList.remove("checked");
        return false;
    } else {
        element.textContent = title + " \u2713";
        element.classList.add("checked");
        return true;
    }
}