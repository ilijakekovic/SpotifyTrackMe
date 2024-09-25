import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import { getAverageColorFromImageElement } from './src/script.js';

async function updateCurrentlyPlaying(token) {
    const currentlyPlayingData = await fetchProfile(token);
    populateUI(currentlyPlayingData);
}

function populateUI(data) {
    const albumCoverElement = document.getElementById('albumCover');
    albumCoverElement.src = data.albumCoverUrl; // Assuming data contains albumCoverUrl

    document.getElementById("artist-names").textContent = data.artistNames;
    document.getElementById("timeline").max = data.duration;
    document.getElementById("timeline").value = data.progress;
    document.getElementById("song-name").textContent = data.name;

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

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector('#counter'))
