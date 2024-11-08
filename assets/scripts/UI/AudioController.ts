import { _decorator, Component, AudioSource, AudioClip, log, error, director } from 'cc'
const { ccclass, property } = _decorator

@ccclass('AudioController')
export class AudioController extends Component {

    private static instance: AudioController = null
    
    @property({ 
        type: AudioClip,
        displayName: 'Background Music',
        tooltip: 'Audio clip for background music'
    }) 
    backgroundMusic: AudioClip = null
    
    @property(AudioClip) fallSound: AudioClip = null
    
    @property(AudioClip) stickGrowSound: AudioClip = null
    
    @property(AudioClip) stickHitSound: AudioClip = null
    
    @property(AudioClip) stickFallSound: AudioClip = null
    
    @property(AudioClip) bonusSound: AudioClip = null
    
    @property(AudioClip) skuCollectSound: AudioClip = null
    
    @property(AudioClip) platformSound: AudioClip = null
    
    @property(AudioClip) buttonClickSound: AudioClip = null
    
    private musicId: number = -1
    
    private stickGrowSoundId: number = -1
    
    public IsMuted: boolean = false
    
    onLoad() {
        if (AudioController.instance === null) {
            AudioController.instance = this
            director.addPersistRootNode(this.node)
            this.playBackgroundMusic()
        } else {
            this.node.destroy()
        }
    } 
    
    /** * Plays the background music. */ 
    
    playBackgroundMusic() {
        if (!this.IsMuted && this.musicId === -1 && this.backgroundMusic) {
            log("Playing background music:", this.backgroundMusic)
            const audioSource = this.node.getComponent(AudioSource)
            audioSource.clip = this.backgroundMusic
            audioSource.loop = true
            audioSource.play()
            this.musicId = audioSource.playing ? 1 : -1
        }
    }
    
    /** * Stops the background music. */ 
    
    stopBackgroundMusic() {
        if (this.musicId !== -1) {
            const audioSource = this.node.getComponent(AudioSource)
            audioSource.stop()
            this.musicId = -1
        }
    }
    
    /** * Plays a sound effect. * 
     * @param {AudioClip} sound - The audio clip to play. */
    
    playSound(sound: AudioClip) {
        if (!this.IsMuted && sound) {
            const audioSource = this.node.getComponent(AudioSource)
            audioSource.playOneShot(sound)
        }
    }
    
    /** * Plays the stick growing sound. */
    
    playStickGrowSound() {
        if (!this.IsMuted && this.stickGrowSound && this.stickGrowSoundId === -1) {
            const audioSource = this.node.getComponent(AudioSource)
            audioSource.clip = this.stickGrowSound
            audioSource.loop = true
            audioSource.play()
            this.stickGrowSoundId = audioSource.playing ? 1 : -1
        }
    }
    
    /** * Stops the stick growing sound. */ 
    
    stopStickGrowSound() {
        if (this.stickGrowSoundId !== -1) {
            const audioSource = this.node.getComponent(AudioSource)
            audioSource.stop()
            this.stickGrowSoundId = -1
        }
    }
    
    /** * Mutes all sounds. */
    
    mute() {
        this.IsMuted = true
        const audioSource = this.node.getComponent(AudioSource)
        audioSource.volume = 0
    }
    
    /** * Unmutes all sounds. */
    
    unmute() {
        this.IsMuted = false
        const audioSource = this.node.getComponent(AudioSource)
        audioSource.volume = 1
    }
    
    /** * Toggles sound on or off. */
    
    toggleSound() {
        if (this.IsMuted) {
            this.unmute()
        } else {
            this.mute()
        }
    }
    
    /** * Returns the instance of the AudioController.
     * * @returns {AudioController} - The AudioController instance. */
    
    static getInstance(): AudioController {
        if (!AudioController.instance) {
            error("AudioManager instance is null.")
        } 
        return AudioController.instance
    } 

}

