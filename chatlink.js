export class ChatLink {
    static prepareEvent(message, html) {
        let clickable = html.find('tag speaker')
        
        clickable.on('click', (e) => {
            e.preventDefault();

            let data = ChatLink.buildData(html);
            
            if (!data)
                return;

            ChatLink.selectToken(data);
        });

        clickable.on('dblclick', (e) => {
            e.preventDefault();

            let data = ChatLink.buildData(html);
            
            if (!data)
                return;

            if(ChatLink.selectTokenEvent(data))
                ChatLink.panToTokenEvent(data);
        })
    }

    static buildData(html) {
        let result = {tokenId: '', actorId: '', sceneId: ''}

        let $tokenInfo = html.find('[data-token-id]');
        result.actorId = $tokenInfo.attr('data-actor-id');
        
        let tokenSceneId = $tokenInfo.attr('data-token-id');
        if (tokenSceneId) {
            let split = tokenSceneId.split('.')
            result.sceneId = split[0];
            result.tokenId = split[1];
        }

        if (!result.tokenId && !result.actorId) {
            ui.notification.warn('No token or actor associated with this message.')
            return null;
        }
        
        return result;
    }

    static selectTokenEvent(data) {
        let token = game.actors.tokens[data.tokenId];
        
        if (!token)
            token = canvas.tokens.placeables.find(t => t.data._id === data.tokenId);

        canvas.
    }

    // If it's reached this far, assume scene is correct.
    static panToToken(data) {
        let actor = game.actors.tokens[data.tokenId];
        
        if(!actor)
            actor = canvas.tokens.get(data.tokenId).actor;

        let scale = canvas.scene._viewPosition.scale;

        canvas.pan(actor.x, actor.y, scale);
    }

    static selectToken(tokenId, actorId, sceneId) {
        if (!ChatLink.tokenExists(tokenId)) {
            ui.notification.warn('No matching token found.')    
            return false;
        }
        
        let user = game.user;
        if (!userHasPermission(user, tokenId)) {
            ChatLink.targetToken(user, tokenId);
            return true;
        }

        let scene = game.scenes.find(scene => scene._id === sceneId);
        if (!ChatLink.tokenInScene(tokenId)){
            ui.notification.warn(`This token is not on this scene. Check scene '${scene.displayName}'`)
            return false;
        }

        ChatLink.doSelectToken(user, tokenId);

        return true;
    }

    static doSelectToken(user, tokenId) {

    }

    static targetToken(user, tokenId) {

    }

    static hasPermission(user, tokenId) {
            let actor = game.actors.tokens[tokenId];
            
            if(!actor)
                actor = canvas.tokens.get(tokenId).actor;

            return user.isGM || actor.hasPerm(user, "OWNER");
    }
}