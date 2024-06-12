import { AutoChat    } from "./chatAuto";
import { NektoPlugin } from "./nektoPlugin";

export class HotkeyMgr {
    enabled = true;

    constructor(plugin: NektoPlugin, automate: AutoChat) {
        document.addEventListener("keydown", (ev) => {
            if (!this.enabled)
                return;
            if (!ev.ctrlKey)
                return;

            if (ev.code === "ArrowRight" && plugin.state.status === "in-active-chat")
                plugin.state.exitChat();
            if (ev.code === "ArrowDown" && plugin.state.status === "in-active-chat")
                automate.sendMessage();
            if (ev.code === "ArrowUp") {
                const minutes = Number.parseInt(prompt("Откат. Время в минутах:", "3")!);
                if (Number.isFinite(minutes))
                    automate.tree.restoreCheckpoint(minutes * 60_000);
            }
        });
    }
}