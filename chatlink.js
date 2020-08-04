export class ChatLink {
    static clickTimeout = 250;
    static clickCount = 0;
    static clickTimer = null;
    static playerWarning = (data) => ChatLink.i18nFormat('tokenchatlink.notInSight', data);

    static i18n = (toTranslate) => game.i18n.localize(toTranslate);
    static i18nFormat = (toTranslate, data) => game.i18n.format(toTranslate, data);
    
    static prepareEvent(message, html, speakerInfo) {
        let clickable = html.find('.message-sender');

        ChatLink.formatLink(clickable);

        let speaker = speakerInfo.message.speaker;
        let speakerData = {idScene: speaker.scene, idActor:speaker.actor, idToken: speaker.token, name: speaker.alias ?? ChatLink.i18n('tokenchatlink.genericName')}

        if (!speakerData.idScene)
            speakerData.idScene = speakerInfo.author.viewedScene;

        function clicks(e, speakerData) {
            ChatLink.clickCount++;
            if (ChatLink.clickCount == 1) {
                ChatLink.clickTimer = setTimeout(() => {
                    ChatLink.clickCount = 0;
                    ChatLink.selectToken(e, speakerData);
                }, ChatLink.clickTimeout);
            } else {
                ChatLink.clickCount = 0;
                clearTimeout(ChatLink.clickTimer);
                ChatLink.panToToken(e, speakerData);
            }
        }

        clickable.on('click', (e) => {
            clicks(e, speakerData)
        }).on('dblclick', (e) => {
            e.preventDefault();
        });
    }

    // If it's reached this far, assume scene is correct.
    static panToToken(event, speakerData) {
        let user = game.user;
        if (!ChatLink.isRightScene(user, speakerData))
        return;
        
        let token = ChatLink.getToken(speakerData);
        if (!ChatLink.permissionToSee(user, speakerData, token))
            return;

        let scale = canvas.scene._viewPosition.scale;

        canvas.animatePan({x: token.x, y: token.y, scale: scale, duration: 500});
    }

    static selectToken(event, speakerData) {
        let user = game.user;
        
        if (!ChatLink.isRightScene(user, speakerData))
            return;

        let token = ChatLink.getToken(speakerData);
        if (!ChatLink.tokenExists(user, speakerData, token))
            return;

        if (!ChatLink.permissionToSee(user, speakerData, token))
            return;

        ChatLink.doSelectToken(event, user, token);
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
            sceneNote = ` ${ChatLink.i18n('tokenchatlink.noSceneFound')}`;
        } else {
            let tokenScene = game.scenes.find(s => s.data._id === speakerData.idScene);
            sceneNote = ` ${ChatLink.i18nFormat('tokenchatlink.checkScene', {sceneName: tokenScene?.data.name})}`;
        }

        let message = user.isGM ? ChatLink.playerWarning(speakerData) + sceneNote : ChatLink.playerWarning(speakerData);
        ChatLink.warning(message);
    }

    static tokenExists(user, speakerData, token) {
        if (token && token.interactive)
            return true;

        let message = user.isGM ? ChatLink.playerWarning(speakerData) + ` ${ChatLink.i18n('tokenchatlink.noTokenFound')}` : ChatLink.playerWarning(speakerData);
        ChatLink.warning(message);
    }

    static permissionToSee(user, speakerData, token) {
        if (user.isGM || token.visible)
            return true;
        
        ChatLink.warning(ChatLink.playerWarning(speakerData));
    }

    static permissionToControl(user, token) {
        return user.isGM || token.actor.hasPerm(user, "OWNER");
    }

    static doSelectToken(event, user, token) {
        if (!ChatLink.permissionToControl(user, token)) {      
            ChatLink.targetToken(event, user, token);
            return;
        }

        let shiftKey = event.shiftKey;
        let ctrlKey = event.ctrlKey;

        if (shiftKey) {
            ChatLink.targetToken(event, user, token, ctrlKey);
        } else {
            ChatLink.controlToken(event, user, token, ctrlKey);
        }
    }

    static controlToken(event, user, token, ctrlKey) {
        let releaseOthers = {releaseOthers: !ctrlKey};
        if (token._controlled && ctrlKey)
            token.release();
        else
            token.control(releaseOthers);
    }

    static targetToken(event, user, token, ctrlKey) {
        let releaseOthers = {releaseOthers: !ctrlKey};
        if (token.isTargeted && ctrlKey)
            token.setTarget(false, releaseOthers)
        else
            token.setTarget(true, releaseOthers);
    }

    static getCoords(token) {
        let result = { x: token.center.x, y: token.center.y, width: 1, height: 1 }
        return result;
    }
    
    static warning(message) {
        ui.notifications.warn(message);
    }

    static formatLink(html) {
        html.hover(() => {
            html.addClass('tokenChatLink')
            const tooltip = document.createElement("SPAN");
            tooltip.classList.add('tooltip');
            tooltip.textContent = 'test';
            html.appendChild(tooltip)
        }, 
        () => {
            html.removeClass('tokenChatLink')
            let tooltip = html.querySelector('.tooltip');
            html.removeChild(tooltip);
        });
    }
}