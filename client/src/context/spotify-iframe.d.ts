export {};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void;
    SpotifyIFrameAPI?: SpotifyIFrameAPI;
  }

  type SpotifyPlaybackUpdateEvent = {
    data: {
      playingURI: string;
      isPaused: boolean;
      isBuffering: boolean;
      duration: number;
      position: number;
    };
  };

  type SpotifyPlaybackStartedEvent = {
    data: {
      playingURI: string;
    };
  };

  type SpotifyEmbedController = {
    loadUri: (
      spotifyUri: string,
      preferVideo?: boolean,
      startAt?: number,
      theme?: "dark"
    ) => void;
    play: () => void;
    pause: () => void;
    resume: () => void;
    togglePlay: () => void;
    restart: () => void;
    seek: (seconds: number) => void;
    destroy: () => void;
    addListener: (
      eventName: "ready" | "playback_started" | "playback_update",
      callback:
        | (() => void)
        | ((event: SpotifyPlaybackStartedEvent) => void)
        | ((event: SpotifyPlaybackUpdateEvent) => void)
    ) => void;
  };

  type SpotifyIFrameAPI = {
    createController: (
      element: HTMLElement,
      options: {
        uri: string;
        width?: number | string;
        height?: number | string;
      },
      callback: (controller: SpotifyEmbedController) => void
    ) => void;
  };
}