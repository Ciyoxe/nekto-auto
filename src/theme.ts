export class ThemeProvider {
    private style = document.createElement("style");

    setheme() {
        this.style.innerHTML = theme;
        
        if (!this.style.isConnected) {
            document.head.appendChild(this.style);
        }
    }
    removeTheme() {
        if (this.style.isConnected) {
            this.style.remove();
        }
    }
}

const theme = `
:root {
    --night-background-color: #303446;
    --night-modal-background: #303446;
    --night-chat-message-area-background: #303446;
    --night-chat-message-area-wrapper-background: #303446;
    --night-active-checkbox-background-color: #B9BAF1;
    --night-active-checkbox-adult-background-color: #e78284;
    --night-active-checkbox-roles-background-color: #cb9ce8;
    --night-checkbox-background-color: #414558;
    --night-header-adult-background-color: #443D4E;
    --night-header-roles-background-color: #3A3257;
    --night-checkbox-border-color: #51576d;
    --night-disabled-checkbox-background-color: #777d99;
    --night-chat-messages-self-background: #414558;
    --night-chat-messages-self-color: #c6d0f5;
    --night-chat-messages-self-border-color: #51576d;
    --night-chat-messages-nekto-background: #414558;
    --night-chat-messages-nekto-color: #c6d0f5;
    --night-chat-messages-nekto-border-color: #51576d;
    --night-header-background-color: #303446;
    --night-button-new-chat-color: #A6D088;
    --night-button-stop-color: #8caaee;
    --night-button-scan-color: #A6D088;
    --night-button-stop-talk-color: #A6D088;
    --night-button-send-message-color: #A6D088;
    --night-text-color: #c6d0f5;
    --night-button-continue-color: #ef9f76;
    --night-chat-unread-message-background: #393e51;
    --night-complain-link: 
}
body.night_theme {
    background: #292c3c !important;
}
.night_theme .btn-default,
.night_theme .adult_topic_search .btn-default,
.night_theme .roles_topic_search .btn-default {
    color: #c6d0f5 !important;
}
.night_theme .btn-default.checked,
.night_theme .adult_topic_search .btn-default.checked,
.night_theme .adult_topic_search .btn-default.checked.disabled,
.night_theme .roles_topic_search .btn-default.checked,
.night_theme .roles_topic_search .btn-default.checked.disabled {
    color: #282B3C !important;
}
#reportIcon {
    opacity: 0.7;
}
.window_chat_message {
    padding: 15px 30px;   
}
.message_box_block {
    width: 100%;
    border: 2px solid #51576d;
    border-radius: 10px;
}
center,
.navbar .pritch,
.header_chat .left_block_hc,
.chat_message_ava,
.window_chat_ava,
.window_chat_icon_my {
    display: none
}
.night_theme .navbar {
    background: #232634
}
`;