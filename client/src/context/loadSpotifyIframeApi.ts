let spotifyIframeApiPromise: Promise<SpotifyIFrameAPI> | null = null;

export function loadSpotifyIframeApi(): Promise<SpotifyIFrameAPI> {
  if (window.SpotifyIFrameAPI) {
    console.log("[SpotifyAPI] reuse window.SpotifyIFrameAPI");
    return Promise.resolve(window.SpotifyIFrameAPI);
  }

  if (spotifyIframeApiPromise) {
    console.log("[SpotifyAPI] reuse pending promise");
    return spotifyIframeApiPromise;
  }

  spotifyIframeApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://open.spotify.com/embed/iframe-api/v1"]'
    );

    window.onSpotifyIframeApiReady = (IFrameAPI: SpotifyIFrameAPI) => {
      console.log("[SpotifyAPI] onSpotifyIframeApiReady");
      window.SpotifyIFrameAPI = IFrameAPI;
      resolve(IFrameAPI);
    };

    if (existingScript) {
      console.log("[SpotifyAPI] script already exists, waiting ready callback");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;

    script.onload = () => {
      console.log("[SpotifyAPI] script loaded");
    };

    script.onerror = () => {
      console.error("[SpotifyAPI] script load failed");
      reject(new Error("Failed to load Spotify iFrame API"));
    };

    document.body.appendChild(script);
    console.log("[SpotifyAPI] script appended");
  });

  return spotifyIframeApiPromise;
}