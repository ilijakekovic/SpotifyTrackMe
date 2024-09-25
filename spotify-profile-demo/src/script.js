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
    params.append("redirect_uri", "http://localhost:5173/callback");
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

function populateUI(profile) {
    const albumCover = profile.item.album.images[0].url || '';
    const artistNames = profile.item.artists.map(artist => artist.name).join(', ') || '';
    const backgroundImage = profile.item.album.images[0].url || '';
    const progress = profile.progress_ms || 0;
    const duration = profile.item.duration_ms || 0;
    const playlistName = profile.context?.href || '';
    const name = profile.item.name || '';
    console.log(albumCover, artistNames, backgroundImage, progress, duration, playlistName, name);

    const albumCoverElement = document.getElementById("album-cover");
    albumCoverElement.crossOrigin = "anonymous"; // Set crossOrigin
    albumCoverElement.src = albumCover;
    document.getElementById("artist-names").textContent = artistNames;
    // document.body.style.backgroundImage = `url(${backgroundImage})`;
    document.getElementById("timeline").max = duration;
    document.getElementById("timeline").value = progress;
    //document.getElementById("playlist-name").textContent = playlistName;
    document.getElementById("song-name").textContent = name;

    albumCoverElement.onload = function() {
        const averageColor = getAverageColorFromImageElement(albumCoverElement);
        console.log('Average Color:', averageColor);
        document.body.style.backgroundColor = `rgb(${averageColor.r}, ${averageColor.g}, ${averageColor.b})`;
    };

    if (albumCoverElement.complete) {
        const averageColor = getAverageColorFromImageElement(albumCoverElement);
        console.log('Average Color:', averageColor);
        document.body.style.backgroundColor = `rgb(${averageColor.r}, ${averageColor.g}, ${averageColor.b})`;
    }
}

async function updateCurrentlyPlaying(token) {
    const currentlyPlayingData = await fetchProfile(token);
    populateUI(currentlyPlayingData);
}

// test below <>

function getAverageColorFromImageElement(imgElement) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set the canvas dimensions to the image dimensions
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;

    // Draw the image onto the canvas
    context.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

    try {
        // Get the image data from the canvas
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Initialize variables to hold the sum of all color values
        let r = 0, g = 0, b = 0;

        // Loop through each pixel and sum the color values
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];     // Red
            g += data[i + 1]; // Green
            b += data[i + 2]; // Blue
        }

        // Calculate the average color values
        const pixelCount = data.length / 4;
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        // Return the average color as an object
        return { r, g, b };
    } catch (e) {
        console.error('Error getting image data:', e);
        return { r: 0, g: 0, b: 0 };
    }
}
  