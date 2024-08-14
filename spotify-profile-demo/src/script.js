const clientId = "a75a9620a0fa41d48ddf77bd91b3b49b";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    updateCurrentlyPlaying(accessToken);
    setInterval(() => updateCurrentlyPlaying(accessToken), 1000);
}


export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-read-private user-read-email user-read-currently-playing");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "hhttps://ilijakekovic.github.io/SpotifyTrackMe/callback");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token) {
    const currentlyPlaying = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    const currentlyPlayingData = await currentlyPlaying.json();
    console.log(currentlyPlayingData); // Currently playing data logs to console

    return currentlyPlayingData;
}

async function populateUI(profile) {
    if (!profile || !profile.item || !profile.item.album || !profile.item.artists) {
        console.error("Invalid profile data", profile);
        return;
    }

    const albumCover = profile.item.album.images[0]?.url || '';
    const artistNames = profile.item.artists.map(artist => artist.name).join(", ");
    const backgroundImage = profile.item.album.images[0]?.url || '';
    const progress = profile.progress_ms || 0;
    const duration = profile.item.duration_ms || 0;
    const playlistName = profile.context?.href || '';

    document.getElementById("album-cover").src = albumCover;
    document.getElementById("artist-names").textContent = artistNames;
    // document.body.style.backgroundImage = `url(${backgroundImage})`;
    document.getElementById("timeline").max = duration;
    document.getElementById("timeline").value = progress;
    document.getElementById("playlist-name").textContent = playlistName;
}

async function updateCurrentlyPlaying(token) {
    const currentlyPlayingData = await fetchProfile(token);
    populateUI(currentlyPlayingData);
}