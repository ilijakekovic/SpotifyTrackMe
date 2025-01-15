const clientId = "a75a9620a0fa41d48ddf77bd91b3b49b";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");



if (!code) {
    console.log("Redirecting to Spotify to authorize...");
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    console.log("Client ID:", clientId);
    console.log("Code:", code);
    console.log("Access token:", accessToken);
    updateCurrentlyPlaying(accessToken);
    setInterval(() => updateCurrentlyPlaying(accessToken), 1000);
}

console.log("After the if statement Code:", code);
console.log("After the if statement Access token:", accessToken);


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
    // params.append("redirect_uri", "hhttps://ilijakekovic.github.io/SpotifyTrackMe/callback");
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
    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
  
    if (response.status === 401) {
      console.error('Unauthorized: Access token may be invalid or expired.');
      const newToken = await refreshAccessToken();
      if (newToken) {
        return fetchProfile(newToken); // Retry with new token
      }
      return null;
    }
  
    if (!response.ok) {
      console.error('Failed to fetch currently playing track:', response.statusText);
      return null;
    }
  
    const currentlyPlayingData = await response.json();
    console.log(currentlyPlayingData); // Currently playing data logs to console
  
    return currentlyPlayingData;
  }
  
  // Function to refresh access token
  async function refreshAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });
  
    if (!response.ok) {
      console.error('Failed to refresh access token:', response.statusText);
      return null;
    }
  
    const data = await response.json();
    return data.access_token;
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
    document.getElementById("timeline").max = duration;
    document.getElementById("timeline").value = progress;
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

    albumCoverElement.onload = function() {
        const averageColor = getAverageColorFromImageElement(albumCoverElement);
        console.log('Average Color:', averageColor);
        document.body.style.backgroundColor = `rgb(${averageColor.r}, ${averageColor.g}, ${averageColor.b})`;
    };

    if (albumCoverElement.complete) {
        const averageColor = getAverageColorFromImageElement(albumCoverElement);
        console.log('Average Color:', averageColor);
        document.body.style.backgroundColor = `rgb(${averageColor.r}, ${averageColor.g}, ${averageColor.b})`;
        const complementaryColor = getComplementaryColor(averageColor);
        console.log('Complementary Color:', complementaryColor);
        document.getElementById("song-name").style.color = `rgb(${complementaryColor.r}, ${complementaryColor.g}, ${complementaryColor.b})`;
        document.getElementById("artist-names").style.color = `rgb(${complementaryColor.r}, ${complementaryColor.g}, ${complementaryColor.b})`;
        let timeline = document.getElementById("timeline");
        //set the color of the timeline to the complementary color
        timeline.style.background = `linear-gradient(to right, rgb(${complementaryColor.r}, ${complementaryColor.g}, ${complementaryColor.b}), rgb(${complementaryColor.r}, ${complementaryColor.g}, ${complementaryColor.b}))`;
        //set the color of the timeline thumb to the complementary color
        timeline.style.setProperty('--webkit-slider-thumb-color', `rgb(${complementaryColor.r}, ${complementaryColor.g}, ${complementaryColor.b})`);
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

function getComplementaryColor(color) {
    return {
        r: 255 - color.r,
        g: 255 - color.g,
        b: 255 - color.b
    };
}
