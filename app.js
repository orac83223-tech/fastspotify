const baseTitles = [
  ["Blinding Lights", "The Weeknd"],
  ["Super Shy", "NewJeans"],
  ["Levitating", "Dua Lipa"],
  ["As It Was", "Harry Styles"],
  ["Seven", "Jungkook"],
  ["Perfect Night", "LE SSERAFIM"],
  ["Shape of You", "Ed Sheeran"],
  ["Stay", "The Kid LAROI"],
  ["Dance The Night", "Dua Lipa"],
  ["I AM", "IVE"],
  ["Hype Boy", "NewJeans"],
  ["Attention", "Charlie Puth"],
  ["Flowers", "Miley Cyrus"],
  ["Ditto", "NewJeans"],
  ["Cruel Summer", "Taylor Swift"],
  ["Fast Car", "Luke Combs"],
  ["OMG", "NewJeans"],
  ["Vampire", "Olivia Rodrigo"],
  ["S-Class", "Stray Kids"],
  ["Spicy", "aespa"],
  ["Pink Venom", "BLACKPINK"],
  ["Cupid", "FIFTY FIFTY"],
  ["Shut Down", "BLACKPINK"],
  ["Unholy", "Sam Smith"],
  ["Bam Yang Gang", "BIBI"],
  ["Queencard", "(G)I-DLE"],
  ["Butter", "BTS"],
  ["Dynamite", "BTS"],
  ["ETA", "NewJeans"],
  ["Magnetic", "ILLIT"]
];

const tracks = baseTitles.map(([title, artist], index) => ({
  id: String(index + 1),
  title,
  artist,
  previewUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(index % 16) + 1}.mp3`
}));

const input = document.getElementById("searchInput");
const button = document.getElementById("searchBtn");
const list = document.getElementById("trackList");
const statusText = document.getElementById("statusText");
const nowPlaying = document.getElementById("nowPlaying");
const audioPlayer = document.getElementById("audioPlayer");
const stopBtn = document.getElementById("stopBtn");
let currentTracks = [...tracks];
let currentTrackId = null;

function renderTracks(tracks) {
  list.innerHTML = "";
  tracks.forEach((track) => {
    const item = document.createElement("li");
    item.className = "track";
    if (track.id === currentTrackId) {
      item.classList.add("active");
    }
    item.innerHTML = `
      <button class="track-btn" type="button" data-track-id="${track.id}">
        <strong>${track.title}</strong>
        <span>${track.artist}</span>
      </button>
    `;
    list.appendChild(item);
  });
}

function handleSearch() {
  const query = input.value.trim().toLowerCase();
  const filtered = tracks.filter((track) => {
    return (
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query)
    );
  });
  currentTracks = query ? filtered : tracks;
  statusText.textContent = query
    ? `검색 결과 ${currentTracks.length}건`
    : "트렌딩 30곡을 확인하세요.";
  renderTracks(currentTracks);
}

function playTrack(trackId) {
  const selected = tracks.find((track) => track.id === trackId);
  if (!selected) {
    return;
  }
  currentTrackId = trackId;
  nowPlaying.textContent = `재생 중: ${selected.title} - ${selected.artist}`;
  audioPlayer.src = selected.previewUrl;
  audioPlayer
    .play()
    .catch(() => {
      statusText.textContent = "재생이 차단되었습니다. 다시 터치해 주세요.";
    });
  renderTracks(currentTracks);
}

button.addEventListener("click", handleSearch);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

list.addEventListener("click", (event) => {
  const target = event.target.closest("[data-track-id]");
  if (!target) {
    return;
  }
  playTrack(target.dataset.trackId);
});

stopBtn.addEventListener("click", () => {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  nowPlaying.textContent = "선택된 곡 없음";
  currentTrackId = null;
  renderTracks(currentTracks);
});

renderTracks(tracks);
