export enum PlayerStates {
    /**
     * Player is in idle state.
     */
    Idle = "PlayerIdle",
 
    /**
     * Player is in running state.
     */
    Running = "PlayerRun",
 
    /**
     * Player is in stick growing state.
     */
    StickGrow = "PlayerStickGrow",
 
    /**
     * Player is in stick hitting state.
     */
    HitStick = "PlayerHitStick",
 
    /**
     * Player is falling.
     */
    Falling = "Falling",
 
    /**
     * Player has crashed into the platform.
     */
    Crash = "Crash"
}
