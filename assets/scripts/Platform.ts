import { _decorator, BoxCollider2D, CCBoolean, CCFloat, Component, Node, Size, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator

@ccclass('Platform')
export class Platform extends Component {
    @property({ 
        type: CCFloat,
        displayName: 'Min Width', 
        tooltip: 'Minimum width of platform' 
    })
    platformMinWidth: number = 50;
 
    @property({ 
        type: CCFloat, 
        displayName: 'Max Width', 
        tooltip: 'Maximum width of platform' 
    })
    platformMaxWidth: number = 300;
 
    @property({ 
        type: Node, 
        displayName: 'Bonus Platform', 
        tooltip: 'Bonus platform' 
    })
    bonusPlatform: Node = null;
 
    @property({ 
        type: CCFloat, 
        displayName: 'Bonus Platform Min Width', 
        tooltip: 'Minimum width of bonus platform' 
    })
    bonusPlatformMinWidth: number = 10;
 
    @property({ 
        type: CCFloat, 
        displayName: 'Bonus Platform Max Width', 
        tooltip: 'Maximum width of bonus platform' 
    })
    bonusPlatformMaxWidth: number = 50;
 
    @property({ 
        type: CCBoolean, 
        displayName: 'Bonus Platform showed', 
        tooltip: 'Represents if the bonus platform is showed' 
    })
    bonusPlatformShowed: boolean = true;
 
    // Called when the script is loaded
    onLoad() {
        this.bonusPlatform.setSiblingIndex(999);
    }
 
    // Initialize the platform with given position and width
    initPlatform(positionX: number, initialWidth: number = 0, bonusPlatformVisible: boolean = true) {
        console.log("initPlatform", positionX, initialWidth);
 
        this.node.setPosition(new Vec3(positionX, this.node.position.y, 0));
        const uiTransform = this.node.getComponent(UITransform)
        uiTransform.width = initialWidth > 0 ? initialWidth : this.platformMinWidth + Math.random() * (this.platformMaxWidth - this.platformMinWidth)
        
        const collider = this.node.getComponent(BoxCollider2D)
        collider.size.width = uiTransform.width
        collider.size.height = uiTransform.height - 5
        collider.offset = new Vec2(0, -5)

        console.log('COLLIDER - ', collider)
 
        let bonusPlatformProportion = (uiTransform.width - this.platformMinWidth) / (this.platformMaxWidth - this.platformMinWidth)
        const bonusUITransform = this.bonusPlatform.getComponent(UITransform)
        bonusUITransform.width = this.bonusPlatformMinWidth + bonusPlatformProportion * (this.bonusPlatformMaxWidth - this.bonusPlatformMinWidth)
        this.setBonusPlatformVisibility(bonusPlatformVisible)
        console.log("Platform width set to", uiTransform.width)
        console.log("Bonus Platform width set to", bonusUITransform.width)
    }
 
    // Check if the stick is touching the platform or bonus platform
    isStickTouching(stickRightX: number): boolean {
        console.log("isStickTouching", stickRightX, this.node.position.x, this.node.getComponent(UITransform).width)
        const bonusPlatformLeft = this.node.position.x + this.bonusPlatform.position.x - this.bonusPlatform.getComponent(UITransform).width / 2
        const bonusPlatformRight = this.node.position.x + this.bonusPlatform.position.x + this.bonusPlatform.getComponent(UITransform).width / 2
        if (this.bonusPlatform.active && stickRightX > bonusPlatformLeft && stickRightX < bonusPlatformRight)
        { 
            console.log("Bonus platform touched")
            this.node.emit('bonusPlatformTouched')
        } 
        const platformLeft = this.node.position.x - this.node.getComponent(UITransform).width / 2
        const platformRight = this.node.position.x + this.node.getComponent(UITransform).width / 2
        if (stickRightX > platformLeft && stickRightX < platformRight) 
        {
            console.log("Platform touched")
            return true 
        } 
        return false
    }
 
    // Set the visibility of the bonus platform
    setBonusPlatformVisibility(visible: boolean) {
        this.bonusPlatform.active = this.bonusPlatformShowed = visible;
    }
}


