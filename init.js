Hooks.on('renderChatMessage', (message, html, speakerInfo) => {
    ChatLink.prepareEvent(message, html);
});