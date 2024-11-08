import { _decorator, Component, Node, Label, director, Canvas } from 'cc'
import { GameControll } from "../GameControll"
import {AudioController} from "./AudioController"

const { ccclass, property } = _decorator

@ccclass('EndGamePopup')
export class EndGamePopup extends Component {

    @property({
        type: Node,
        displayName: 'Restart Button',
        tooltip: 'Node that displays the restart button' 
    })
    restartButton: Node = null

    @property({
        type: Node, 
        displayName: 'Start Screen Button', 
        tooltip: 'Node that displays the start screen button'
    })
    startScreenButton: Node = null

    @property({ 
        type: Node,
        displayName: 'Score Node',
        tooltip: 'Node that displays the score'
    })
    scoreNode: Node = null

    @property({
        type: Node,
        displayName: 'Best Score Node',
        tooltip: 'Node that displays the best score'
    })
    bestScoreNode: Node = null

    private audioController: AudioController = null

    protected onLoad(): void {
        this.node.active = false
        this.node.setSiblingIndex(999)
        this.initTouchEvent()
        this.audioController = AudioController.getInstance()
    }

    /**
     * Initialize touch event listeners for buttons.
     */
    initTouchEvent() {
        if (this.restartButton) {
            this.restartButton.on(
                Node.EventType.TOUCH_END, this.onRestartTouched, this
            )
        }
        if (this.startScreenButton) {
            this.startScreenButton.on(
                Node.EventType.TOUCH_END, this.onStartScreenTouched, this
            )
        }
    }

    /**
     * Handler for the restart button touch event.
     */

    onRestartTouched() {
        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.buttonClickSound)

        this.node.active = false

        const scene = director.getScene()
        const canvas = scene.getComponentInChildren(Canvas)
        canvas.getComponent(GameControll).restartGame()
    }

    /**
     * Handler for the start screen button touch event.
     */

    onStartScreenTouched() {
        if (!this.audioController.IsMuted) {
            this.audioController.playSound(this.audioController.buttonClickSound)
        }
        
        director.loadScene('StartScene') 
 
    }

    /**
     * Display the end game popup with the given score and best score.
     * @param {number} score - Current score.
     * @param {number} bestScore - Best score.
     */

    showPopup(score: number, bestScore: number) {
        this.node.active = true

        this.node.setSiblingIndex(this.node.parent.children.length - 1)
        this.scoreNode.getComponent(Label).string = score.toString()
        this.bestScoreNode.getComponent(Label).string = bestScore.toString()
    }

    /**
     * Hide the end game popup.
     */
    hidePopup() {
        this.node.active = false
    }

    /**
     * Activate the end game popup.
     */
    onGameEnd() {
        this.node.active = true
    }
}


