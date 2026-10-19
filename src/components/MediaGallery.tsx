import { useState } from "react";

interface MediaItem {
  id: string;
  type: "photo" | "video";
  src: string;
  title: string;
  subtitle: string;
}

const ALL_PHOTOS: string[] = [
  "IMG_0569.jpeg",
  "IMG_0570.jpeg",
  "IMG_0584.jpeg",
  "IMG_0591.jpeg",
  "IMG_0606.jpeg",
  "IMG_0610.jpeg",
  "IMG_0618.jpeg",
  "IMG_0619.jpeg",
  "IMG_0630.jpeg",
  "IMG_0650.jpeg",
  "IMG_0661.jpeg",
  "IMG_0716.jpeg",
  "IMG_0722.jpeg",
  "IMG_0737.jpeg",
  "IMG_0846.jpeg",
  "IMG_0906.jpeg",
  "IMG_0907.jpeg",
  "IMG_0908.jpeg",
  "IMG_0911.jpeg",
  "IMG_0912.jpeg",
  "IMG_0917.jpeg",
  "IMG_0919.jpeg",
  "IMG_0927.jpeg",
  "IMG_0928.jpeg",
  "IMG_0929.jpeg",
  "IMG_0930.jpeg",
  "IMG_0933.jpeg",
  "IMG_0942.jpeg",
  "IMG_0943.jpeg",
  "IMG_0945.jpeg",
  "IMG_0949.jpeg",
  "IMG_0998.jpeg",
  "IMG_1027.jpeg",
  "IMG_1113.jpeg",
  "IMG_1154.jpeg",
  "IMG_1192.jpeg",
  "IMG_1561_Original.JPG",
  "2024122801568_1771254454.jpg",
  "att.9ugddrCluSdN5n5WRRPD7eziMIK_pWZJtohwH3__h5o.jpg",
  "att.G5VcDA42BoxSO4XZ-Iau2c23ibofLn1EDMy1bLhn25k.jpg",
  "att.MxKb5WceAFRQF4SYQwA_SyIyYOS8R-4s2ktM8sgn_Mk.jpg",
  "att.NXqOjTdxf795cBqEMHiWOGd-HKxBDRi-Wlz0W-flMGM.jpg",
];

const ROMANTIC_CAPTIONS = [
  "My favorite smile in the world 🌸",
  "With you, every day feels like magic ✨",
  "The prettiest girl in the universe 💕",
  "Unforgettable moments together 🥂",
  "Holding hands through 554 beautiful days 💖",
  "My safe haven, my peace, my heart 🌹",
  "Forever grateful that you walked into my life 💍",
  "Sweet giggles and endless love 🍓",
  "You and me against the whole world 🌟",
  "Every second with you is a treasure 💌",
];

export function MediaGallery() {
  const [filter, setFilter] = useState<"all" | "photos" | "videos">("all");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});

  const videos: MediaItem[] = [
    {
      id: "v1",
      type: "video",
      src: "/pics/7F2A5C2E-FF4C-430F-8473-49CBF67796D3.MOV",
      title: "Our Sweet Journey Video 🎥",
      subtitle: "A precious video memory of our time together",
    },
    {
      id: "v2",
      type: "video",
      src: "/pics/album_UTW006B28vef_output (1).mov",
      title: "Our Love Album Story 💕",
      subtitle: "Capturing the magic and joy of our love",
    },
  ];

  const photoItems: MediaItem[] = ALL_PHOTOS.map((filename, i) => ({
    id: `p-${i}`,
    type: "photo",
    src: `/pics/${filename}`,
    title: `Nya Nya & Jack • Memory #${i + 1}`,
    subtitle: ROMANTIC_CAPTIONS[i % ROMANTIC_CAPTIONS.length],
  }));

  const allMedia: MediaItem[] = [...videos, ...photoItems];

  const filteredMedia = allMedia.filter((item) => {
    if (filter === "photos") return item.type === "photo";
    if (filter === "videos") return item.type === "video";
    return true;
  });

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const openLightbox = (item: MediaItem) => {
    setSelectedMedia(item);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const currentIndex = selectedMedia
    ? filteredMedia.findIndex((m) => m.id === selectedMedia.id)
    : -1;

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < filteredMedia.length - 1) {
      setSelectedMedia(filteredMedia[currentIndex + 1]);
    } else {
      setSelectedMedia(filteredMedia[0]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedMedia(filteredMedia[currentIndex - 1]);
    } else {
      setSelectedMedia(filteredMedia[filteredMedia.length - 1]);
    }
  };

  return (
    <div className="media-gallery-section">
      <div className="gallery-header">
        <span className="gallery-badge">📸 OUR PRECIOUS MEMORIES</span>
        <h2 className="gallery-title">554 Days of Pure Happiness</h2>
        <p className="gallery-subtitle">
          Every photo and video tells the story of our love. Dedicated to my dearest Nya Nya.
        </p>

        {/* Filter pills */}
        <div className="gallery-filters">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Moments ({allMedia.length})
          </button>
          <button
            className={`filter-btn ${filter === "photos" ? "active" : ""}`}
            onClick={() => setFilter("photos")}
          >
            Photos ({photoItems.length})
          </button>
          <button
            className={`filter-btn ${filter === "videos" ? "active" : ""}`}
            onClick={() => setFilter("videos")}
          >
            Videos (2) 🎬
          </button>
        </div>
      </div>

      {/* Featured Videos Highlight if filter is all or videos */}
      {(filter === "all" || filter === "videos") && (
        <div className="featured-videos-banner">
          <h3 className="section-mini-heading">🎥 Watch Our Love Videos</h3>
          <div className="videos-grid">
            {videos.map((vid) => (
              <div key={vid.id} className="video-card">
                <div className="video-frame-wrap">
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    className="romantic-video-player"
                    src={vid.src}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="video-info">
                  <h4>{vid.title}</h4>
                  <p>{vid.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Grid / Masonry Cards */}
      {(filter === "all" || filter === "photos") && (
        <div className="photos-masonry-grid">
          {photoItems.map((photo) => (
            <div
              key={photo.id}
              className="photo-polaroid-card"
              onClick={() => openLightbox(photo)}
            >
              <div className="polaroid-image-wrap">
                <img
                  src={photo.src}
                  alt={photo.title}
                  loading="lazy"
                  className="polaroid-img"
                />
                <button
                  className="like-heart-btn"
                  onClick={(e) => handleLike(photo.id, e)}
                  title="Send love"
                >
                  ❤️ {likes[photo.id] || ""}
                </button>
              </div>
              <div className="polaroid-caption">
                <p className="caption-text">{photo.subtitle}</p>
                <span className="caption-tag">Nya Nya 💕</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={closeLightbox} aria-label="Close">
              ✕
            </button>

            <button className="lightbox-nav-btn prev-btn" onClick={handlePrev} aria-label="Previous">
              ‹
            </button>
            <button className="lightbox-nav-btn next-btn" onClick={handleNext} aria-label="Next">
              ›
            </button>

            <div className="lightbox-media-wrap">
              {selectedMedia.type === "photo" ? (
                <img
                  src={selectedMedia.src}
                  alt={selectedMedia.title}
                  className="lightbox-img"
                />
              ) : (
                <video
                  controls
                  autoPlay
                  playsInline
                  className="lightbox-video"
                  src={selectedMedia.src}
                />
              )}
            </div>

            <div className="lightbox-caption-bar">
              <div className="lightbox-info">
                <h4>{selectedMedia.title}</h4>
                <p>{selectedMedia.subtitle}</p>
              </div>
              <button
                className="lightbox-like-btn"
                onClick={(e) => handleLike(selectedMedia.id, e)}
              >
                💖 {likes[selectedMedia.id] || 0} Loves
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
