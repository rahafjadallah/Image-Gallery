
const galleryItems = [...document.querySelectorAll(".gallery-item")];

const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.querySelector("#searchInput");
const imageCount = document.querySelector("#imageCount");
const favoritesCount = document.querySelector("#favoritesCount");
const emptyMessage = document.querySelector("#emptyMessage");
const clearFavoritesBtn = document.querySelector("#clearFavoritesBtn");
const toast = document.querySelector("#toast");

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxCounter = document.querySelector("#lightboxCounter");

const closeBtn = document.querySelector("#closeBtn");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");

let currentFilter = localStorage.getItem("lastFilter") || "all";
let currentImages = [];
let currentIndex = 0;
let toastTimer;

// Load Favorites

let favorites = [];

try {
    const savedFavorites = JSON.parse(
        localStorage.getItem("favorites")
    );

    favorites = Array.isArray(savedFavorites) ? savedFavorites : [];
} catch {
    favorites = [];
}

// Save Favorites

function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Toast Notification

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// Update Favorite Buttons and Counter

function updateFavoriteButtons() {
    galleryItems.forEach(item => {
        const favoriteButton = item.querySelector(".favorite-btn");
        const imageTitle = item.dataset.title;

        const isFavorite = favorites.includes(imageTitle);

        favoriteButton.textContent = isFavorite ? "♥" : "♡";

        favoriteButton.classList.toggle("favorited", isFavorite);

        favoriteButton.setAttribute(
            "aria-label",
            isFavorite ? "Remove from favorites" : "Add to favorites"
        );
    });

    favoritesCount.textContent = favorites.length;
}

// Filter and Search

function filterGallery() {
    const searchValue = searchInput.value.trim().toLowerCase();

    currentImages = galleryItems.filter(item => {
        const category = item.dataset.category;
        const title = item.dataset.title.toLowerCase();

        const matchesCategory =
            currentFilter === "all" ||
            category === currentFilter ||
            (currentFilter === "favorites" &&
                favorites.includes(item.dataset.title));

        const matchesSearch = title.includes(searchValue);

        return matchesCategory && matchesSearch;
    });

    galleryItems.forEach(item => {
        item.style.display = currentImages.includes(item)
            ? "block"
            : "none";
    });

    imageCount.textContent = `${currentImages.length} photos`;

    emptyMessage.style.display =
        currentImages.length === 0 ? "block" : "none";

    emptyMessage.textContent =
        currentFilter === "favorites"
            ? "You haven't added any favorites yet."
            : "No photos found.";

    clearFavoritesBtn.style.display =
        favorites.length > 0 ? "inline-block" : "none";
}

// Category Buttons

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        localStorage.setItem("lastFilter", currentFilter);

        filterGallery();
    });
});

// Search

searchInput.addEventListener("input", filterGallery);

// Favorites

galleryItems.forEach(item => {
    const favoriteButton = item.querySelector(".favorite-btn");

    favoriteButton.addEventListener("click", event => {
        event.stopPropagation();

        const imageTitle = item.dataset.title;

        if (favorites.includes(imageTitle)) {
            favorites = favorites.filter(title => title !== imageTitle);
            showToast("Removed from favorites");
        } else {
            favorites.push(imageTitle);
            showToast("Added to favorites ♥");
        }

        saveFavorites();
        updateFavoriteButtons();
        filterGallery();
    });
});

// Clear All Favorites

clearFavoritesBtn.addEventListener("click", () => {
    if (favorites.length === 0) return;

    const confirmClear = confirm(
        "Are you sure you want to remove all favorite images?"
    );

    if (confirmClear) {
        favorites = [];

        saveFavorites();
        updateFavoriteButtons();
        filterGallery();

        showToast("All favorites have been cleared");
    }
});

// Open Lightbox

function openLightbox(index) {
    if (currentImages.length === 0) return;

    currentIndex = index;

    const selectedItem = currentImages[currentIndex];

    lightboxImage.src = selectedItem.querySelector("img").src;
    lightboxImage.alt = selectedItem.dataset.title;

    lightboxTitle.textContent = selectedItem.dataset.title;

    lightboxCounter.textContent =
        `${currentIndex + 1} / ${currentImages.length}`;

    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
}

// Gallery Image Click

galleryItems.forEach(item => {
    item.addEventListener("click", () => {
        const index = currentImages.indexOf(item);

        if (index !== -1) {
            openLightbox(index);
        }
    });
});

// Next Image

function nextImage() {
    if (currentImages.length === 0) return;

    currentIndex = (currentIndex + 1) % currentImages.length;

    openLightbox(currentIndex);
}

// Previous Image

function previousImage() {
    if (currentImages.length === 0) return;

    currentIndex =
        (currentIndex - 1 + currentImages.length) % currentImages.length;

    openLightbox(currentIndex);
}

nextBtn.addEventListener("click", nextImage);
prevBtn.addEventListener("click", previousImage);

// Close Lightbox

function closeLightbox() {
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
}

closeBtn.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", event => {
    if (event.target === lightbox) {
        closeLightbox();
    }
});

// Keyboard Controls

document.addEventListener("keydown", event => {
    if (!lightbox.classList.contains("show")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") nextImage();
    if (event.key === "ArrowLeft") previousImage();
});

// Touch Navigation

let touchStartX = 0;
let touchEndX = 0;

lightboxImage.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches[0].screenX;
}, { passive: true });

lightboxImage.addEventListener("touchend", event => {
    touchEndX = event.changedTouches[0].screenX;

    const difference = touchStartX - touchEndX;

    if (Math.abs(difference) < 50) return;

    if (difference > 0) {
        nextImage();
    } else {
        previousImage();
    }
}, { passive: true });

// Restore Last Filter

filterButtons.forEach(button => {
    button.classList.toggle(
        "active",
        button.dataset.filter === currentFilter
    );
});

// Initial Display

updateFavoriteButtons();
filterGallery();
