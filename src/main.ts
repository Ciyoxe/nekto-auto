import { AutoUi      } from "./ui";
import { AutoChat    } from "./chatAuto";
import { NektoPlugin } from "./nektoPlugin";

async function main() {
    const plugin   = new NektoPlugin();
    const automate = await new AutoChat(plugin).init();
    const ui       = new AutoUi();
    
    if (plugin) {
        plugin.onNewMessage.on(()=> {});
    }

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
        ui.setDebug(
            automate.tree.nextNodes.map(node => {
                const factor = Math.round((node.deads / node.hits) * 255);
                const style  = `color: rgb(${factor}, ${128}, ${255-factor})`;
                return `<span style="${style}">${node.text.substring(0, 50)}</span>`;
            })
            .join("<br>"),
        );
    }, 200);
};

try {
    main();
} catch (e) {
    console.log("Error: ", e);
}