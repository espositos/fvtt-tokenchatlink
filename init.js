import {ChatLink} from './chatlink.js';
Hooks.on('init', () => {
    loadTemplates([
        'modules/token-chat-link/templates/instructions.hbs',
    ]);
});

Hooks.on('renderChatMessage', (message, html, speakerInfo) => {
    ChatLink.prepareEvent(message, html, speakerInfo);
});