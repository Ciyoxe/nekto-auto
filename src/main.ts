import { AutoUi      } from "./ui";
import { AutoChat    } from "./chatAuto";
import { NektoPlugin } from "./nektoPlugin";

async function main() {
    const plugin   = new NektoPlugin();
    const automate = await new AutoChat(plugin).init();
    const ui       = new AutoUi();
    
    document.addEventListener("keydown", (e) => {
        if (e.code === "KeyN" && e.altKey && e.ctrlKey) {
            if (plugin.state.status === "in-active-chat")
                plugin.state.exitChat();
        }
    })
    setInterval(() => document.dispatchEvent(new MouseEvent("mousemove")), 200);

    ui.onCapturingToggle
        .on((val) => automate.capturing = val);
    ui.onLeavingToggle
        .on((val) => automate.leaving = val);
    ui.onMessagingToggle
        .on((val) => automate.messaging = val);
    ui.onSkippingToggle
        .on((val) => automate.skipping = val);
    
    plugin.onStateChanged.on(({ curr })=> {
        switch (curr) {
            case "captcha-solving":
                ui.setStatus("Решите каптчу");
                break;
            case "chat-end-confirmation":
                ui.setStatus("Завершение чата");
                break;
            case "chat-finished-by-nekto":
            case "chat-finished-by-self":
                ui.setStatus("Чат завершен");
                break;
            case "in-params-menu":
                ui.setStatus("Меню параметров");
                break;
            case "in-queue-waiting":
                ui.setStatus("Ожидание собеседника...");
                break;
            case "in-active-chat":
                ui.setStatus("В чате");
                break;
        }
    });
    setInterval(() => {
        if (plugin.status === "in-active-chat") {
            if (automate.isStopped) {
                ui.setStatus("В чате");
            } else {
                ui.setStatus("В чате<br>Автоматический режим");
            }
        }
    }, 200);
    setInterval(() => {
        const elements = [] as string[];
        automate.tree.nextNodes.forEach(node => {
            const text = node.text.trim()
                .replaceAll("\n", " ")
                .replaceAll("\t", " ")
                .replaceAll("<", " ")
                .replaceAll(">", " ")
                .replaceAll("  ", " ")
                .substring(0, 30);

            if (text.length === 0)
                return;

            const factor = Math.round((node.deads / node.hits) * 255);
            const style  = (node.hits === 0 || node.self) ?
                `color: rgb(255, 255, 255)` :
                document.body.classList.contains("night_theme") ?
                    `color: rgb(${factor}, 200, ${255-factor});` :
                    `color: rgb(${Math.round(factor * 0.8)}, 0, ${Math.round((255-factor) * 0.8)});`;
            elements.push(`<span style="${style}">${text}</span>`);
        })

        ui.setDebug(elements.join("<br>"));
    }, 1000);
};

try {
    main();
} catch (e) {
    console.log("Error: ", e);
}
