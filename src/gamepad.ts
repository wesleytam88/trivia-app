import { ButtonID } from "../shared/player";

/**
 * Gamepad polling utility using the browser Gamepad API.
 * 
 * The API is poll-based - there are no "button pressed" events.
 * We use requestAnimationFrame() to read gamepad state every frame
 * and compare against the previous frame to detect new presses.
 * 
 * Button ID format:
 *   "{gamepadIndex}b{buttonIndex}"
 *   D-pad inputs appear as regular buttons (indices 12-15 on standard mapping).
 */

/** Previous frame's active button IDs per gamepad index. */
let prevState: Map<number, Set<ButtonID>> = new Map();

/** 
 * ID returned by requestAnimationFrame(), used in cancelAnimationFrame(frameId).
 * Null if loop isn't running.
 */
let frameId: number | null = null;

/** 
 * The callback provided by the caller.
 * When a new press is detected, this gets called with the button ID.
 * Null if nobody is listening.
 */
let onPress: ((buttonId: ButtonID) => void) | null = null;

/** 
 * Read all currently pressed inputs across all gamepads.
 * Returns a Set of button IDs (strings).
 */
function readActiveInputs(): Map<number, Set<ButtonID>> {
    const active = new Map<number, Set<ButtonID>>;
    const gamepads = navigator.getGamepads();

    for (let gamepadIndex = 0; gamepadIndex < gamepads.length; gamepadIndex++) {
        const gamepad = gamepads[gamepadIndex];
        if (!gamepad || !gamepad.connected) continue;

        const ids = new Set<ButtonID>();

        // Buttons (includes d-pad on standard-mapped controllers)
        for (let buttonIndex = 0; buttonIndex < gamepad.buttons.length; buttonIndex++) {
            if (gamepad.buttons[buttonIndex].pressed) {
                ids.add(`${gamepadIndex}b${buttonIndex}`);
            }
        }

        active.set(gamepadIndex, ids)
    }

    return active;
}

/** 
 * One frame of the polling loo.
 * Compares current inputs to previous frame and 
 * fires the callback for any newly pressed button(s).
 */
function pollFrame() {
    const current = readActiveInputs();

    for (const [gamepadIndex, currentIds] of current) {
        const prevIds = prevState.get(gamepadIndex) ?? new Set();

        for (const id of currentIds) {
            if (!prevIds.has(id) && onPress) {
                onPress(id);
            }
        }
    }

    prevState = current;
    frameId = requestAnimationFrame(pollFrame);
}

/** 
 * Start listening for new button presses.
 * The callback fires once per press (on the frame the 
 * button transitions from released to pressed).
 * Call stopListening() to end.
 */
export function startListening(callback: (buttonId: ButtonID) => void): void {
    stopListening();    // Saftey measure in case a previous session is still running
    onPress = callback;
    // Snapshot current state so buttons already held down don't immediately fire as new presses
    prevState = readActiveInputs();
    frameId = requestAnimationFrame(pollFrame);
}

/** Stop the polling loop. */
export function stopListening(): void {
    if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
    }
    onPress = null;
    prevState = new Map();
}

/** 
 * One-shot poll: returns all currently pressed button IDs.
 * Useful for the buzz-in gameplay loop where you check 
 * "is anyone pressing right now".
 */
export function pollAllPressed(): ButtonID[] {
    const active = readActiveInputs();
    const all: ButtonID[] = [];
    for (const ids of active.values()) {
        for (const id of ids) {
            all.push(id);
        }
    }
    return all;
}
