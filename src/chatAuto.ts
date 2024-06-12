import { NektoPlugin } from "./nektoPlugin";
import { ChatTree    } from "./chatTree";


export class AutoChat {
    private sendMessage() {
        if (!this.messaging) {
            return;
        }
        
        const candidates = this.tree.nextNodes.filter(c => c.self);

        if (candidates.length === 0) {
            return;
        }

        const text = getOneOf(candidates.map(c => c.text));

        if (this.plugin.state.status === "in-active-chat" && text !== null)
            this.plugin.state.sendMessage(text);
    }
    private waitForMessage() {
        const minWaitLimit =  2_000;
        const maxWaitLimit = 10_000;

        let   status    = "waiting" as "waiting" | "user-answered" | "user-inactive" | "typing-timeout";
        let   pauseTime = Date.now();
        const startTime = Date.now();
        
        const finish = () => {
            this.plugin.onUserTyping.off(stopTyping);
            this.plugin.onNewMessage.off(getMessage);
            clearInterval(interval);

            if (status !== "user-answered")
                this.sendMessage();
        };
        const stopTyping = (typing: boolean) => {
            if (!typing)
                pauseTime = Date.now();
        };
        const getMessage = ({ self }: { self: boolean, text: string }) => {
            if (!self)
                status = "user-answered";
        };
        
        this.plugin.onUserTyping.on(stopTyping);
        this.plugin.onNewMessage.on(getMessage);

        const interval = setInterval(() => {
            if (Date.now() - startTime > maxWaitLimit)
                status = "typing-timeout";
            if (!this.plugin.isUserTyping && Date.now() - pauseTime > minWaitLimit)
                status = "user-inactive";

            if (status !== "waiting")
                finish();
        }, 100);
    }
    private doNextAction() {
        const currentNode = this.tree.currentNode;
        const candidates  = this.tree.nextNodes;

        // dead-end branch - exit from chat
        if (this.leaving && !currentNode.self && currentNode.dead) {
            if (this.plugin.state.status === "in-active-chat")
                this.plugin.state.exitChat();
            return;
        }

        if (candidates.length === 0) {
            return;
        }

        const waitingHits = candidates.filter(c => !c.self).length;
        const messageHits = candidates.filter(c =>  c.self).length + 1;

        if (decide(waitingHits / (waitingHits + messageHits))) {
            this.waitForMessage();
            return;
        }

        this.sendMessage();
    }

    // user settings
    messaging = false;
    leaving   = false;
    skipping  = false;

    private plugin : NektoPlugin;
    

    tree      : ChatTree;
    maxDepth  = 7;
    isStopped = false;

    constructor(plugin: NektoPlugin) {
        this.tree   = new ChatTree();
        this.plugin = plugin;

        plugin.onStateChanged.on(({ prev, curr }) => {
            if (curr === "chat-finished-by-self")
                if (this.tree.currentNode && this.tree.depth < this.maxDepth)
                    this.tree.currentNode.dead = true;
            if (prev !== "chat-end-confirmation" && curr === "in-active-chat")
                this.tree.reset();
            if (this.skipping) {
                if (plugin.state.status === "chat-finished-by-self" || plugin.state.status === "chat-finished-by-nekto")
                    plugin.state.nextChat();
                if (plugin.state.status === "chat-end-confirmation")
                    plugin.state.confirmExit();
            }
        });
        plugin.onNewMessage.on(({ text, self }) => {
            if (this.tree.depth >= this.maxDepth)
                return;

            this.tree.moveNext(text, self);
            this.doNextAction();
        });
    }
}


// just helpers
function decide(chance: number) {
    return Math.random() <= chance;
}
function getOneOf<T>(elems: T[]) {
    return elems[Math.floor(Math.random() * elems.length)] ?? null;
}