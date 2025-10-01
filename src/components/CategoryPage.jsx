// src/components/CategoryPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const CategoryPage = () => {
  const { categoryName, username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [entries, setEntries] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const buttonText = "See more on Ami!";
  const [hasFetched, setHasFetched] = useState(false);

  // Function to get solid color based on category name - now returns white
  const getCategoryColor = (category) => {
    return "white"; // All backgrounds are now white
  };

  // Function to normalize category name for database queries
  const normalizeCategoryName = (category) => {
    // Convert plural to singular for database queries
    const lowerCategory = category.toLowerCase();
    if (lowerCategory === "books") {
      return "book";
    } else if (lowerCategory === "podcasts") {
      return "podcast";
    } else if (lowerCategory === "tv" || lowerCategory === "music") {
      // These stay the same
      return lowerCategory;
    }
    return lowerCategory; // Return as-is for any other categories
  };

  // Extract userId from URL state or query parameters
  useEffect(() => {
    // Check if userId was passed in location state
    if (location.state && location.state.userId) {
      setUserId(location.state.userId);
    } else {
      // Extract userId from URL query parameters if present
      const params = new URLSearchParams(location.search);
      const userIdFromQuery = params.get("userId");
      if (userIdFromQuery) {
        setUserId(userIdFromQuery);
      }
    }
  }, [location]);

  // Fetch user data based on username
  useEffect(() => {
    async function fetchUserData() {
      if (!username) return;

      try {
        const usersRef = collection(db, "users_v3");
        const usersSnapshot = await getDocs(usersRef);

        let foundUser = null;
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (
            (data.username &&
              data.username.toLowerCase() === username.toLowerCase()) ||
            (data.name && data.name.toLowerCase() === username.toLowerCase())
          ) {
            foundUser = { id: doc.id, ...data };
            setUserId(doc.id);
          }
        });

        if (foundUser) {
          setUserData(foundUser);
        } else {
          console.error("User not found for username:", username);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    fetchUserData();
  }, [username]);

  // Fetch entries for this category
  useEffect(() => {
    let isMounted = true;

    async function fetchCategoryEntries() {
      if (!categoryName || !userId) return;

      try {
        const normalizedCategoryName = normalizeCategoryName(categoryName);
        const entriesQuery = query(
          collection(db, "archives_v3"),
          where("category", "==", normalizedCategoryName),
          where("userId", "==", userId)
        );

        const entriesSnapshot = await getDocs(entriesQuery);

        if (!isMounted) return;

        if (entriesSnapshot.empty) {
          setEntries([]);
        } else {
          const entriesData = [];
          entriesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (
              data.status === "completed" ||
              !data.status ||
              data.status === "" ||
              data.status === null
            ) {
              entriesData.push({
                id: doc.id,
                ...data,
              });
            }
          });

          // Sort entries by date (newest first)
          entriesData.sort((a, b) => {
            // First try to use updatedAt, then fallback to createdAt
            let dateA, dateB;

            // Try to get dateA
            if (a.updatedAt) {
              dateA = a.updatedAt.toDate
                ? a.updatedAt.toDate()
                : new Date(a.updatedAt);
            } else if (a.createdAt) {
              dateA = a.createdAt.toDate
                ? a.createdAt.toDate()
                : new Date(a.createdAt);
            } else {
              dateA = new Date(0);
            }

            // Try to get dateB
            if (b.updatedAt) {
              dateB = b.updatedAt.toDate
                ? b.updatedAt.toDate()
                : new Date(b.updatedAt);
            } else if (b.createdAt) {
              dateB = b.createdAt.toDate
                ? b.createdAt.toDate()
                : new Date(b.createdAt);
            } else {
              dateB = new Date(0);
            }

            return dateB - dateA;
          });

          if (isMounted) {
            setEntries(entriesData);
          }
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        if (isMounted) {
          setHasFetched(true);
        }
      }
    }

    fetchCategoryEntries();

    return () => {
      isMounted = false;
    };
  }, [categoryName, userId]);

  // Get the solid color for this category - Replace the gradient variable
  const backgroundColor = getCategoryColor(categoryName);

  // Update the useEffect for background color
  useEffect(() => {
    // Store the original colors
    const originalHtmlBackground = document.documentElement.style.background;
    const originalBodyBackground = document.body.style.background;
    const originalRootBackground =
      document.getElementById("root").style.background;

    // Set theme-color meta tag to white
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = "white";

    // Apply white background to all necessary elements
    document.documentElement.style.background = "white";
    document.body.style.background = "white";
    document.getElementById("root").style.background = "white";

    // Cleanup function
    return () => {
      if (metaThemeColor) {
        metaThemeColor.content = "white";
      }
      document.documentElement.style.background = originalHtmlBackground;
      document.body.style.background = originalBodyBackground;
      document.getElementById("root").style.background = originalRootBackground;
    };
  }, [backgroundColor]);

  // Group entries by month - exclude artist entries for music category and show entries for podcasts category
  const groupEntriesByMonth = (entries) => {
    const grouped = {};

    const filteredEntries = entries.filter((entry) => {
      if (categoryName.toLowerCase() === "music" && entry.format === "artist") {
        return false;
      }
      if (
        categoryName.toLowerCase() === "podcasts" &&
        entry.format === "show"
      ) {
        return false;
      }
      return true;
    });

    filteredEntries.forEach((entry) => {
      let monthYear = "Unknown Date";

      if (entry.createdAt) {
        const date = entry.createdAt.toDate
          ? entry.createdAt.toDate()
          : new Date(entry.createdAt);
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear().toString().substr(-2); // Get last 2 digits of year
        monthYear = `${month} '${year}`;
      }

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }

      grouped[monthYear].push(entry);
    });

    return grouped;
  };

  // Group entries by month
  const groupedEntries = groupEntriesByMonth(entries);

  // Function to format the rating (ensure it has one decimal place)
  const formatRating = (rating) => {
    if (rating === undefined || rating === null) {
      return null; // Return null if no rating so we don't display it
    }

    // Convert to number if it's a string
    const numRating = typeof rating === "string" ? parseFloat(rating) : rating;

    // Format to one decimal place
    return numRating.toFixed(1);
  };

  // Function to get display text for category
  const getCategoryDisplayText = (baseCategoryName, monthYear) => {
    // Handle category name differences for display
    switch (baseCategoryName.toLowerCase()) {
      case "podcasts":
        return `Listened in ${monthYear}`;
      case "books":
        return `Read in ${monthYear}`;
      case "tv":
        return `Watched in ${monthYear}`;
      case "music":
        return `Listened in ${monthYear}`;
      default:
        return `Added in ${monthYear}`;
    }
  };

  // Function to format the category name for display
  const formatCategoryName = (name) => {
    // Handle specific categories differently if needed
    if (name.toLowerCase() === "tv") {
      return "TV"; // All uppercase for TV
    }
    // Capitalize first letter for other categories
    return name.charAt(0).toUpperCase() + name.toLowerCase().slice(1);
  };

  // Get possessive form of name
  const getPossessiveName = (name) => {
    if (!name) return "";
    return name + (name.endsWith("s") ? "'" : "'s");
  };

  // Get the appropriate verb for completed items based on category
  const getCompletedVerbForCategory = (category) => {
    switch (category.toLowerCase()) {
      case "tv":
        return "Watched";
      case "books":
        return "Read";
      case "podcasts":
        return "Listened";
      case "music":
        return "Listened";
      default:
        return "Completed";
    }
  };

  // Get favorites entries (entries with rating of 5, excluding artists and shows)
  const favoriteEntries = entries.filter((entry) => {
    const rating =
      typeof entry.rating === "string"
        ? parseFloat(entry.rating)
        : entry.rating;

    // First check if it's a 5-star rating
    if (rating !== 5) {
      return false;
    }

    // Then exclude artist entries for music category
    if (categoryName.toLowerCase() === "music" && entry.format === "artist") {
      return false;
    }

    // Also exclude show entries for podcasts category
    if (categoryName.toLowerCase() === "podcasts" && entry.format === "show") {
      return false;
    }

    return true;
  });

  // Check if we have any favorites to display
  const hasFavorites = favoriteEntries.length > 0;

  // Get artist entries (entries where format is 'artist' - for music category)
  const artistEntries = entries.filter((entry) => entry.format === "artist");

  // Check if we have any artists to display and if this is the music category
  const hasArtists =
    artistEntries.length > 0 && categoryName.toLowerCase() === "music";

  // Get show entries (entries where format is 'show' - for podcasts category)
  const showEntries = entries.filter((entry) => entry.format === "show");

  // Check if we have any shows to display and if this is the podcasts category
  const hasShows =
    showEntries.length > 0 && categoryName.toLowerCase() === "podcasts";

  // Add CSS for artists gallery similar to favorites gallery
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .gallery-container {
        margin: 0 -20px;
        width: calc(100% + 40px);
        overflow-x: auto;
        overflow-y: hidden;
        cursor: grab;
        user-select: none;
        -webkit-overflow-scrolling: touch;
      }
      .gallery-wrapper {
        padding-left: 20px;
        padding-right: 5px;
        display: flex;
        gap: 10px;
      }
    `;
    document.head.appendChild(styleSheet);

    const containers = document.querySelectorAll(".gallery-container");

    containers.forEach((container) => {
      let pos = { left: 0, x: 0 };

      const mouseDownHandler = function (e) {
        container.style.cursor = "grabbing";

        pos = {
          left: container.scrollLeft,
          x: e.clientX,
        };

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
      };

      const mouseMoveHandler = function (e) {
        // Calculate the distance moved
        const dx = e.clientX - pos.x;

        // Update scroll position - note we add dx instead of subtracting
        // This makes the content follow the mouse movement direction
        container.scrollLeft = pos.left - dx;
      };

      const mouseUpHandler = function () {
        container.style.cursor = "grab";

        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };

      // Add the event listeners
      container.addEventListener("mousedown", mouseDownHandler);

      // Add shift + wheel support
      container.addEventListener(
        "wheel",
        (e) => {
          if (e.shiftKey) {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
          }
        },
        { passive: false }
      );
    });

    return () => {
      document.head.removeChild(styleSheet);
      const containers = document.querySelectorAll(".gallery-container");
      containers.forEach((container) => {
        container.removeEventListener("mousedown", () => {});
        container.removeEventListener("wheel", () => {});
      });
    };
  }, []);

  // Add an effect to detect screen width
  useEffect(() => {
    // Function to check if desktop width
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    // Check immediately
    checkIfDesktop();

    // Add resize listener
    window.addEventListener("resize", checkIfDesktop);

    // Clean up
    return () => window.removeEventListener("resize", checkIfDesktop);
  }, []);

  // Calculate content width and margins based on screen size
  const contentStyle = {
    paddingTop: "65px",
    paddingLeft: "20px",
    paddingRight: "20px",
    paddingBottom: "100px",
  };

  // Helper function to handle image load
  const handleImageLoad = (imageId) => {
    setLoadedImages((prev) => new Set(prev).add(imageId));
  };

  return (
    <>
      {/* Top safe area */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "env(safe-area-inset-top, 0px)",
          backgroundColor: "white",
          zIndex: 999,
        }}
      />

      {/* Main container - always maintain desktop layout */}
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "white",
          display: "flex",
          justifyContent: "center",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "375px",
            color: "#111",
            position: "relative",
            paddingTop: "env(safe-area-inset-top, 0px)",
            fontFamily:
              "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
            overflowX: "hidden",
          }}
        >
          {/* Content wrapper */}
          <div
            style={{
              width: "100%",
              paddingLeft: "20px",
              paddingRight: "20px",
              paddingTop: "20px",
              paddingBottom: "100px",
            }}
          >
          {/* Title */}
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              fontFamily:
                "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
              color: "#111",
              margin: "10px 0 20px 0",
              textAlign: "left",
            }}
          >
            {userData ? `${getPossessiveName(userData.fullName || userData.username)} ${formatCategoryName(categoryName)}` : formatCategoryName(categoryName)}
          </h1>

          {hasFetched && entries.length === 0 ? (
            <p
              style={{
                fontSize: "16px",
                color: "#111",
                opacity: 0.6,
                textAlign: "center",
                fontFamily:
                  "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              No {categoryName} archived yet...
            </p>
          ) : (
            <div style={{ width: "100%" }}>
              {/* Only show sections when we have entries */}
              {entries.length > 0 && (
                <>
                  {/* Favorites Section if exists */}
                  {hasFavorites && (
                    <div style={{ marginBottom: "30px" }}>
                      <h2
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          fontFamily:
                            "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                          color: "#111",
                          margin: "20px 0 5px 0",
                        }}
                      >
                        Favourites
                      </h2>

                      <p
                        style={{
                          fontSize: "12px",
                          opacity: "0.6",
                          color: "#111",
                          fontFamily:
                            "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                          margin: "0 0 15px 0",
                        }}
                      >
                        Archives with a 5-star rating
                      </p>

                      {/* Horizontal scrolling gallery with custom class */}
                      <div className="gallery-container hide-scrollbar">
                        <div className="gallery-wrapper">
                          {favoriteEntries.map((entry) => (
                            <div
                              key={`favorite-gallery-${entry.id}`}
                              style={{
                                position: "relative",
                                minWidth: "160px",
                                height: "220px",
                                borderRadius: "8px",
                                overflow: "hidden",
                                flexShrink: 0,
                                backgroundColor: "rgba(0, 0, 0, 0.05)", // Light gray loading background
                              }}
                            >
                              {/* Show loading state until image loads */}
                              {!loadedImages.has(entry.id) &&
                                entry.thumbnailUrl && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      width: "100%",
                                      height: "100%",
                                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                                    }}
                                  />
                                )}

                              {/* Background image with load handler */}
                              <div
                                style={{
                                  position: "absolute",
                                  width: "100%",
                                  height: "100%",
                                  backgroundImage: entry.thumbnailUrl
                                    ? `url(${entry.thumbnailUrl})`
                                    : "none",
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                  backgroundColor: entry.thumbnailUrl
                                    ? "transparent"
                                    : "rgba(0, 0, 0, 0.1)",
                                  opacity: loadedImages.has(entry.id) ? 1 : 0,
                                  transition: "opacity 0.3s ease",
                                }}
                                onLoad={() => handleImageLoad(entry.id)}
                              />

                              {/* Gradient overlay for text visibility */}
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: "33%",
                                  background:
                                    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0) 100%)",
                                  zIndex: 1,
                                }}
                              />

                              {/* Text overlay */}
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  padding: "10px",
                                  zIndex: 2,
                                }}
                              >
                                <h4
                                  style={{
                                    fontSize: "14px",
                                    margin: "0 0 1px 0",
                                    fontFamily:
                                      "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                                    fontWeight: "500",
                                    color: "white",
                                    textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
                                    lineHeight: "1.2",
                                    display: "-webkit-box",
                                    WebkitLineClamp: "2",
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {entry.title || "Untitled Entry"}
                                </h4>

                                <p
                                  style={{
                                    fontSize: "12px",
                                    margin: "0",
                                    fontFamily:
                                      "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                                    color: "white",
                                    opacity: "0.9",
                                    textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
                                    lineHeight: "1.2",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {entry.creator || "Unknown Creator"}
                                </p>
                              </div>
                            </div>
                          ))}
                          {/* Add an empty spacer div at the end */}
                          <div
                            style={{ minWidth: "20px", flexShrink: 0 }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Artists Section if exists */}
                  {hasArtists && (
                    <div style={{ marginBottom: "30px" }}>
                      <h2
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          fontFamily:
                            "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                          color: "#111",
                          margin: "20px 0 7px 0",
                        }}
                      >
                        Artists
                      </h2>

                      {/* Horizontal scrolling gallery for artists */}
                      <div className="gallery-container hide-scrollbar">
                        <div className="gallery-wrapper">
                          {artistEntries.map((entry) => (
                            <div
                              key={`artist-gallery-${entry.id}`}
                              style={{
                                minWidth: "140px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                flexShrink: 0,
                                padding: "5px 0", // Minimal vertical padding
                              }}
                            >
                              {/* Circular artist image - simple implementation */}
                              <img
                                src={entry.thumbnailUrl || ""}
                                alt={entry.title || "Artist"}
                                style={{
                                  width: "130px",
                                  height: "130px",
                                  borderRadius: "50%", // Perfect circle
                                  objectFit: "cover", // Maintains aspect ratio while filling
                                  objectPosition: "center", // Centers the image
                                  marginBottom: "4px", // Small gap between image and text
                                  opacity: loadedImages.has(entry.id) ? 1 : 0,
                                  transition: "opacity 0.3s ease",
                                  backgroundColor: "rgba(0, 0, 0, 0.05)", // Light loading background
                                }}
                                onLoad={() => handleImageLoad(entry.id)}
                                onError={(e) => {
                                  // Fallback for missing images
                                  e.target.onerror = null;
                                  e.target.style.backgroundColor =
                                    "rgba(0, 0, 0, 0.1)";
                                }}
                              />

                              {/* Simple text below the image */}
                              <h4
                                style={{
                                  fontSize: "15px",
                                  margin: "6px 0 1px 0",
                                  padding: "0 2px",
                                  fontFamily:
                                    "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                                  fontWeight: "500",
                                  color: "#111",
                                  lineHeight: "1.2",
                                  textAlign: "center",
                                  width: "100%",
                                }}
                              >
                                {entry.title || "Untitled Artist"}
                              </h4>

                              {entry.genre && (
                                <p
                                  style={{
                                    fontSize: "12px",
                                    margin: "0",
                                    padding: "0 2px",
                                    fontFamily:
                                      "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                                    color: "#111",
                                    opacity: "0.6",
                                    lineHeight: "1.2",
                                    textAlign: "center",
                                    width: "100%",
                                  }}
                                >
                                  {entry.genre}
                                </p>
                              )}
                            </div>
                          ))}
                          {/* Add an empty spacer div at the end */}
                          <div
                            style={{ minWidth: "20px", flexShrink: 0 }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shows Section if exists */}
                  {hasShows && (
                    <div style={{ marginBottom: "30px" }}>
                      <h2
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          fontFamily:
                            "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                          color: "#111",
                          margin: "20px 0 7px 0",
                        }}
                      >
                        Shows
                      </h2>

                      {/* Horizontal scrolling gallery for shows */}
                      <div className="gallery-container hide-scrollbar">
                        <div className="gallery-wrapper">
                          {showEntries.map((entry) => (
                            <div
                              key={`show-gallery-${entry.id}`}
                              style={{
                                minWidth: "140px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                flexShrink: 0,
                                padding: "5px 0", // Minimal vertical padding
                              }}
                            >
                              {/* Circular show image - similar to artist implementation */}
                              <img
                                src={entry.thumbnailUrl || ""}
                                alt={entry.title || "Show"}
                                style={{
                                  width: "130px",
                                  height: "130px",
                                  borderRadius: "50%", // Perfect circle
                                  objectFit: "cover", // Maintains aspect ratio while filling
                                  objectPosition: "center", // Centers the image
                                  marginBottom: "4px", // Small gap between image and text
                                  opacity: loadedImages.has(entry.id) ? 1 : 0,
                                  transition: "opacity 0.3s ease",
                                  backgroundColor: "rgba(0, 0, 0, 0.05)", // Light loading background
                                }}
                                onLoad={() => handleImageLoad(entry.id)}
                                onError={(e) => {
                                  // Fallback for missing images
                                  e.target.onerror = null;
                                  e.target.style.backgroundColor =
                                    "rgba(0, 0, 0, 0.1)";
                                }}
                              />

                              {/* Simple text below the image */}
                              <h4
                                style={{
                                  fontSize: "15px",
                                  margin: "6px 0 1px 0",
                                  padding: "0 2px",
                                  fontFamily:
                                    "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                                  fontWeight: "500",
                                  color: "#111",
                                  lineHeight: "1.2",
                                  textAlign: "center",
                                  width: "100%",
                                }}
                              >
                                {entry.title || "Untitled Show"}
                              </h4>

                              {entry.genre && (
                                <p
                                  style={{
                                    fontSize: "12px",
                                    margin: "0",
                                    padding: "0 2px",
                                    fontFamily:
                                      "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                                    color: "#111",
                                    opacity: "0.6",
                                    lineHeight: "1.2",
                                    textAlign: "center",
                                    width: "100%",
                                  }}
                                >
                                  {entry.genre}
                                </p>
                              )}
                            </div>
                          ))}
                          {/* Add an empty spacer div at the end */}
                          <div
                            style={{ minWidth: "20px", flexShrink: 0 }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Only show "Watched"/"Listened" section when we have entries */}
                  {entries.length > 0 && (
                    <>
                      <h2
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          fontFamily:
                            "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                          color: "#111",
                          margin: "20px 0 10px 0",
                        }}
                      >
                        {getCompletedVerbForCategory(categoryName)}
                      </h2>
                      {/* Chronological entries by month - filter out artist entries for music category */}
                      {Object.keys(groupedEntries).map((monthYear) => (
                        <div key={monthYear} style={{ marginBottom: "25px" }}>
                          {/* Month heading - smaller */}
                          <h3
                            style={{
                              fontSize: "16px",
                              color: "rgba(17, 17, 17, 0.6)",
                              marginBottom: "6px",
                              fontFamily:
                                "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontWeight: "bold",
                            }}
                          >
                            {monthYear}
                          </h3>

                          {/* Full-width divider line below month heading */}
                          <div
                            style={{
                              height: "1px",
                              backgroundColor: "rgba(17, 17, 17, 0.1)",
                              width: "100%",
                              marginBottom: "2px", // Add space after the divider
                            }}
                          />

                          {/* Entries list with divider lines */}
                          <div>
                            {groupedEntries[monthYear].map((entry, index) => (
                              <div key={entry.id}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    paddingTop: "4px",
                                    paddingBottom: "4px",
                                    position: "relative",
                                  }}
                                >
                                  {/* Thumbnail/Cover - smaller */}
                                  <div
                                    style={{
                                      marginRight: "12px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {entry.thumbnailUrl ? (
                                      <div
                                        style={{
                                          position: "relative",
                                          width: "45px",
                                          height: "45px",
                                          backgroundColor:
                                            "rgba(0, 0, 0, 0.05)", // Light loading background
                                          borderRadius: "4px",
                                        }}
                                      >
                                        <img
                                          src={entry.thumbnailUrl}
                                          alt={entry.title || "Entry thumbnail"}
                                          style={{
                                            width: "45px",
                                            height: "45px",
                                            objectFit: "cover",
                                            borderRadius: "4px",
                                            opacity: loadedImages.has(entry.id)
                                              ? 1
                                              : 0,
                                            transition: "opacity 0.3s ease",
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                          }}
                                          onLoad={() =>
                                            handleImageLoad(entry.id)
                                          }
                                        />
                                      </div>
                                    ) : (
                                      <div
                                        style={{
                                          width: "45px",
                                          height: "45px",
                                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                                          borderRadius: "4px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: "16px",
                                            color: "#111",
                                          }}
                                        >
                                          ?
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Entry Details - Title and Creator in SF Pro with rating next to creator */}
                                  <div style={{ flex: "1" }}>
                                    <h4
                                      style={{
                                        fontSize: "14px",
                                        margin: "0 0 1px 0",
                                        fontFamily:
                                          "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                                        fontWeight: "500",
                                        color: "#111",
                                        lineHeight: "1.2",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {entry.title || "Untitled Entry"}
                                    </h4>

                                    <div
                                      style={{
                                        fontSize: "12px",
                                        margin: "0",
                                        opacity: "0.6",
                                        fontFamily:
                                          "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                                        lineHeight: "1.2",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {/* Creator name and rating on same line when possible */}
                                      <span>
                                        {entry.creator || "Unknown Creator"}
                                      </span>
                                      {formatRating(entry.rating) && (
                                        <span
                                          style={{
                                            marginLeft: "8px",
                                            fontSize: "12px",
                                            opacity: "1",
                                            color: "#111",
                                          }}
                                        >
                                          <span
                                            style={{
                                              marginRight: "2px",
                                              fontSize: "11px",
                                            }}
                                          >
                                            ★
                                          </span>
                                          {formatRating(entry.rating)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Remove the separate rating section */}
                                  <div style={{ marginLeft: "auto" }} />
                                </div>

                                {/* Add divider line after each entry except the last one - 
                                    padded on left to align with content after thumbnail */}
                                {index <
                                  groupedEntries[monthYear].length - 1 && (
                                  <div
                                    style={{
                                      height: "1px",
                                      backgroundColor: "rgba(17, 17, 17, 0.1)",
                                      width: "calc(100% - 60px)", // Adjust width based on thumbnail (50px) + right margin (12px)
                                      marginLeft: "58px", // Equal to thumbnail width (50px) + right margin (12px)
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Add download button fixed to bottom of screen */}
      {showDownloadButton && (
        <div
          id="download-footer"
          style={{
            position: "fixed",
            bottom: 12,
            left: 0,
            width: "100%",
            padding: "15px 0",
            textAlign: "center",
            zIndex: 1000,
            backgroundColor: "transparent",
          }}
        >
          <a
            href="https://apps.apple.com/gb/app/archive-be-curious/id6738609084"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            <button
              style={{
                backgroundColor: "#111", // Dark button on white background
                color: "white",
                border: "none",
                borderRadius: "30px",
                padding: "10px 20px",
                fontSize: "18px",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontFamily:
                  "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 500,
              }}
            >
              <img
                src="/apple-logo.svg"
                alt="Apple logo"
                style={{
                  height: "16px",
                  filter: "invert(1)", // Invert the logo to white
                }}
              />
              {buttonText}
            </button>
          </a>
        </div>
      )}

      {/* Bottom safe area */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "env(safe-area-inset-bottom, 0px)",
          backgroundColor: "white",
          zIndex: 999,
        }}
      />
    </>
  );
};

export default CategoryPage;
