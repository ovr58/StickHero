import { PlayerStates } from './States/PlayerStates'
import { _decorator, Animation, Component, log, tween, UITransform, Vec3} from 'cc'
const { ccclass, property } = _decorator
 
@ccclass('Hero')
export class Hero extends Component {
    @property(Animation)
    animation: Animation = null
 
    private playerState: PlayerStates = PlayerStates.Idle
    public isFlipped: boolean = false
 
    // Called when the script is loaded
    onLoad() {
        this.setState(PlayerStates.Idle)
    }
 
    // Set the player's state and play the corresponding animation
    setState(state: PlayerStates) {
        if (this.playerState !== state) {
            this.playerState = state
            this.animation.play(state)
            log('Player state:', state, 'Animation:', this.animation.name)
        }
    }
 
    // Get the current state of the player
    getState(): PlayerStates {
        return this.playerState
    }
 
    // Flip the player vertically
    flipPlayer() {
        this.isFlipped = !this.isFlipped
        const uiTransform = this.node.getComponent(UITransform)
        this.node.setScale(new Vec3(1, this.isFlipped ? -1 : 1, 1))
        const newY = this.isFlipped ? this.node.position.y - uiTransform.width - 5 : this.node.position.y + uiTransform.width + 5
        this.node.setPosition(new Vec3(this.node.position.x, newY, 0)) 
        console.log('Player flipped:', this.isFlipped, 'New Position Y:', newY)
    }
 
    // Make the player fall off the screen
    fall() {
        this.setState(PlayerStates.Falling)
        tween(this.node) .to(0.5, {
            position: new Vec3(this.node.position.x, -1200, 0) 
        }).start()
    }
 
}