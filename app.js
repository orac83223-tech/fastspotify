const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const REDIRECT_URI = `${window.location.origin}${window.location.pathname}`;
const TOP_PLAYLIST_ID = "37i9dQZEVXbMDoHDwVN2tF"; // Top 50 Global
const RELATED_PLAYLIST_SIZE = 30;
const STORAGE_KEY = "fastspotify_spotify_auth";
const CLIENT_ID_KEY = "fastspotify_client_id";
const CODE_VERIFIER_KEY = "fastspotify_code_verifier";
const AUTH_STATE_KEY = "fastspotify_auth_state";

const clientIdInput = document.getElementById("clientIdInput");
const saveClientIdBtn = document.getElementById("saveClientIdBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");
const input = document.getElementById("searchInput");
const button = document.getElementById("searchBtn");
const list = document.getElementById("trackList");
const statusText = document.getElementById("statusText");
const nowPlaying = document.getElementById("nowPlaying");
const queueInfo = document.getElementById("queueInfo");
const audioPlayer = document.getElementById("audioPlayer");
const stopBtn = document.getElementById("stopBtn");

let currentTracks = [];
let seedTracks = [];
let activeQueue = [];
let queueIndex = -1;
let currentTrackId = null;
let spotifyAuth = loadSpotifyAuth();

function loadSpotifyAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSpotifyAuth(data) {
  spotifyAuth = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearSpotifyAuth() {
  spotifyAuth = null;
  localStorage.removeItem(STORAGE_KEY);
}

function getStoredClientId() {
  return localStorage.getItem(CLIENT_ID_KEY) || "";
}

function setStoredClientId(clientId) {
  localStorage.setItem(CLIENT_ID_KEY, clientId.trim());
}

function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

function base64UrlEncode(bytes) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function beginSpotifyLogin() {
  const clientId = getStoredClientId();
  if (!clientId) {
    authStatus.textContent = "먼저 Spotify Client ID를 입력하고 저장하세요.";
    return;
  }

  const verifier = randomString(96);
  const challenge = base64UrlEncode(await sha256(verifier));
  const state = randomString(16);
  localStorage.setItem(CODE_VERIFIER_KEY, verifier);
  localStorage.setItem(AUTH_STATE_KEY, state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state
  });
  window.location.href = `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`;
}

async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem(CODE_VERIFIER_KEY);
  const clientId = getStoredClientId();
  if (!verifier || !clientId) {
    throw new Error("로그인 세션 정보가 없습니다.");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) {
    throw new Error("토큰 발급 실패");
  }
  const data = await response.json();
  saveSpotifyAuth({
    access_token: data.access_token,
    refresh_token: data.refresh_token || "",
    expires_at: Date.now() + data.expires_in * 1000
  });
  localStorage.removeItem(CODE_VERIFIER_KEY);
}

async function refreshAccessTokenIfNeeded() {
  if (!spotifyAuth) {
    throw new Error("로그인이 필요합니다.");
  }

  const in30s = Date.now() + 30 * 1000;
  if (spotifyAuth.expires_at > in30s) {
    return spotifyAuth.access_token;
  }

  if (!spotifyAuth.refresh_token) {
    clearSpotifyAuth();
    throw new Error("세션이 만료되었습니다. 다시 로그인하세요.");
  }

  const clientId = getStoredClientId();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: spotifyAuth.refresh_token,
    client_id: clientId
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) {
    clearSpotifyAuth();
    throw new Error("토큰 갱신 실패");
  }

  const data = await response.json();
  saveSpotifyAuth({
    access_token: data.access_token,
    refresh_token: data.refresh_token || spotifyAuth.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000
  });
  return spotifyAuth.access_token;
}

async function spotifyFetch(path) {
  const token = await refreshAccessTokenIfNeeded();
  const response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    throw new Error(`Spotify API 실패: ${response.status}`);
  }
  return response.json();
}

function mapTrack(track) {
  if (!track || !track.id || !track.name || !track.artists || !track.artists.length) {
    return null;
  }
  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    artistId: track.artists[0].id || "",
    previewUrl: track.preview_url || "",
    openUrl: track.external_urls?.spotify || ""
  };
}

async function fetchSeedTracks() {
  const data = await spotifyFetch(`/playlists/${TOP_PLAYLIST_ID}/tracks?market=US&limit=30`);
  const mapped = data.items.map((item) => mapTrack(item.track)).filter(Boolean);
  seedTracks = mapped;
  currentTracks = [...seedTracks];
}

async function fetchRelatedTracks(seedTrack) {
  try {
    const data = await spotifyFetch(
      `/recommendations?market=US&limit=${RELATED_PLAYLIST_SIZE}&seed_tracks=${encodeURIComponent(seedTrack.id)}`
    );
    const mapped = data.tracks.map(mapTrack).filter(Boolean);
    if (mapped.length) {
      return mapped;
    }
  } catch {
    // fallback
  }

  if (!seedTrack.artistId) {
    return [seedTrack];
  }

  const relatedArtists = await spotifyFetch(`/artists/${seedTrack.artistId}/related-artists`);
  const artistIds = [seedTrack.artistId, ...relatedArtists.artists.map((a) => a.id)].slice(0, 6);
  const collected = [seedTrack];
  const seen = new Set([seedTrack.id]);

  for (const artistId of artistIds) {
    const top = await spotifyFetch(`/artists/${artistId}/top-tracks?market=US`);
    top.tracks.forEach((track) => {
      const mapped = mapTrack(track);
      if (mapped && !seen.has(mapped.id) && collected.length < RELATED_PLAYLIST_SIZE) {
        seen.add(mapped.id);
        collected.push(mapped);
      }
    });
    if (collected.length >= RELATED_PLAYLIST_SIZE) {
      break;
    }
  }
  return collected.slice(0, RELATED_PLAYLIST_SIZE);
}

function renderTracks(viewTracks) {
  list.innerHTML = "";
  viewTracks.forEach((track) => {
    const item = document.createElement("li");
    item.className = "track";
    if (track.id === currentTrackId) {
      item.classList.add("active");
    }

    const previewLabel = track.previewUrl ? "미리듣기 가능" : "미리듣기 없음";
    item.innerHTML = `
      <button class="track-btn" type="button" data-track-id="${track.id}">
        <strong>${track.title}</strong>
        <span>${track.artist} · ${previewLabel}</span>
      </button>
    `;
    list.appendChild(item);
  });
}

function updatePlayerUI(track) {
  const pos = queueIndex + 1;
  nowPlaying.textContent = `재생 중: ${track.title} - ${track.artist}`;
  queueInfo.textContent = `연관 재생 ${pos}/${activeQueue.length}`;
}

function playTrackInQueue(startIndex) {
  let idx = startIndex;
  while (idx < activeQueue.length && !activeQueue[idx].previewUrl) {
    idx += 1;
  }

  if (idx >= activeQueue.length) {
    statusText.textContent = "재생 가능한 미리듣기 URL이 없습니다. Spotify 앱에서 전체 곡을 재생해 주세요.";
    nowPlaying.textContent = "재생 가능한 곡 없음";
    queueInfo.textContent = "연관 재생 종료";
    return;
  }

  queueIndex = idx;
  const track = activeQueue[idx];
  currentTrackId = track.id;
  audioPlayer.src = track.previewUrl;
  updatePlayerUI(track);
  audioPlayer.play().catch(() => {
    statusText.textContent = "자동 재생이 차단되었습니다. 플레이어에서 재생 버튼을 눌러주세요.";
  });
  renderTracks(currentTracks);
}

async function startRelatedPlayback(seedTrackId) {
  const seed = seedTracks.find((track) => track.id === seedTrackId) || currentTracks.find((track) => track.id === seedTrackId);
  if (!seed) {
    return;
  }

  statusText.textContent = `"${seed.title}" 기준 연관 30곡 조회 중...`;
  try {
    activeQueue = await fetchRelatedTracks(seed);
    if (!activeQueue.length) {
      statusText.textContent = "연관 곡을 찾지 못했습니다.";
      return;
    }
    statusText.textContent = `"${seed.title}" 기준 연관 ${activeQueue.length}곡 재생 목록 생성`;
    playTrackInQueue(0);
  } catch (error) {
    statusText.textContent = `연관 곡 조회 실패: ${error.message}`;
  }
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
    return track.title.toLowerCase().includes(query) || track.artist.toLowerCase().includes(query);
  });
  currentTracks = query ? filtered : seedTracks;
  statusText.textContent = query
    ? `검색 결과 ${currentTracks.length}건 (클릭 시 연관 30곡 재생)`
    : "목록에서 한 곡을 누르면 Spotify 연관 30곡을 생성해 재생합니다.";
  renderTracks(currentTracks);
}

function getAuthQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    code: params.get("code"),
    state: params.get("state"),
    error: params.get("error")
  };
}

function refreshAuthUI() {
  const clientId = getStoredClientId();
  clientIdInput.value = clientId;
  loginBtn.disabled = !clientId;
  const connected = Boolean(spotifyAuth?.access_token);
  authStatus.textContent = connected
    ? "Spotify 연결됨"
    : "Spotify Client ID 저장 후 로그인하세요.";
}

async function bootstrapAuth() {
  const { code, state, error } = getAuthQuery();
  if (error) {
    authStatus.textContent = `로그인 실패: ${error}`;
    return;
  }

  if (code) {
    const expectedState = localStorage.getItem(AUTH_STATE_KEY);
    if (!expectedState || state !== expectedState) {
      authStatus.textContent = "보안 검증(state) 실패. 다시 로그인하세요.";
      return;
    }
    try {
      await exchangeCodeForToken(code);
      history.replaceState({}, "", REDIRECT_URI);
      localStorage.removeItem(AUTH_STATE_KEY);
      authStatus.textContent = "Spotify 로그인 성공";
    } catch (e) {
      authStatus.textContent = `토큰 교환 실패: ${e.message}`;
    }
  }
}

async function initApp() {
  refreshAuthUI();
  await bootstrapAuth();
  refreshAuthUI();

  if (!spotifyAuth?.access_token) {
    renderTracks([]);
    return;
  }

  try {
    await fetchSeedTracks();
    renderTracks(seedTracks);
    statusText.textContent = "목록에서 한 곡을 누르면 Spotify 연관 30곡을 생성해 재생합니다.";
  } catch (e) {
    statusText.textContent = `목록 로드 실패: ${e.message}`;
  }
}

saveClientIdBtn.addEventListener("click", () => {
  setStoredClientId(clientIdInput.value);
  refreshAuthUI();
});

loginBtn.addEventListener("click", () => {
  beginSpotifyLogin();
});

logoutBtn.addEventListener("click", () => {
  clearSpotifyAuth();
  stopPlayback();
  seedTracks = [];
  currentTracks = [];
  renderTracks([]);
  refreshAuthUI();
  statusText.textContent = "로그아웃되었습니다.";
});

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
  if (!activeQueue.length) {
    return;
  }
  const nextIndex = queueIndex + 1;
  if (nextIndex < activeQueue.length) {
    playTrackInQueue(nextIndex);
    return;
  }
  statusText.textContent = "연관 30곡 재생이 완료되었습니다.";
});

stopBtn.addEventListener("click", stopPlayback);

initApp();
