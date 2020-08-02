export class ChatLink {
    static prepareEvent(message, html) {
        let clickable = html.find('.message-sender');
        
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

            if(ChatLink.selectToken(data))
                ChatLink.panToTokenEvent(data);
        })
    }

    static buildData(html) {
        let result = {tokenId: '', actorId: '', sceneId: ''}

        let $tokenInfo = html.find('[data-token-id]');
        result.actorId = $tokenInfo.attr('data-actor-id');
        
        let tokenSceneId = $tokenInfo.attr('data-token-id');
        if (tokenSceneId) {
            let split = tokenSceneId.split('.');
            result.sceneId = split[0];
            result.tokenId = split[1];
        }

        if (!result.tokenId && !result.actorId) {
            ui.notification.warn('No token or actor associated with this message.')
            return null;
        }
        
        return result;
    }

    // If it's reached this far, assume scene is correct.
    static panToToken(data) {
        let actor = game.actors.tokens[data.tokenId];
        
        if(!actor)
            actor = canvas.tokens.get(data.tokenId).actor;

        let scale = canvas.scene._viewPosition.scale;

        canvas.animatePan({x: token.x, y: token.y, scale: scale, duration: 1000});
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
        let token = ChatLink.getToken(tokenId)
        if (token)
            canvas.scene.selectObjects(ChatLink.getCoords(token));
    }

    static targetToken(user, tokenId) {
        let token = ChatLink.getToken(tokenId);
        if (token)
            canvas.scene.targetObjects(ChatLink.getCoords(token));
    }

    static getCoords(token) {
        let result = { x: token.center.x, y: token.center.y, width: token.w, height: token.h }
        return result;
    }

    static hasPermission(user, tokenId) {
        let actor = game.actors.tokens[tokenId];
        
        if(!token)
            actor = canvas.tokens.get(tokenId).actor;

        return user.isGM || actor.hasPerm(user, "OWNER");
    }
}