import { fromBase64, toBase64 } from "@smithy/util-base64";

type ChatNode = {
    self   : boolean,
    text   : string,
    hits   : number,
    deads  : number,

    children: ChatNode[],
}

export class ChatTree {
    nodes   = [] as ChatNode[];
    path    = [] as ChatNode[];

    constructor(autosaveInterval = 30_000) {
        if (autosaveInterval) {
            setInterval(() => this.saveTree(), autosaveInterval);
        }
    }

    saveTree() {
        compress(JSON.stringify({ nodes: this.nodes }))
        .then(
            data => localStorage.setItem(`nekto-auto-chatTree`, data)
        );
    }
    async loadTree() {
        const data = localStorage.getItem(`nekto-auto-chatTree`);

        if (data) {
            this.nodes = JSON.parse(await decompress(data)).nodes;
        } else {
            this.nodes = [];
        }
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

async function compress(str: string) {
    const encoder = new TextEncoder();
    const data    = encoder.encode(str);
    const cstream = new CompressionStream("deflate-raw");
    const writer  = cstream.writable.getWriter();

    writer.write(data);
    writer.close();

    const bytes = new Uint8Array(await new Response(cstream.readable).arrayBuffer());
    return toBase64(bytes);
}

async function decompress(str: string) {
    const bytes   = fromBase64(str).buffer;
    const dstream = new DecompressionStream("deflate-raw");
    const writer  = dstream.writable.getWriter();
    writer.write(bytes);
    writer.close();

    return await new Response(dstream.readable).text();
}