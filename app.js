const trackPool = [
  { title: "Blinding Lights", artist: "The Weeknd", tags: ["pop", "synthwave", "night"] },
  { title: "Save Your Tears", artist: "The Weeknd", tags: ["pop", "synthwave", "night"] },
  { title: "Starboy", artist: "The Weeknd", tags: ["pop", "rnb", "night"] },
  { title: "Levitating", artist: "Dua Lipa", tags: ["pop", "dance", "party"] },
  { title: "Dance The Night", artist: "Dua Lipa", tags: ["pop", "dance", "party"] },
  { title: "Don't Start Now", artist: "Dua Lipa", tags: ["pop", "dance", "party"] },
  { title: "As It Was", artist: "Harry Styles", tags: ["pop", "indie", "calm"] },
  { title: "Watermelon Sugar", artist: "Harry Styles", tags: ["pop", "indie", "summer"] },
  { title: "Adore You", artist: "Harry Styles", tags: ["pop", "indie", "calm"] },
  { title: "Cruel Summer", artist: "Taylor Swift", tags: ["pop", "summer", "upbeat"] },
  { title: "Style", artist: "Taylor Swift", tags: ["pop", "synthwave", "upbeat"] },
  { title: "Anti-Hero", artist: "Taylor Swift", tags: ["pop", "midtempo", "night"] },
  { title: "Shape of You", artist: "Ed Sheeran", tags: ["pop", "acoustic", "upbeat"] },
  { title: "Perfect", artist: "Ed Sheeran", tags: ["pop", "acoustic", "calm"] },
  { title: "Shivers", artist: "Ed Sheeran", tags: ["pop", "dance", "upbeat"] },
  { title: "Stay", artist: "The Kid LAROI", tags: ["pop", "electro", "upbeat"] },
  { title: "Without You", artist: "The Kid LAROI", tags: ["pop", "electro", "sad"] },
  { title: "Flowers", artist: "Miley Cyrus", tags: ["pop", "empower", "midtempo"] },
  { title: "Wrecking Ball", artist: "Miley Cyrus", tags: ["pop", "ballad", "sad"] },
  { title: "Vampire", artist: "Olivia Rodrigo", tags: ["pop", "rock", "sad"] },
  { title: "good 4 u", artist: "Olivia Rodrigo", tags: ["pop", "rock", "upbeat"] },
  { title: "drivers license", artist: "Olivia Rodrigo", tags: ["pop", "ballad", "sad"] },
  { title: "Unholy", artist: "Sam Smith", tags: ["pop", "dark", "dance"] },
  { title: "I'm Not The Only One", artist: "Sam Smith", tags: ["pop", "ballad", "sad"] },
  { title: "Fast Car", artist: "Luke Combs", tags: ["country", "acoustic", "calm"] },
  { title: "Beautiful Crazy", artist: "Luke Combs", tags: ["country", "acoustic", "calm"] },
  { title: "Butter", artist: "BTS", tags: ["kpop", "dance", "bright"] },
  { title: "Dynamite", artist: "BTS", tags: ["kpop", "dance", "bright"] },
  { title: "Boy With Luv", artist: "BTS", tags: ["kpop", "dance", "bright"] },
  { title: "Seven", artist: "Jungkook", tags: ["kpop", "pop", "summer"] },
  { title: "Standing Next to You", artist: "Jungkook", tags: ["kpop", "pop", "groove"] },
  { title: "Super Shy", artist: "NewJeans", tags: ["kpop", "dance", "bright"] },
  { title: "Hype Boy", artist: "NewJeans", tags: ["kpop", "dance", "bright"] },
  { title: "Ditto", artist: "NewJeans", tags: ["kpop", "calm", "winter"] },
  { title: "OMG", artist: "NewJeans", tags: ["kpop", "groove", "bright"] },
  { title: "ETA", artist: "NewJeans", tags: ["kpop", "dance", "party"] },
  { title: "Attention", artist: "NewJeans", tags: ["kpop", "groove", "calm"] },
  { title: "I AM", artist: "IVE", tags: ["kpop", "anthem", "bright"] },
  { title: "After LIKE", artist: "IVE", tags: ["kpop", "dance", "bright"] },
  { title: "Love Dive", artist: "IVE", tags: ["kpop", "dark", "groove"] },
  { title: "Perfect Night", artist: "LE SSERAFIM", tags: ["kpop", "dance", "night"] },
  { title: "UNFORGIVEN", artist: "LE SSERAFIM", tags: ["kpop", "anthem", "strong"] },
  { title: "Eve, Psyche & The Bluebeard's wife", artist: "LE SSERAFIM", tags: ["kpop", "dance", "club"] },
  { title: "Magnetic", artist: "ILLIT", tags: ["kpop", "bright", "dance"] },
  { title: "Lucky Girl Syndrome", artist: "ILLIT", tags: ["kpop", "bright", "calm"] },
  { title: "Spicy", artist: "aespa", tags: ["kpop", "electro", "strong"] },
  { title: "Drama", artist: "aespa", tags: ["kpop", "dark", "strong"] },
  { title: "Next Level", artist: "aespa", tags: ["kpop", "electro", "strong"] },
  { title: "S-Class", artist: "Stray Kids", tags: ["kpop", "hiphop", "strong"] },
  { title: "MANIAC", artist: "Stray Kids", tags: ["kpop", "hiphop", "dark"] },
  { title: "God's Menu", artist: "Stray Kids", tags: ["kpop", "hiphop", "strong"] },
  { title: "Pink Venom", artist: "BLACKPINK", tags: ["kpop", "hiphop", "strong"] },
  { title: "Shut Down", artist: "BLACKPINK", tags: ["kpop", "hiphop", "dark"] },
  { title: "How You Like That", artist: "BLACKPINK", tags: ["kpop", "dance", "strong"] },
  { title: "Cupid", artist: "FIFTY FIFTY", tags: ["kpop", "soft", "bright"] },
  { title: "Queencard", artist: "(G)I-DLE", tags: ["kpop", "dance", "strong"] },
  { title: "TOMBOY", artist: "(G)I-DLE", tags: ["kpop", "rock", "strong"] },
  { title: "Bam Yang Gang", artist: "BIBI", tags: ["kpop", "indie", "calm"] },
  { title: "BIBI Vengeance", artist: "BIBI", tags: ["kpop", "hiphop", "dark"] }
];

const tracks = trackPool.map((track, index) => ({
  ...track,
  id: String(index + 1),
  previewUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(index % 16) + 1}.mp3`
}));

const seedTracks = tracks.slice(0, 30);
const RELATED_PLAYLIST_SIZE = 30;

const input = document.getElementById("searchInput");
const button = document.getElementById("searchBtn");
const list = document.getElementById("trackList");
const statusText = document.getElementById("statusText");
const nowPlaying = document.getElementById("nowPlaying");
const queueInfo = document.getElementById("queueInfo");
const audioPlayer = document.getElementById("audioPlayer");
const stopBtn = document.getElementById("stopBtn");

let currentTracks = [...seedTracks];
let currentTrackId = null;
let activeQueue = [];
let queueIndex = -1;

function shareTagCount(a, b) {
  const set = new Set(a.tags);
  let count = 0;
  b.tags.forEach((tag) => {
    if (set.has(tag)) {
      count += 1;
    }
  });
  return count;
}

function scoreCandidate(seed, candidate) {
  if (seed.id === candidate.id) {
    return -1;
  }
  let score = 0;
  if (seed.artist === candidate.artist) {
    score += 10;
  }
  score += shareTagCount(seed, candidate) * 3;
  return score;
}

function buildRelatedPlaylist(seed) {
  const ranked = tracks
    .filter((track) => track.id !== seed.id)
    .map((track) => ({
      track,
      score: scoreCandidate(seed, track)
    }))
    .sort((a, b) => b.score - a.score || Number(a.track.id) - Number(b.track.id))
    .map((item) => item.track);

  const playlist = [seed, ...ranked.slice(0, RELATED_PLAYLIST_SIZE - 1)];

  if (playlist.length < RELATED_PLAYLIST_SIZE) {
    const usedIds = new Set(playlist.map((track) => track.id));
    tracks.forEach((track) => {
      if (playlist.length < RELATED_PLAYLIST_SIZE && !usedIds.has(track.id)) {
        playlist.push(track);
      }
    });
  }
  return playlist.slice(0, RELATED_PLAYLIST_SIZE);
}

function updatePlayerUI(track) {
  const position = queueIndex + 1;
  nowPlaying.textContent = `재생 중: ${track.title} - ${track.artist}`;
  queueInfo.textContent = `연관 재생 ${position}/${activeQueue.length}`;
}

function renderTracks(viewTracks) {
  list.innerHTML = "";
  viewTracks.forEach((track) => {
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

function playTrackInQueue(index) {
  if (index < 0 || index >= activeQueue.length) {
    return;
  }
  queueIndex = index;
  const target = activeQueue[queueIndex];
  currentTrackId = target.id;
  updatePlayerUI(target);
  audioPlayer.src = target.previewUrl;
  audioPlayer.play().catch(() => {
    statusText.textContent = "자동 재생이 차단되었습니다. 재생 버튼을 다시 터치해 주세요.";
  });
  renderTracks(currentTracks);
}

function startRelatedPlayback(seedTrackId) {
  const seed = tracks.find((track) => track.id === seedTrackId);
  if (!seed) {
    return;
  }
  activeQueue = buildRelatedPlaylist(seed);
  statusText.textContent = `"${seed.title}" 기준 연관 30곡 재생 목록 생성`;
  playTrackInQueue(0);
}

function stopPlayback() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  activeQueue = [];
  queueIndex = -1;
  currentTrackId = null;
  nowPlaying.textContent = "선택된 곡 없음";
  queueInfo.textContent = "연관 재생 대기 중";
  renderTracks(currentTracks);
}

function handleSearch() {
  const query = input.value.trim().toLowerCase();
  const filtered = seedTracks.filter((track) => {
    return (
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query)
    );
  });
  currentTracks = query ? filtered : seedTracks;
  statusText.textContent = query
    ? `검색 결과 ${currentTracks.length}건 (선택 시 연관 30곡 재생)`
    : "트렌딩 30곡 중 하나를 선택하면 연관 30곡이 재생됩니다.";
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
  startRelatedPlayback(target.dataset.trackId);
});

audioPlayer.addEventListener("ended", () => {
  const nextIndex = queueIndex + 1;
  if (nextIndex < activeQueue.length) {
    playTrackInQueue(nextIndex);
    return;
  }
  statusText.textContent = "연관 30곡 재생이 완료되었습니다.";
});

stopBtn.addEventListener("click", stopPlayback);

renderTracks(seedTracks);
