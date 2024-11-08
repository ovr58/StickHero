import { _decorator, Animation, Component, director, Node, Sprite, SpriteFrame, tween, UITransform, Vec3, view } from 'cc'
import {AudioController} from './AudioController'
import { PlayerStates } from '../States/PlayerStates'
const { ccclass, property } = _decorator

@ccclass('GameStart') 
export class GameStart extends Component {

    @property(Node) gameStartButton: Node = null
    
    @property(Node) playerStub: Node = null 
    
    @property(Node) platformStub: Node = null 
    
    @property(Animation) animation: Animation = null 
    
    @property(Node) soundToggleButton: Node = null
    
    @property(SpriteFrame) soundOnSprite: SpriteFrame = null
    
    @property(SpriteFrame) soundOffSprite: SpriteFrame = null 
    
    private audioController: AudioController = null 
    
    animationTime: number = 0.5 
    
    protected onLoad(): void { 
        director.preloadScene("GameScene") 
        
        if (this.gameStartButton) { 
            this.gameStartButton.on(
                Node.EventType.TOUCH_END, this.onTouchEnd, this
            ) 
        } 
        
        if (this.soundToggleButton) {
            this.soundToggleButton.on(
                Node.EventType.TOUCH_END, this.onSoundToggleButtonClicked, this
            ) 
        } 
    } 
    
    protected start(): void { 
        this.animation = this.getComponent(Animation)
        this.animation.play(
            PlayerStates.Idle
        ) 
        
        this.audioController = AudioController.getInstance()
        
        this.updateSoundButtonSprite() 
    } 
    
    /** * Handler for the game start button touch event. */
    
    onTouchEnd() { 
        
        this.soundToggleButton.active = false 
        this.gameStartButton.active = false 

        this.audioController.playSound(
            this.audioController.buttonClickSound
        ) 
        const platformTransform = this.platformStub.getComponent(UITransform)
        const playerTransform = this.playerStub.getComponent(UITransform)
        const targetPlatformPosition = new Vec3(
            -view.getVisibleSize().width / 2, -480, 0
        ) 
        const targetPlayerPosition = new Vec3(
            platformTransform.width / 2 - playerTransform.width / 1.2, this.playerStub.position.y, 0
        )

        tween(this.platformStub).to(
            this.animationTime, {
                position: targetPlatformPosition
            }).start()
            
        tween(this.playerStub).to(
            this.animationTime, { 
                position: targetPlayerPosition 
            }).start()

        this.scheduleOnce(
            () => { 
                
                director.loadScene('GameScene') 
            
            }, this.animationTime
        )
     } 
     
     /** * Handler for the sound toggle button touch event. */
     
     onSoundToggleButtonClicked() {
        
        this.audioController.toggleSound()
        
        this.updateSoundButtonSprite()
    
    } 
    
    /** * Updates the sprite of the sound toggle button based on the sound state. */ 
    
    updateSoundButtonSprite() {
        
        this.audioController.playSound(
            this.audioController.buttonClickSound
        ) 
        
        const sprite = this.soundToggleButton.getComponent(Sprite) 
        
        if (this.audioController.IsMuted) {
            
            sprite.spriteFrame = this.soundOffSprite
        
        } else { 
            
            sprite.spriteFrame = this.soundOnSprite 
        
        } 
    
    } 

}


