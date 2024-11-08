import { _decorator, BoxCollider2D, Collider2D, Contact2DType, IPhysics2DContact, CCFloat, Component, find, instantiate, log, math, Node, Prefab, tween, UITransform, Vec3, view, PhysicsSystem2D } from 'cc'
import { GameStates } from './States/GameStates'
import { EndGamePopup } from './UI/EndGamePopup'
import { ScoreController } from './UI/ScoreController'
import {AudioController} from './UI/AudioController'
import { SkuCounter } from './UI/SkuCounter'
import { Stick } from './Stick'
import { Hero } from './Hero'
import { PlayerStates } from './States/PlayerStates'
import { Platform } from './Platform'
import { BonusItem } from './BonusItem'
const { ccclass, property } = _decorator

@ccclass('GameControll')
export class GameControll extends Component {
    @property({ 
        type: Node, 
        displayName: 'RootNode', 
        tooltip: "Where all the game objects are placed" 
    })
    rootNode: Node = null

    @property({ 
        type: Node, 
        displayName: 'Default Position', 
        tooltip: 'Default position where the player and platform would be moved to after a successful stick' 
    })
    defaultPosition: Node = null

    @property({ 
        type: Prefab, 
        displayName: 'StickPrefab', 
        tooltip: 'Stick prefab'
     })
    stickPrefab: Prefab = null

    @property({ 
        type: Prefab, 
        displayName: 'PlatformPrefab', 
        tooltip: 'Platform prefab' 
    })
    platformPrefab: Prefab = null

    @property({ 
        type: Prefab, 
        displayName: 'PlayerPrefab', 
        tooltip: 'Player prefab' 
    })
    playerPrefab: Prefab = null

    @property({ 
        type: Prefab, 
        displayName: 'Bonus Item Prefab', 
        tooltip: 'Prefab for the bonus item' 
    })
    bonusItemPrefab: Prefab = null

    @property({ 
        type: CCFloat, 
        displayName: 'Player Prefab Width', 
        tooltip: 'Necessary for calculating initial player position' 
    })
    playerPrefabWidth: number = 80

    @property({ 
        type: CCFloat, 
        displayName: 'Platform Prefab Width', 
        tooltip: 'Necessary for calculating initial platform position' 
    })
    platformPrefabWidth: number = 200

    @property({ 
        type: Prefab, 
        displayName: 'End Game Popup Prefab', 
        tooltip: 'Prefab for the end game popup' 
    })
    endGamePopupPrefab: Prefab = null

    @property({ 
        type: Node, 
        displayName: 'UI Node', 
        tooltip: 'Node for UI elements' 
    })
    uiNode: Node = null

    @property({ 
        type: Node, 
        displayName: 'Score Node', 
        tooltip: 'Node that displays the current score' 
    })
    scoreNode: Node = null

    private endGamePopupInstance: Node = null
    private platformNode: Node = null
    private nextPlatformNode: Node = null
    private oldStickNode: Node = null // Reference to the old stick node
    private stickNode: Node = null
    private playerNode: Node = null
    private bonusItemNode: Node = null
    private stickComponent: Stick = null
    private endGamePopupComponent: EndGamePopup = null
    private scoreController: ScoreController = null
    private audioController: AudioController = null
    private skuCounter: SkuCounter = null
    private moveDetails = {
        distance: 0,
        startX: 0,
        targetX: 0,
        duration: 0,
        elapsedTime: 0,
        callback: null,
    }
    GameState = GameStates.Idle
    futurePlatformPosition: number

    protected onLoad(): void { 
        console.log("GameControll onLoad") 
        PhysicsSystem2D.instance.enable = true
        this.endGamePopupInstance = instantiate(this.endGamePopupPrefab) 
        this.uiNode.addChild(this.endGamePopupInstance) 
        this.endGamePopupComponent = this.endGamePopupInstance.getComponent(EndGamePopup) 
        this.scoreController = find('Canvas/UI/Score').getComponent(ScoreController) 
        this.skuCounter = find('Canvas/UI/SkuCounter').getComponent(SkuCounter) 
        this.audioController = AudioController.getInstance() 
        this.initializeGameInstance() 
        this.initTouchEvents()
    }

    // Initialize game instance with default positions for platforms and player
    initializeGameInstance() {
        console.log("initializeGameInstance")
        const initialPlatformX = -view.getVisibleSize().width / 2
        const initialPlayerX = initialPlatformX + this.platformPrefabWidth / 2 - this.playerPrefabWidth / 1.2

        this.platformNode = this.createPlatform(initialPlatformX, this.platformPrefabWidth, false)
        // this.platformNode.getComponent(BoxCollider2D).destroy() // Remove the collider from the initial platform to prevent player from colliding with it

        this.futurePlatformPosition = this.platformNode.position.x

        this.playerNode = this.createPlayer(initialPlayerX)
        this.spawnNextPlatform()

        this.setState(GameStates.Idle, 'initializeGameInstance')
    }

    // Calculate the position for the next platform
    calculateNextPlatformPosition(): number {
        let offset = 50
        const minDistance = 150
        const maxDistance = view.getVisibleSize().width - this.platformPrefabWidth - offset

        let randomDistance = minDistance + Math.random() * (maxDistance - minDistance)
        let targetX = this.defaultPosition.position.x + randomDistance

        return targetX
    }

    // Calculate the position for the next bonus item
    calculateNextBonusItemPosition(targetXPlatform: number): number {
        const minOffset = 50 
        const platformTransform = this.platformNode.getComponent(UITransform) 
        const nextPlatformTransform = this.nextPlatformNode.getComponent(UITransform) 
        const currentPlatformRightEdge = this.futurePlatformPosition + platformTransform.width / 2 + minOffset 
        const nextPlatformLeftEdge = targetXPlatform - nextPlatformTransform.width / 2 - minOffset
        if (platformTransform && nextPlatformTransform && (nextPlatformLeftEdge - currentPlatformRightEdge > 50)) { 
            const targetX = currentPlatformRightEdge + Math.random() * (nextPlatformLeftEdge - currentPlatformRightEdge) 
            console.log('BONUS ITEM TARGET X - ', targetX)
            return targetX
        } 
        return null // Return a default value if the UITransform components are not found 
    }

    // Spawn the next platform
    spawnNextPlatform() {
        console.log("spawnNextPlatform")
        const spawnX = view.getVisibleSize().width
        const targetXPlatform = this.calculateNextPlatformPosition()
        this.nextPlatformNode = this.createPlatform(spawnX, 0, true)
        console.log('NEXTPLATFORM NODE - ', this.nextPlatformNode)
        const targetXBonusItem = this.calculateNextBonusItemPosition(targetXPlatform)
        
        if(this.scoreController.score >= 2 && targetXBonusItem){ 
            // If the score is less than or equal to 2, don't spawn a bonus item
            if(Math.random() < 0.8)  {
                // 80% chance of spawning a SKU item
                this.bonusItemNode = this.createBonusItem(targetXBonusItem)
            }
        }

        this.movePlatformOntoScreen(this.nextPlatformNode, this.bonusItemNode, targetXPlatform, targetXBonusItem)
    }

    // Create a bonus item at the given position
    createBonusItem(spawnX: number): Node {
        console.log('createBonusItem')
        let bonusItemInstance = instantiate(this.bonusItemPrefab)
        bonusItemInstance.setSiblingIndex(999)
        this.rootNode.addChild(bonusItemInstance)
        const bonusItemComp = bonusItemInstance.getComponent(BonusItem)
        if (bonusItemComp) {
            bonusItemComp.initPlatform(spawnX)
            console.log('BONUS ITEM - ', bonusItemComp)
        } else {
            console.error("Platform component is missing")
        }
        return bonusItemInstance
    }

    // Move the platform and bonus item onto the screen
    movePlatformOntoScreen(platformNode: Node, bonusItemNode: Node, targetXPlatform: number, targetXBonusItem: number) {
        console.log("movePlatformOntoScreen", platformNode, targetXPlatform, bonusItemNode, targetXBonusItem)
        
        if (platformNode) {
            tween(platformNode) 
            .to(0.5, { position: new Vec3(targetXPlatform, platformNode.position.y, 0) }) 
            .start() 
        }
        if (bonusItemNode && targetXBonusItem) {
            tween(bonusItemNode) 
            .to(0.25, { position: new Vec3(targetXBonusItem, -380, 0) }) 
            .start()
        }

    }

    // Create a platform at the given position
    createPlatform(positionX: number, initialWidth: number = 0, bonusVisible: boolean = true): Node {
        console.log("createPlatform", positionX, initialWidth)

        let platformInstance = instantiate(this.platformPrefab)
        platformInstance.setSiblingIndex(996)
        this.rootNode.addChild(platformInstance)
        const platformComp = platformInstance.getComponent(Platform)
        if (platformComp) {
            platformComp.initPlatform(positionX, initialWidth, bonusVisible)
            platformComp.node.on('bonusPlatformTouched', this.onBonusPlatformTouched, this)
        } else {
            console.error("Platform component is missing")
        }
        return platformInstance
    }

    // Create a player at the given position

    createPlayer(positionX: number): Node {
        console.log("createPlayer")

        let playerInstance = instantiate(this.playerPrefab)
        playerInstance.setSiblingIndex(996)
        this.rootNode.addChild(playerInstance)
        const playerComp = playerInstance.getComponent(Hero)
        if (playerComp) {
            playerComp.node.on('playCollectBonus', this.playCollectBonus, this)
        }

        const platformTransform = this.platformNode.getComponent(UITransform)
        const playerTransform = playerInstance.getComponent(UITransform)

        if (platformTransform && playerTransform) {
            playerInstance.setPosition(new Vec3(
                positionX,
                this.platformNode.position.y + platformTransform.height / 2 + playerTransform.height / 2,
                0
            ))
        }

        return playerInstance
    }


    // Update method to handle game state and movements

    protected update(deltaTime: number): void {
        if (this.GameState === GameStates.Touching && this.stickNode) {
            this.stickNode.getComponent(Stick).growStick(deltaTime)
        }

        if ((this.GameState === GameStates.Running || this.GameState === GameStates.Coming) && this.moveDetails.targetX !== 0) {
            this.moveDetails.elapsedTime += deltaTime
            let progress = Math.min(this.moveDetails.elapsedTime / this.moveDetails.duration, 1)
            const newPositionX = math.lerp(this.moveDetails.startX, this.moveDetails.targetX, progress)
            this.playerNode.setPosition(new Vec3(newPositionX, this.playerNode.position.y, 0))

            if (progress >= 1) {
                // Set the player to End state as transition state
                this.setState(GameStates.End, 'update')
                this.moveDetails.targetX = 0
                if (this.moveDetails.callback) {
                    this.moveDetails.callback()
                }
            }

            const nextPlatformTransform = this.nextPlatformNode.getComponent(UITransform)
            if (nextPlatformTransform && this.playerNode.position.x >= this.nextPlatformNode.position.x - nextPlatformTransform.width / 2 && this.GameState === GameStates.Running) {
                this.setState(GameStates.Coming, 'update')
            }
        }

        if (this.GameState === GameStates.Running) {
            this.contactSomething()
        }
    }

    // Handle touch end event
    onTouchEnd() {
        console.log("onTouchEnd")

        //Claculate if the player has passed the current platform to prevent flipping when the player is on the platform
        const platformNodeTransform = this.platformNode.getComponent(UITransform)
        let playerPassCurrentPlatform = 
            this.playerNode.position.x >= this.platformNode.position.x + platformNodeTransform.width / 2
        
        if (this.GameState === GameStates.Running && this.playerNode && playerPassCurrentPlatform) {
            this.playerNode.getComponent(Hero).flipPlayer()
            return
        }

        if (this.GameState !== GameStates.Touching || !this.stickNode) {
            return
        }

        this.stickComponent = this.stickNode.getComponent(Stick)

        if (this.stickComponent) {
            this.stickComponent.stopStickGrowth()
            this.playerNode.getComponent(Hero).setState(PlayerStates.HitStick)
            this.stickComponent.stickFall()

            if (!this.audioController.IsMuted) {
                this.audioController.stopStickGrowSound()
                this.audioController.playSound(this.audioController.stickHitSound)
            }

            this.setState(GameStates.End)

            this.scheduleOnce(this.checkResult.bind(this), this.stickComponent.angleTime)
        } else {
            console.error("Stick component is missing")
        }
    }

    // Save SKU count
    saveSkuCount() {
        if (this.skuCounter) {
            this.skuCounter.saveSkuCount()
        } else {
            console.error("SKU counter is missing")
        }
    }

    // Reset SKU count
    resetSkuCount() {
        if (this.skuCounter) {
            this.skuCounter.resetSkuCount()
        } else {
            console.error("SKU counter is missing")
        }
    }

    // Initialize touch events
    initTouchEvents() {
        console.log("initTouchEvents")
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    // Create a stick for the player
    createStick() {
        console.log("createStick")
        this.stickNode = instantiate(this.stickPrefab)
        this.stickNode.setSiblingIndex(998)
        this.rootNode.addChild(this.stickNode)
        const platformNodeTransform = this.platformNode.getComponent(UITransform)
        const stickNodeTransform = this.stickNode.getComponent(UITransform)
        this.stickNode.setPosition(
            this.platformNode.position.x + platformNodeTransform.width / 2, 
            this.platformNode.position.y + platformNodeTransform.height / 2)
        
        stickNodeTransform.height = 0
        this.stickNode.angle = 0
    }

    // Handle touch start event
    onTouchStart() {
        console.log("onTouchStart", this.GameState)
        if (this.GameState !== GameStates.Idle) {
            return
        }
        this.setState(GameStates.Touching)
        this.createStick()
        this.stickComponent = this.stickNode.getComponent(Stick)
        if (this.stickComponent) {
            this.stickComponent.startStickGrowth()
            this.playerNode.getComponent(Hero).setState(PlayerStates.StickGrow)

            if (!this.audioController.IsMuted)
                this.audioController.playStickGrowSound()

        } else {
            console.error("Stick component is missing")
        }
    }

    // Move player to the target position
    moveTo(targetPositionX: number, duration: number, onComplete: () => void) {
        this.moveDetails.startX = this.playerNode.position.x
        this.moveDetails.targetX = targetPositionX
        this.moveDetails.duration = duration
        this.moveDetails.elapsedTime = 0
        this.moveDetails.callback = onComplete
        this.setState(GameStates.Running)
        this.playerNode.getComponent(Hero).setState(PlayerStates.Running)
    }

    // Check if the stick has landed on a platform
    checkResult() {
        console.log("checkResult")
        if (!this.stickNode) {
            return
        }
        const stickNodeTransform = this.stickNode.getComponent(UITransform)
        const stickRightX = this.stickNode.position.x + stickNodeTransform.height
        const nextPlatformComp = this.nextPlatformNode.getComponent(Platform)

        if (nextPlatformComp && nextPlatformComp.isStickTouching(stickRightX)) {
            if (!this.audioController.IsMuted)
                this.audioController.playSound(this.audioController.stickFallSound)

            this.onStickTouchPlatform()

        } else {
            this.onFailed()
        }
    }

    // Handle successful stick touch on platform
    onStickTouchPlatform() {
        console.log("onStickTouchPlatform")
        const nextPlatformNodeTransform = this.nextPlatformNode.getComponent(UITransform)
        let nextPlatformEdge = this.nextPlatformNode.position.x + nextPlatformNodeTransform.width / 3

        this.moveDetails.distance = nextPlatformEdge - this.playerNode.position.x
        let moveTime = Math.abs(this.moveDetails.distance / 500)

        this.moveTo(nextPlatformEdge, moveTime, () => {
            this.scheduleOnce(() => {
                this.saveSkuCount()
                this.resetPlatformsAndPlayer()
                this.instantiateNextPlatform()
            })
            this.setState(GameStates.Idle, 'onStickTouchPlatform')
            this.playerNode.getComponent(Hero).setState(PlayerStates.Idle)
        })
    }

    // Reset platforms and player position
    resetPlatformsAndPlayer() {
        console.log("resetPlatformsAndPlayer")

        let moveAmount = -view.getVisibleSize().width / 3
        let moveTime = 0.1
        const nextPlatformTransform = this.nextPlatformNode.getComponent(UITransform)
        const playerNodeTransform = this.playerNode.getComponent(UITransform)
        this.futurePlatformPosition = 
            moveAmount - nextPlatformTransform.width / 2 + playerNodeTransform.width / 1.3

        tween(this.nextPlatformNode)
            .to(moveTime, { 
                position: new Vec3(
                    this.futurePlatformPosition, 
                    this.nextPlatformNode.position.y, 
                    0) })
            .start()

        tween(this.playerNode)
            .to(moveTime, { 
                position: new Vec3(
                    moveAmount, 
                    this.playerNode.position.y,
                    0) })
            .start()

        if (this.stickNode) {
            let futureStickPosition = moveAmount - this.nextPlatformNode.position.x - nextPlatformTransform.width / 2 + playerNodeTransform.width / 1.3
            tween(this.stickNode)
                .to(moveTime, { 
                    position: new Vec3(
                        this.stickNode.position.x + futureStickPosition, 
                        this.stickNode.position.y, 
                        0
                    ) 
                })
                .start()
        }

        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.platformSound)

        this.platformNode.destroy()
        this.platformNode = null
        this.platformNode = this.nextPlatformNode
        // this.platformNode.getComponent(BoxCollider2D).destroy() // Remove the collider from the initial platform to prevent player from colliding with it

        const platformComp = this.platformNode.getComponent(Platform)
        if (platformComp) {
            platformComp.setBonusPlatformVisibility(false)
        } else {
            console.error("Platform component is missing")
        }

        if(this.oldStickNode) { // Destroy the old stick node if it exists
            this.oldStickNode.destroy()
            this.oldStickNode = null
        }
        this.oldStickNode = this.stickNode // Set the old stick node to the current stick node
        this.stickNode = null

        if (this.bonusItemNode) {
            console.log('BONUS ITEM NODE DESTROY!')
            this.bonusItemNode.destroy()
        }

        this.scoreController.increaseScore(false) // Increase score after player successfully moves to the next platform
    }

    // Handle player failure
    onFailed() {
        console.log("onFailed")
        const stickNodeTransform = this.stickNode.getComponent(UITransform)
        let moveLength = this.stickNode.position.x + stickNodeTransform.height - this.playerNode.position.x
        let moveTime = Math.abs(moveLength / 500)

        this.moveTo(this.stickNode.position.x + stickNodeTransform.height, moveTime, () => {
            this.playerNode.getComponent(Hero).fall()

            if (!this.audioController.IsMuted)
                this.audioController.playSound(this.audioController.fallSound)

            this.stickComponent.stickOnFail()
            this.scheduleOnce(() => {
                this.endGame()
            }, 1)
        })

        this.resetSkuCount()
    }

    contactSomething() {
        let collider = this.playerNode.getComponent(BoxCollider2D)
        if (collider) {
            console.log('COLLISION DETECTED - ', collider)
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        
        const otherLayer = otherCollider.node
        const isFlipped = selfCollider.node.getComponent(Hero).isFlipped
        console.log('COLLISION - ', otherLayer.getComponent(UITransform).width, otherLayer.getComponent(BoxCollider2D).size)
        if (otherLayer.name === 'BonusItem') {
            console.log('Player collided with bonus item')
            if (this.GameState === GameStates.Running || this.GameState === GameStates.Idle) {
                this.scheduleOnce(() => { otherCollider.node.destroy() }, 0)
                if (this.skuCounter) {
                    this.skuCounter.increaseSkuCount('Bonus')
                    this.playCollectBonus()
                } else { 
                    console.error('SkuCounter node not found in the scene')
                }
            }
        }
        if (otherLayer.name === 'Platform' && isFlipped) {
            console.log('Player collided with platform, failed', 'IS FLIPPED - ', isFlipped)
            this.onPlayerCrashInToPlatform()
        }
    }

    // Handle player crash into platform
    onPlayerCrashInToPlatform() {
        console.log("onPlayerCrashInToPlatform")
        this.playerNode.getComponent(Hero).fall()

        // Add check for GameState to prevent playing the sound if the game already ended
        if (!this.audioController.IsMuted && this.GameState !== GameStates.End) 
            this.audioController.playSound(this.audioController.fallSound)

        this.setState(GameStates.End)
        this.scheduleOnce(() => {
            this.endGame()
        }, 1)

        this.resetSkuCount()
    }

    // End the game
    endGame() {
        console.log("endGame")
        this.setState(GameStates.End)
        this.scoreController.saveBestScore()
        this.scoreNode.active = false
        this.endGamePopupComponent.showPopup(this.scoreController.score, this.scoreController.bestScore)
    }

    // Restart the game
    restartGame() {
        console.log("restartGame")
        this.endGamePopupComponent.hidePopup()
        this.scoreNode.active = true
        this.scoreController.resetScore()
        this.dispose()
        this.initializeGameInstance()
    }

    // Clear game objects
    dispose() {
        console.log("dispose")
        this.rootNode.removeAllChildren()
    }

    // Instantiate the next platform
    instantiateNextPlatform() {
        console.log("instantiateNextPlatform")
        this.spawnNextPlatform()

        let platformAppearanceTime = this.moveDetails.distance / (200 * 3)
        tween(this.node)
            .to(platformAppearanceTime, { 
                position: new Vec3(this.node.position.x - this.moveDetails.distance, this.node.position.y, 0) 
            })
            .start()
    }

    // Set the game state
    setState(state: GameStates, methodName: string = '') {
        if (this.GameState !== state) {
            this.GameState = state

            // Log the game state and method name for debugging
            log('Game state:', state, 'Method:', methodName)
        }
    }

    /**
     * Handles the bonus platform touch event.
     */
    onBonusPlatformTouched() {
        this.scoreController.increaseScore(true)

        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.bonusSound)
    }

    /**
     * Handles the SKU collect sound.
     */
    playCollectBonus() {
        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.skuCollectSound)
    }
}



