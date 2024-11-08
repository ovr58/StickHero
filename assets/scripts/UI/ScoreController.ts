import { _decorator, Component, Node, Label, tween, Vec3, UIOpacity } from 'cc'

const { ccclass, property } = _decorator 

@ccclass('ScoreController') 
export class ScoreController extends Component { 
    
    @property({ 
        type: Node, 
        displayName: 'Score Text Node', 
        tooltip: 'Node that displays the score' 
    }) 
    scoreTextNode: Node = null 
    
    @property({ 
        type: Node, 
        displayName: 'Perfect Label Node', 
        tooltip: 'Node that displays the perfect label' 
    }) 
    perfectLabelNode: Node = null 
    
    public score: number = 0 
    public bestScore: number = 0 
    
    /** * Increases the score, and if it's a bonus, shows the perfect label animation. 
     * * @param {boolean} isBonus - Indicates if the score increase is a bonus. */ 
    
    increaseScore(isBonus: boolean = false) {
        
        this.score++ 
        
        if (isBonus) {
            
            this.perfectLabelNode.active = true
            const uiOpacity = this.perfectLabelNode.getComponent(UIOpacity)
            if (uiOpacity) {

                tween(this.perfectLabelNode)
                    .by(0.5, { position: new Vec3(0, 50, 0) }) 
                    .call(() => { uiOpacity.opacity = 255 }) 
                    .delay(0.5) .call(() => { uiOpacity.opacity = 0 }) 
                    .by(0.3, { position: new Vec3(0, -50, 0) }) 
                    .start() 

            }
            
        } 
        
        this.updateScore() 
    } 
    /** * Saves the best score if the current score is higher. */ 
    saveBestScore() {
        
        if (this.score > this.bestScore) {
            
            this.bestScore = this.score 
            console.log('New best score:', this.bestScore) 
        } 
    }
         
    /** * Updates the displayed score. */ 
    
    updateScore() { 
        const label = this.scoreTextNode.getComponent(Label) 
        if (label) { 
            label.string = this.score.toString() 
        } 
    } 
    
    /** * Resets the score to zero and updates the display. */ 
    
    resetScore() { 
        this.score = 0 
        
        this.updateScore() 
    } 

}