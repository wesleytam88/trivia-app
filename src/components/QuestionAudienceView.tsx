import { createSignal, onCleanup, onMount, For, Show } from "solid-js";

interface QuestionAudienceViewProps {
    categoryName: string;
    questionText: string;
    media: string[];
    /** Total timer duration in seconds. Audience drives its own countdown from mount time */
    totalDuration: number;
}

/** Classify a media filename or URL by what kind of element it needs */
function mediaType(src: string): "image" | "video" | "audio" {
    const ext = src.split(".").pop()?.toLocaleLowerCase() ?? "";
    if (["mp4", "mov"].includes(ext)) return "video";
    if (["mp3", "wav"].includes(ext)) return "audio";
    return "image";
}

export function QuestionAudienceView(props: QuestionAudienceViewProps) {
    // Media server port (fetched on mount) used to build http://localhost:PORT/filename URLs
    const [mediaPort, setMediaPort] = createSignal<number | null>(null);
    const mediaUrl = (filename: string)=> {
        const port = mediaPort();
        return port ? `http://127.0.0.1:${port}/${encodeURIComponent(filename)}` : '';
    }

    // fraction: 0 = full time remaining (invisible bar), 1 = time up (bar full width)
    const [timerFraction, setTimerFraction] = createSignal(0);

    const totalMs = props.totalDuration * 1000;
    /** Accumulated elapsed time before an impending pause */
    let elapsedBeforePause = 0;
    /** performance.now() when current unpaused segment began */
    let segmentStart: number;
    let rafId: number;

    /** Whether playback is currently frozen (by manual pause or buzz-in) */
    const [isPaused, setIsPaused] = createSignal(false);
    /** "Game Paused" for manual pause, player name string for buzz-in, null when playing */
    const [overlayText, setOverlayText] = createSignal<string | null>(null);

    // Collect media element refs so we can pause/unpause them
    const mediaRefs: HTMLMediaElement[] = [];

    function tick(now: number) {
        const elapsed = elapsedBeforePause + (now - segmentStart);
        const fraction = Math.min(elapsed / totalMs, 1);
        setTimerFraction(fraction);
        if (fraction < 1) {
            rafId = requestAnimationFrame(tick);
        }
    }

    function startLoop() {
        segmentStart = performance.now();
        rafId = requestAnimationFrame(tick);
    }

    /** Freeze timer and media playback */
    function pausePlayback() {
        if (isPaused())
            return;
        setIsPaused(true);
        cancelAnimationFrame(rafId);
        elapsedBeforePause += performance.now() - segmentStart;
        mediaRefs.forEach(el => el.pause());
    }

    /** Resume timer and media playback */
    function resumePlayback() {
        if (!isPaused())
            return;
        setIsPaused(false);
        mediaRefs.forEach(el => el.play());
        startLoop();
    }

    onMount(() => {
        window.api.getMediaPort().then(port => setMediaPort(port));
        startLoop();

        // Manual pause/resume from host
        window.api.recvAudiencePause((paused: boolean) => {
            if (paused) {
                pausePlayback();
                setOverlayText("Game Paused");
            } else {
                setOverlayText(null);
                resumePlayback();
            }
        });

        // Buzz-in from host. string = show player name, null = clear and resume
        window.api.recvAudienceBuzzIn((playerName: string | null) => {
            if (playerName) {
                pausePlayback();
                setOverlayText(playerName);
            } else {
                setOverlayText(null);
                resumePlayback();
            }
        });
    });

    onCleanup(() => {
        cancelAnimationFrame(rafId);
        window.api.offAudiencePause();
        window.api.offAudienceBuzzIn();
    });

    const visualMedia = () => props.media.filter(m => mediaType(m) !== "audio");
    const audioMedia = () => props.media.filter(m => mediaType(m) === "audio");

    return (
        <div>
            {/* Overlay for pause or buzz-in, question content stays mounted underneath */}
            <Show when={overlayText()}>
                {text => (
                    <div>
                        <span>{text()}</span>
                    </div>
                )}
            </Show>

            {/* Question content, not mounted to preserve timer/media state */}
            <div style={{ display: isPaused() ? "none" : undefined }}>
                {/* Category banner */}
                <div>
                    <span>{props.categoryName}</span>
                </div>

                {/* Question Text */}
                <div>
                    <span>{props.questionText}</span>
                </div>

                {/* Visual Media */}
                <For each={visualMedia()}>
                    {src => (
                        <Show 
                            when={mediaType(src) === "video"} 
                            fallback={<img src={mediaUrl(src)}/>}
                        >
                            <video 
                                src={mediaUrl(src)}
                                autoplay
                                loop
                                ref={el => mediaRefs.push(el)}
                            />
                        </Show>
                    )}
                </For>

                {/* Audio media, play automatically */}
                <For each={audioMedia()}>
                    {src => (
                        <audio 
                            src={mediaUrl(src)}
                            autoplay
                            ref={el => mediaRefs.push(el)}
                        />
                    )}
                </For>

                {/* Timer bar */}
                <div>
                    <div 
                        style={{
                            height: "8px",
                            width: `${timerFraction() * 100}%`,
                            margin: "0 auto",
                            background: "red"
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
