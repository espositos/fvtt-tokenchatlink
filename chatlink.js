export class ChatLink {
    static delay = 500;
    static clicks = 0;
    static timer = null;

    static prepareEvent(message, html, speakerInfo) {
        let clickable = html.find('.message-sender');

        let speaker = speakerInfo.message.speaker;
        let data = {sceneId: speaker.scene, actorId:speaker.actor, tokenId: speaker.token}

        if (!data.sceneId)
            data.sceneId = speakerInfo.author.viewedScene;

        clickable.on('click', (e) => {
            e.preventDefault();

            ChatLink.selectToken(data);
        }).on('dblclick', (e) => {
            if(ChatLink.selectToken(data))
                ChatLink.panToToken(data);
        })
    }

    // If it's reached this far, assume scene is correct.
    static panToToken(data) {
        let token = ChatLink.getToken(data);

        let scale = canvas.scene._viewPosition.scale;

        canvas.animatePan({x: token.x, y: token.y, scale: scale, duration: 500});
    }

    static selectToken(data) {
        if (canvas.scene._id !== data.sceneId){
            let sceneWarning = 'No token found in this scene.';
            if (game.user.isGM) {
                let scene = game.scenes.find(s => s.data._id === data.sceneId);
                sceneWarning += ` Check scene ${scene?.data.name}`;
            }
            ui.notifications.warn(sceneWarning);
            return false;
        }

        let token = ChatLink.getToken(data);

        if (!token) {
            ui.notifications.warn('No matching token found.'); 
            return false;
        }
        
        let user = game.user;
        if (!ChatLink.userHasPermission(user, token)) {
            ChatLink.targetToken(user, token);
            return true;
        }

        ChatLink.doSelectToken(user, token);

        return true;
    }

    static getToken(data) {
        let token = game.actors.tokens[data.tokenId]?.token;
        if(!token)
            token = canvas.tokens.placeables.find(t => t.actor._id === data.actorId);

        return token;
    }

    static doSelectToken(user, token) {
        canvas.getLayer('TokenLayer').selectObjects(ChatLink.getCoords(token));
    }

    static targetToken(user, token) {
        canvas.getLayer('TokenLayer').targetObjects(ChatLink.getCoords(token));
    }

    static getCoords(token) {
        let result = { x: token.center.x, y: token.center.y, width: token.w, height: token.h }
        return result;
    }

    static userHasPermission(user, token) {
        return user.isGM || token.actor.hasPerm(user, "OWNER");
    }
}