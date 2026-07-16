const API_BASE = "https://api.waifu.im";

const state = {
  isNsfw: "False",
  orientation: "All",
  isAnimated: "All",
  orderBy: "Random",
  pageSize: 30,
  page: 1,
  includedTags: new Set(),
  totalPages: 1,
};

const els = {
  grid: document.getElementById("grid"),
  status: document.getElementById("status"),
  tagChips: document.getElementById("tagChips"),
  drawer: document.getElementById("drawer"),
  prevPage: document.getElementById("prevPage"),
  nextPage: document.getElementById("nextPage"),
  pageLabel: document.getElementById("pageLabel"),
  refreshBtn: document.getElementById("refreshBtn"),
  lightbox: document.getElementById("lightbox"),
  lightboxImg: document.getElementById("lightboxImg"),
  lightboxClose: document.getElementById("lightboxClose"),
  lbId: document.getElementById("lbId"),
  lbDl: document.getElementById("lbDl"),
  lbTags: document.getElementById("lbTags"),
  lbSource: document.getElementById("lbSource"),
};

function buildParams() {
  const p = new URLSearchParams();
  p.set("isNsfw", state.isNsfw);
  p.set("orientation", state.orientation);
  p.set("isAnimated", state.isAnimated);
  p.set("orderBy", state.orderBy);
  p.set("page", String(state.page));
  p.set("pageSize", String(state.pageSize));
  for (const tag of state.includedTags) p.append("includedTags", tag);
  return p;
}

function setStatus(msg, isError) {
  if (!msg) {
    els.status.hidden = true;
    els.status.textContent = "";
    return;
  }
  els.status.hidden = false;
  els.status.textContent = msg;
  els.status.classList.toggle("status--error", !!isError);
}

async function fetchTags() {
  try {
    const res = await fetch(`${API_BASE}/tags`);
    if (!res.ok) throw new Error("tags request failed");
    const data = await res.json();
    renderTagChips(data.versatile || [], data.nsfw || []);
  } catch (err) {
    els.tagChips.innerHTML = `<span class="chip chip--loading">catalogue unavailable</span>`;
    console.error(err);
  }
}

function slugToLabel(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderTagChips(versatile, nsfw) {
  els.tagChips.innerHTML = "";
  const makeChip = (slug, isNsfwTag) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (isNsfwTag ? " chip--nsfw" : "");
    chip.textContent = slugToLabel(slug);
    chip.dataset.slug = slug;
    chip.hidden = isNsfwTag && state.isNsfw === "False";
    chip.addEventListener("click", () => {
      if (state.includedTags.has(slug)) state.includedTags.delete(slug);
      else state.includedTags.add(slug);
      chip.classList.toggle("is-active");
      state.page = 1;
      loadImages();
    });
    return chip;
  };
  versatile.forEach((slug) => els.tagChips.appendChild(makeChip(slug, false)));
  nsfw.forEach((slug) => els.tagChips.appendChild(makeChip(slug, true)));
}

function updateNsfwTagVisibility() {
  els.tagChips.querySelectorAll(".chip--nsfw").forEach((chip) => {
    chip.hidden = state.isNsfw === "False";
    if (chip.hidden && chip.classList.contains("is-active")) {
      chip.classList.remove("is-active");
      state.includedTags.delete(chip.dataset.slug);
    }
  });
}

function cardTemplate(item) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${item.url}" alt="" loading="lazy" />
    <span class="card__tag">
      <span class="card__swatch" style="background:${item.dominantColor || "#888"}"></span>
      No. ${item.id}
    </span>
    ${item.isNsfw ? '<span class="card__nsfw">NSFW</span>' : ""}
  `;
  card.addEventListener("click", () => openLightbox(item));
  return card;
}

function renderGrid(items) {
  els.grid.innerHTML = "";
  if (!items.length) {
    setStatus("No specimens match this combination of filters.");
    return;
  }
  setStatus(null);
  const frag = document.createDocumentFragment();
  items.forEach((item) => frag.appendChild(cardTemplate(item)));
  els.grid.appendChild(frag);
}

// LIGHTBOX - langsung ke halaman utama tanpa lightbox
function openLightbox(item) {
  // Langsung buka URL gambar di tab baru
  window.open(item.url, '_blank');
  
  // Atau jika ingin langsung download:
  // const link = document.createElement('a');
  // link.href = item.url;
  // link.download = `waifu_${item.id}.${item.extension}`;
  // link.click();
}

// Hapus semua fungsi lightbox yang tidak perlu
// function closeLightbox() { ... } // TIDAK DIPERLUKAN

// Event listeners untuk lightbox - DINONAKTIFKAN
// els.lightboxClose.addEventListener("click", ...);
// els.lightbox.addEventListener("click", ...);
// document.addEventListener("keydown", ...);

// TAMBAHAN: Jika ada elemen lightbox di HTML, sembunyikan secara permanen
document.addEventListener('DOMContentLoaded', function() {
  if (els.lightbox) {
    els.lightbox.style.display = 'none';
  }
});

async function loadImages() {
  setStatus("Consulting the archive…");
  els.grid.innerHTML = "";
  try {
    const res = await fetch(`${API_BASE}/images?${buildParams().toString()}`);
    if (!res.ok) throw new Error(`request failed (${res.status})`);
    const data = await res.json();
    state.totalPages = data.totalPages || 1;
    els.pageLabel.textContent = `Plate ${state.page} / ${state.totalPages}`;
    els.prevPage.disabled = state.page <= 1;
    els.nextPage.disabled = state.page >= state.totalPages;
    renderGrid(data.items || []);
  } catch (err) {
    setStatus("The archive could not be reached. Please try again shortly.", true);
    console.error(err);
  }
}

els.drawer.querySelectorAll(".seg").forEach((seg) => {
  const key = seg.dataset.key;
  seg.querySelectorAll(".seg__opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      seg.querySelectorAll(".seg__opt").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const val = btn.dataset.val;
      state[key] = key === "pageSize" ? Number(val) : val;
      state.page = 1;
      if (key === "isNsfw") updateNsfwTagVisibility();
      loadImages();
    });
  });
});

els.prevPage.addEventListener("click", () => {
  if (state.page > 1) {
    state.page -= 1;
    loadImages();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

els.nextPage.addEventListener("click", () => {
  if (state.page < state.totalPages) {
    state.page += 1;
    loadImages();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

els.refreshBtn.addEventListener("click", () => loadImages());

fetchTags();
loadImages();