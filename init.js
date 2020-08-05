import {ChatLink} from './chatlink.js';
Hooks.on('init', () => {
    loadTemplates([
        'modules/token-chat-link/templates/instructions.hbs',
    ]);

    game.settings.register('token-chat-link','hoverTooltip', {
        name : game.i18n.localize('tokenchatlink.settings.hoverTooltip.name'),
        hint : game.i18n.localize('tokenchatlink.settings.hoverTooltip.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { ChatLink.updateSettings(); }
    });
});

Hooks.on('renderChatMessage', (message, html, speakerInfo) => {
    ChatLink.prepareEvent(message, html, speakerInfo);
});