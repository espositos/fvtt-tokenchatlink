export class ChatLink {
    static clickTimeout = 250;
    static clickCount = 0;
    static clickTimer = null;
    static playerWarning = (data) => i18nFormat('tokenchatlink.notInSight', data);

    static prepareEvent(message, html, speakerInfo) {
        let clickable = html.find('.message-sender');

        let speaker = speakerInfo.message.speaker;
        let speakerData = {idScene: speaker.scene, idActor:speaker.actor, idToken: speaker.token, name: speaker.alias ?? i18n('tokenchatlink.genericName')}

        if (!speakerData.idScene)
            speakerData.idScene = speakerInfo.author.viewedScene;

        function clicks(speakerData) {
            ChatLink.clickCount++;
            if (ChatLink.clickCount == 1) {
                ChatLink.clickTimer = setTimeout(() => {
                    ChatLink.clickCount = 0;
                    ChatLink.selectToken(speakerData);
                }, ChatLink.clickTimeout);
            } else {
                ChatLink.clickCount = 0;
                clearTimeout(ChatLink.clickTimer);
                ChatLink.panToToken(speakerData);
            }
        }

        clickable.on('click', () => {clicks(speakerData)}).on('dblclick', (e) => {
            e.preventDefault();
        })
    }

    // If it's reached this far, assume scene is correct.
    static panToToken(speakerData) {
        let token = ChatLink.getToken(speakerData);
        let user = game.user;
        if (!ChatLink.isRightScene(user, speakerData))
            return;

        if (!ChatLink.permissionToSee(user, speakerData, token))
            return;

        let scale = canvas.scene._viewPosition.scale;

        canvas.animatePan({x: token.x, y: token.y, scale: scale, duration: 500});
    }

    static selectToken(speakerData) {
        let user = game.user;
        let message;
        if (!ChatLink.isRightScene(user, speakerData))
            return;

        let token = ChatLink.getToken(speakerData);

        if (!ChatLink.tokenExists(user, token))
            return;
        
        if (!ChatLink.permissionToControl(user, token)) {
            if (!ChatLink.permissionToSee(user, speakerData, token))
                return;
            
            ChatLink.targetToken(user, token);
            return;
        }

        ChatLink.doSelectToken(user, token);
    }

    static getToken(speakerData) {
        let token = game.actors.tokens[speakerData.idToken]?.token;
        if(!token)
            token = canvas.tokens.placeables.find(t => t.actor._id === speakerData.idActor);

        return token;
    }

    static isRightScene(user, speakerData) {
        if (canvas.scene._id === speakerData.idScene)
            return true;

        let sceneNote;
        if (!speakerData.idScene) {
            sceneNote = ` ${i18n('tokenchatlink.noSceneFound')}`;
        } else {
            let tokenScene = game.scenes.find(s => s.data._id === speakerData.idScene);
            sceneNote = ` ${i18nFormat('tokenchatlink.checkScene', {sceneName: tokenScene?.data.name})}`;
        }

        let message = user.isGM ? ChatLink.playerWarning(speakerData) + sceneNote : speakerData.name + ChatLink.playerWarning(speakerData);
        ChatLink.warning(message);
    }

    static tokenExists(user, token) {
        if (token)
            return true;

        let message = user.isGM ? speakerData.name + ChatLink.playerWarning(speakerData) + ` ${i18n('tokenchatlink.noTokenFound')}` : speakerData.name + ChatLink.playerWarning(speakerData);
        ChatLink.warning(message);
    }

    static permissionToSee(user, speakerData, token) {
        if (user.isGM || token.visible)
            return true;
        
        ChatLink.warning(speakerData.name + ChatLink.playerWarning(speakerData));
    }

    static permissionToControl(user, token) {
        return user.isGM || token.actor.hasPerm(user, "OWNER");
    }

    static doSelectToken(user, token) {
        canvas.getLayer('TokenLayer').selectObjects(ChatLink.getCoords(token));
    }

    static targetToken(user, token) {
        canvas.getLayer('TokenLayer').targetObjects(ChatLink.getCoords(token));
    }

    static getCoords(token) {
        let result = { x: token.center.x, y: token.center.y, width: 1, height: 1 }
        return result;
    }
    
    static warning(message) {
        ui.notifications.warn(message);
    }
}

const i18n = (toTranslate) => game.i18n.localize(toTranslate);
const i18nFormat = (toTranslate, data) => game.i18n.format(toTranslate, data);