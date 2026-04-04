let games = [];

const gamesPromise = fetch("/js/games.json")
    .then(res => res.json())
    .then(data => {
        games = data;
    })
    .catch(err => {
        console.error("fetch err", err);
    });

function getRandomItems(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function getGameCategories(g) {
    const raw = g.Categories ?? g.categories ?? g.genre ?? g.genres ?? null;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(x => String(x).trim().toLowerCase());
    if (typeof raw === "string") return raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    return [String(raw).toLowerCase()];
}

function gameMatchesGenre(g, genreStr) {
    if (!genreStr) return false;
    const z = genreStr.toLowerCase();
    const x = getGameCategories(g);
    return x.includes(z);
}

function getRecentGames() {
    try {
        const raw = localStorage.getItem("recentGames");
        if (!raw) return [];
        const titles = JSON.parse(raw);
        return Array.isArray(titles) ? titles.slice(-30) : [];
    } catch (e) {
        console.error("Error reading recentGames from localStorage", e);
        return [];
    }
}

function addToRecentGames(game) {
    if (!game || !game.title) return;
    let recent = getRecentGames();
    recent = recent.filter(t => t !== game.title);
    recent.push(game.title);
    localStorage.setItem("recentGames", JSON.stringify(recent.slice(-30)));
}

function loadGames(list, divid, search) {
    var count = 0;
    const gcount = document.getElementById('gcount');
    const container = document.getElementById(divid);
    if (!container) {
        console.warn("container not found:", divid);
        return;
    }
    container.innerHTML = "";

    let finalList;

    if (list === "all") {
        finalList = games;
    } else if (list === "random") {
        finalList = getRandomItems(games, 6);
    } else if (list === "recent") {
        const recentTitles = getRecentGames();
        finalList = recentTitles
            .map(title => games.find(g => g.title === title))
            .filter(Boolean);
    } else if (list === "new") {
        finalList = games.slice(-30);
    } else if (typeof list === "string") {
        finalList = games.filter(g => gameMatchesGenre(g, list));
    } else if (Array.isArray(list)) {
        finalList = list;
    } else {
        finalList = [];
    }

    if (!finalList || finalList.length === 0) {
        const msg = document.createElement("div");
        msg.className = "no-results";
        if (search == null) {
            msg.innerHTML = "<style>.no-results{ color:red;}</style>Critical Error: No games found. (This is likely our fault and a bug. If this error persists, please report it to us.)";
        } else {
            msg.textContent = "No games found. Please try a different search query.";
        }

        container.appendChild(msg);
        gcount.innerHTML = "0 out of " + localStorage.getItem("gamecount") + " games";
        return;
    }

    const sorted = list === "recent" ? finalList : [...finalList].sort((a, b) => (a.title || "").localeCompare(b.title || ""));

    const frag = document.createDocumentFragment();
    sorted.forEach(g => {
        const div = document.createElement("div");
        div.className = "game-card";
        count++;

        const img = document.createElement("img");
        img.src = g.image;
        img.alt = g.title || "game";
        img.loading = "lazy";
        div.appendChild(img);

        const placeholder = document.createElement("div");
        placeholder.className = "placeholder-img";
        placeholder.style = "display: none; position: absolute; inset: 0px;";
        placeholder.textContent = "🎮";
        div.appendChild(placeholder);

        const overlay = document.createElement("div");
        overlay.className = "game-card-overlay";
        div.appendChild(overlay);

        const playOverlay = document.createElement("div");
        playOverlay.className = "play-overlay";
        const playBtnCircle = document.createElement("div");
        playBtnCircle.className = "play-btn-circle";
        const playIcon = document.createElement("span");
        playIcon.className = "play-icon";
        playIcon.textContent = "▶";
        playBtnCircle.appendChild(playIcon);
        playOverlay.appendChild(playBtnCircle);
        div.appendChild(playOverlay);

        const info = document.createElement("div");
        info.className = "game-card-info";
        const title = document.createElement("div");
        title.className = "game-card-title";
        title.textContent = g.title || "Untitled Game";

        const categories = document.createElement("div");
        categories.className = "game-card-cats";
        const cats = getGameCategories(g);
        cats.forEach(cat => {
            const catSpan = document.createElement("span");
            catSpan.className = "game-card-cat";
            catSpan.textContent = cat;
            categories.appendChild(catSpan);
        });

        info.appendChild(title);
        info.appendChild(categories);
        div.appendChild(info);

        const safeTitle = encodeURIComponent(
            (g.title || "")
                .trim()
                .replace(/\./g, "-")
                .replace(/\s+/g, "-")
                .replace(/'/g, "")
                .replace(/:/g, "") 
                .replace(/---/g, "-")
                .toLowerCase()
        );

        div.addEventListener("click", () => {
            addToRecentGames(g);
            window.location.href = `/play/${safeTitle}.html`;
        });

        frag.appendChild(div);

        if (count % 20 === 0) {
            const adWrapper = document.createElement("div");
            adWrapper.className = "game-card nohover";
            adWrapper.innerHTML = `
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7431909844582259"
                     crossorigin="anonymous"></script>

                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-7431909844582259"
                     data-ad-slot="8801020295"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>

                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
`;
            adWrapper.style.width = '100%';
            adWrapper.style.height = '180px';
            adWrapper.style.maxWidth = "1280px";
            frag.appendChild(adWrapper);
        }
    });


    if (count > 250) {
        gcount.innerHTML = count + " out of " + count + " games";
        localStorage.setItem("gamecount", count);
    } else {
        let gameCount = localStorage.getItem("gamecount");
        if (gameCount == null) {
            localStorage.setItem("gamecount", '256');
        }
        gcount.innerHTML = count + " out of " + localStorage.getItem("gamecount") + " games";
    }

    if (search == null) {
        list = list.toLowerCase().replace(/\b[a-z]/g, function(letter) {
            return letter.toUpperCase();
        });
        document.getElementById("genre").innerHTML = `${list} Games`;
    } else {
        document.querySelectorAll(".cat-btn")
            .forEach(btn => btn.classList.remove("active"));

        document.getElementById("allCat").classList.add("active");
    }

    container.appendChild(frag);
}
function searchGames(query, divid, mainElem) {
    if (!query || typeof query !== "string") {
        loadGames("all", divid, null);
         document.getElementById("genreset").innerHTML = `🎮 All Games`
        return;
    }
    
    const q = query.trim().toLowerCase();

    const results = games.filter(g => {
        const titleMatch = (g.title || "").toLowerCase().includes(q);

        const categories = getGameCategories(g) || [];
        const categoryMatch = categories.some(cat =>
            (cat || "").toLowerCase().includes(q)
        );

        return titleMatch || categoryMatch;
    });
     document.getElementById("genreset").innerHTML = `🎮 Results for "${query}"`
    loadGames(results, divid, "gibberish");
}
async function initGames() {
    await gamesPromise;

    const container = document.getElementById("games");
    if (!container) return;

    const genre = container.dataset.genre || "all";
    loadGames(genre, "games", null);
  document.getElementById("search-input").addEventListener("input", (e) => {
      searchGames(e.target.value, "games", this);
  });
    const categories = document.querySelectorAll(".cat-btn");
    categories.forEach(btn => {
        btn.addEventListener("click", (e) => {
            loadGenre(null, e.currentTarget);
        })
    })
}

document.addEventListener("DOMContentLoaded", initGames);

document.addEventListener("DOMContentLoaded", (e) => {
    if (e.target.id === "app") initGames();
});

function fullscreen(id) {
    const elem = document.getElementById(id);
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}
function loadGenre(_, element) {
    const genre = element.dataset.genre;

    loadGames(genre, "games", null);
    var inner = genre.toLowerCase().replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });
    document.querySelectorAll(".cat-btn")
        .forEach(btn => btn.classList.remove("active"));
     document.getElementById("genreset").innerHTML = `🎮 ${inner} Games`
    element.classList.add("active");
}