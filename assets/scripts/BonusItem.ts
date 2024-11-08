import { _decorator, Component, Vec3 } from 'cc';
const { ccclass } = _decorator;

@ccclass('BonusItem')
export class BonusItem extends Component {
    /**
     * Initializes the bonus item.
     * @param {number} positionX - The x position of the bonus item.
     */
    initPlatform(positionX: number) {
        console.log('INIT BONUS ITEM -', positionX, this.node.position.y)
       this.node.setPosition(new Vec3(positionX, -380, 0))
    }
}


