import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass } = _decorator;

@ccclass('BonusItems')
export class BonusItems extends Component {
    /**
     * Initializes the bonus item.
     * @param {number} positionX - The x position of the bonus item.
     */
    initPlatform(positionX: number) {
        console.log(positionX, this.node.position.y)
       this.node.setPosition(new Vec3(positionX, this.node.position.y, 0))
    }
}


