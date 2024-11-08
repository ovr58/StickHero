import { _decorator, Canvas, Component, director, tween, UITransform, Vec3 } from 'cc'
const { ccclass, property } = _decorator

import { GameControll } from './GameControll'

@ccclass('Stick')
export class Stick extends Component {
    @property({ 
        type: Number, 
        displayName: 'Stick Growth Rate', 
        tooltip: 'Rate at which stick grows' 
    })
    stickGrowthRate: number = 400

    @property({ 
        type: Number, 
        displayName: 'Angle Time', 
        tooltip: 'Time for stick to fall' 
    })
    angleTime: number = 1

    private isGrowing: boolean = false

    /**
     * Starts the stick growth.
     */
    startStickGrowth() {
        this.isGrowing = true
    }

    /**
     * Stops the stick growth.
     */
    stopStickGrowth() {
        this.isGrowing = false
    }

    /**
     * Logic for stick growth.
     * @param {number} deltaTime - Time between frames.
     */
    growStick(deltaTime: number) {
        if (this.isGrowing) { 
            const uiTransform = this.node.getComponent(UITransform) 
            if (uiTransform) { 
                uiTransform.height += this.stickGrowthRate * deltaTime 
                if (uiTransform.height >= 2500) { 
                    this.stopStickGrowth()
                    const scene = director.getScene()
                    const canvas = scene.getComponentInChildren(Canvas)
                    canvas.getComponent(GameControll).onTouchEnd()
                } 
            } 
        } 
    }

    /**
     * Animates the stick falling.
     */
    stickFall() {
        tween(this.node)
            .to(this.angleTime, { angle: -90 })
            .start()
    }

    /**
     * Animation when the stick falls on fails.
     */
    stickOnFail() {
        tween(this.node)
            .to(this.angleTime, { angle: -180 })
            .start()
    }
}



