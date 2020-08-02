import {ChatLink} from './chatlink.js';

Hooks.on('renderChatMessage', (message, html, speakerInfo) => {
    ChatLink.prepareEvent(message, html, speakerInfo);
});