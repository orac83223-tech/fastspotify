const defaultTracks = [
  { title: "Blinding Lights", artist: "The Weeknd" },
  { title: "Super Shy", artist: "NewJeans" },
  { title: "Golden", artist: "HUNTR/X" },
  { title: "Levitating", artist: "Dua Lipa" },
  { title: "As It Was", artist: "Harry Styles" },
  { title: "Hype Boy", artist: "NewJeans" },
  { title: "Seven", artist: "Jungkook" }
];

const input = document.getElementById("searchInput");
const button = document.getElementById("searchBtn");
const list = document.getElementById("trackList");
const statusText = document.getElementById("statusText");

function renderTracks(tracks) {
  list.innerHTML = "";
  tracks.forEach((track) => {
    const item = document.createElement("li");
    item.className = "track";
    item.innerHTML = `<strong>${track.title}</strong><span>${track.artist}</span>`;
    list.appendChild(item);
  });
}

function handleSearch() {
  const query = input.value.trim().toLowerCase();
  const filtered = defaultTracks.filter((track) => {
    return (
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query)
    );
  });
  statusText.textContent = query
    ? `검색 결과 ${filtered.length}건`
    : "트렌딩 추천을 확인하세요.";
  renderTracks(filtered.length ? filtered : defaultTracks);
}

button.addEventListener("click", handleSearch);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

renderTracks(defaultTracks);
