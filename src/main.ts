import { AutoUi        } from "./ui";
import { AutoChat      } from "./chatAuto";
import { NektoPlugin   } from "./nektoPlugin";
import { ThemeProvider } from "./theme";

async function main() {
    const plugin   = new NektoPlugin();
    const automate = new AutoChat(plugin);
    const ui       = new AutoUi();
    const theme    = new ThemeProvider();
    
    setInterval(() => document.dispatchEvent(new MouseEvent("mousemove")), 200);

    ui.onLeavingToggle
        .on((val) => automate.leaving = val);
    ui.onMessagingToggle
        .on((val) => automate.messaging = val);
    ui.onSkippingToggle
        .on((val) => automate.skipping = val);
    ui.onThemeToggle
        .on((val) => val ? theme.setheme() : theme.removeTheme());
    
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
            default:
                ui.setStatus("");
                break;
        }
    });
    setInterval(() => {
        const elements = [] as string[];
        automate.tree.nextNodes.forEach(node => {
            const text = node.text
                .replaceAll("\n", " ")
                .replaceAll("\t", " ")
                .replaceAll("<", " ")
                .replaceAll(">", " ")
                .replaceAll("  ", " ")
                .trim()
                .substring(0, 30);

            if (text.length === 0)
                return;

            const dark  = document.body.classList.contains("night_theme");
            const color = 
                node.self ?
                    (dark ? "#8caaee" : "darkblue") :
                node.dead ?
                    (dark ? "#e78284" : "darkred") :
                    (dark ? "#a6d189" : "darkgreen");
                
            elements.push(`<span style="color: ${color}">${text}</span>`);
        })

        ui.setDebug(elements.join("<br>"));
    }, 1000);
};

try {
    main();
} catch (e) {
    console.log("Error: ", e);
}
