import { compress, decompress } from 'lz-string';
type ChatNode = {
    self   : boolean,
    text   : string,
    hits   : number,
    deads  : number,

    children: ChatNode[],
}

export class ChatTree {
    profile = "";
    nodes   = [] as ChatNode[];
    path    = [] as ChatNode[];

    constructor(profile: string, autosaveInterval = 30_000) {
        this.loadTree(profile, []);
        
        if (autosaveInterval) {
            setInterval(() => this.saveTree(), autosaveInterval);
        }
    }

    saveTree() {
        localStorage.setItem(`nekto-auto-chatTree-${this.profile}`, compress(JSON.stringify({ nodes: this.nodes })));
    }
    loadTree(profileName: string, conversation: { text: string, self: boolean }[]) {
        try {
            const tree = JSON.parse(decompress(localStorage.getItem(`nekto-auto-chatTree-${profileName}`)!));
            this.nodes = tree.nodes;
        }
        catch {
            this.nodes = [];
        }

        this.path.length = 0;
        for (const message of conversation) {
            this.moveNext(message.text, message.self);
        }

        this.profile = profileName;
    }
    deleteSave(profileName: string) {
        localStorage.removeItem(`nekto-auto-chatTree-${profileName}`);
    }
    renameSave(oldName: string, newName: string) {
        localStorage.setItem(`nekto-auto-chatTree-${newName}`, localStorage.getItem(`nekto-auto-chatTree-${oldName}`)!);
        localStorage.removeItem(`nekto-auto-chatTree-${oldName}`);
    }
    /** moves to next node in conversation or creates new */
    moveNext(text: string, self: boolean) {
        const nextNodes = this.nextNodes;

        for (const candidate of nextNodes) {
            if (candidate.self === self && candidate.text.toUpperCase().trim() === text.toUpperCase().trim()) {
                this.path.push(candidate);
                return;
            }
        }

        const newNode = {
            self,
            text,
            hits : 0,
            deads: 0,
            children: [],
        }
        nextNodes.push(newNode);
        this.path.push(newNode);
    }
    reset() {
        this.path.length = 0;
    }

    get currentNode() {
        return this.path[this.path.length - 1] ?? null;
    }
    get nextNodes() {
        const  currentNode = this.path[this.path.length - 1];
        return currentNode ? currentNode.children : this.nodes;
    }
    get depth() {
        return this.path.length;
    }
}