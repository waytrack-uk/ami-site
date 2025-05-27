// src/components/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [categorizedEntries, setCategorizedEntries] = useState({
    tv: [],
    music: [],
    podcasts: [],
    books: [],
  });
  const [showDownloadButton, setShowDownloadButton] = useState(true);
  const [buttonText, setButtonText] = useState("Join Archive");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // New state to track if we have basic data (to show widgets immediately)
  const [hasBasicData, setHasBasicData] = useState(false);

  // TESTING: Set to true to force loading state with placeholders
  const FORCE_LOADING_STATE = false;

  // Update button text when user data is available
  useEffect(() => {
    if (user && user.fullName) {
      setButtonText(`Join ${user.fullName} on Archive`);
    } else if (user && user.username) {
      setButtonText(`Join ${user.username} on Archive`);
    } else {
      setButtonText("Join Archive");
    }
  }, [user]);

  useEffect(() => {
    async function fetchUserAndEntries() {
      try {
        // Get all users and find a match regardless of case
        const usersRef = collection(db, "users_v3");
        const usersSnapshot = await getDocs(usersRef);

        // Find user with matching username (case-insensitive)
        let foundUser = null;
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (
            (data.username &&
              data.username.toLowerCase() === username.toLowerCase()) ||
            (data.name && data.name.toLowerCase() === username.toLowerCase())
          ) {
            foundUser = {
              id: doc.id,
              ...data,
            };
          }
        });

        if (!foundUser) {
          return;
        }

        setUser(foundUser);
        // Show widgets immediately after user is found
        setHasBasicData(true);

        // TESTING: Skip data loading if in forced loading state
        if (FORCE_LOADING_STATE) {
          setCategorizedEntries({
            tv: [],
            music: [],
            podcasts: [],
            books: [],
          });
          return;
        }

        // Fetch user's entries
        const entriesQuery = query(
          collection(db, "archives_v3"),
          where("userId", "==", foundUser.id)
        );

        const entriesSnapshot = await getDocs(entriesQuery);

        if (entriesSnapshot.empty) {
          setEntries([]);
          // Keep empty categorized entries for placeholder display
          setCategorizedEntries({
            tv: [],
            music: [],
            podcasts: [],
            books: [],
          });
          return;
        }

        const entriesData = [];
        entriesSnapshot.forEach((doc) => {
          entriesData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setEntries(entriesData);

        // Categorize entries
        const categorized = {
          tv: entriesData.filter(
            (entry) =>
              entry.category?.toLowerCase() === "tv" &&
              (entry.status === "completed" ||
                !entry.status ||
                entry.status === "" ||
                entry.status === null)
          ),
          music: entriesData.filter(
            (entry) =>
              entry.category?.toLowerCase() === "music" &&
              (entry.status === "completed" ||
                !entry.status ||
                entry.status === "" ||
                entry.status === null)
          ),
          podcasts: entriesData.filter(
            (entry) =>
              entry.category?.toLowerCase() === "podcast" &&
              (entry.status === "completed" ||
                !entry.status ||
                entry.status === "" ||
                entry.status === null)
          ),
          books: entriesData.filter(
            (entry) =>
              entry.category?.toLowerCase() === "book" &&
              (entry.status === "completed" ||
                !entry.status ||
                entry.status === "" ||
                entry.status === null)
          ),
        };

        // Sort each category by date (newest first)
        Object.keys(categorized).forEach((category) => {
          categorized[category].sort((a, b) => {
            let dateA, dateB;

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
        });

        setCategorizedEntries(categorized);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    if (username) {
      fetchUserAndEntries();
    }

    setShowDownloadButton(true);
  }, [username]);

  // Background and font loading effects
  useEffect(() => {
    document.documentElement.style.backgroundColor = "#f2e8d5";
    document.body.style.backgroundColor = "#f2e8d5";

    const libreBaskerville = document.createElement("link");
    libreBaskerville.rel = "stylesheet";
    libreBaskerville.href =
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap";
    document.head.appendChild(libreBaskerville);

    const sfPro = document.createElement("link");
    sfPro.rel = "stylesheet";
    sfPro.href = "https://fonts.cdnfonts.com/css/sf-pro-display";
    document.head.appendChild(sfPro);

    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#f2e8d5";
    document.head.appendChild(meta);

    return () => {
      if (meta.parentNode) {
        document.head.removeChild(meta);
      }
      if (libreBaskerville.parentNode) {
        document.head.removeChild(libreBaskerville);
      }
      if (sfPro.parentNode) {
        document.head.removeChild(sfPro);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Placeholder component for loading thumbnails
  const PlaceholderBox = ({ isSquare = false }) => (
    <div
      style={{
        width: isSquare ? "55px" : "65px",
        height: isSquare ? "55px" : "95px",
        backgroundColor: "rgba(255, 255, 255, 0.3)", // Semi-transparent white
        borderRadius: "8px",
        animation: "pulse 1.5s ease-in-out infinite alternate",
      }}
    />
  );

  // First, let's create a ProfilePlaceholder component near the PlaceholderBox component
  const ProfilePlaceholder = () => (
    <div
      style={{
        width: "100px",
        height: "100px",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: "50%",
        animation: "pulse 1.5s ease-in-out infinite alternate",
      }}
    />
  );

  // Add CSS animation for pulse effect
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 0.3; }
        100% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Widget component with placeholder support
  const CategoryWidget = ({ title, entries, compact = false }) => {
    const handleCategoryClick = () => {
      navigate(`/${user.username}/${title.toLowerCase()}`);
    };

    const getGradientStyle = (title) => {
      switch (title.toLowerCase()) {
        case "books":
          return {
            background:
              "linear-gradient(to bottom right, #d1a673, rgba(184, 133, 89, 1), rgba(158, 107, 64, 1))",
          };
        case "tv":
          return {
            background:
              "linear-gradient(to bottom right, #14667a, rgba(15, 71, 92, 1), rgba(10, 43, 61, 1))",
          };
        case "music":
          return {
            background:
              "linear-gradient(to bottom right, #ff5966, rgba(217, 64, 77, 1), rgba(179, 38, 51, 1))",
          };
        case "podcasts":
          return {
            background:
              "linear-gradient(to bottom right, #cc73f2, rgba(166, 77, 204, 1), rgba(128, 38, 166, 1))",
          };
        default:
          return {};
      }
    };

    const isSquareGrid = compact;

    const widgetStyle = {
      ...getGradientStyle(title),
      borderRadius: "16px",
      padding: "12px",
      marginBottom: "20px",
      height: "170px",
      cursor: "pointer",
      transition: "transform 0.2s ease",
      display: "flex",
      flexDirection: "column",
    };

    const handleMouseOver = (e) => {
      e.currentTarget.style.transform = "scale(1.02)";
    };

    const handleMouseOut = (e) => {
      e.currentTarget.style.transform = "scale(1)";
    };

    const gridStyle = {
      display: "grid",
      gridTemplateColumns: isMobile
        ? isSquareGrid
          ? "repeat(2, 65px)"
          : "repeat(4, 75px)"
        : isSquareGrid
        ? "repeat(7, 60px)"
        : "repeat(13, 70px)",
      gridTemplateRows: isSquareGrid ? "repeat(2, 1fr)" : "1fr",
      gridAutoRows: "1fr",
      gridAutoFlow: isSquareGrid ? "row" : "column",
      columnGap: "0px",
      rowGap: isSquareGrid ? "3px" : "4px",
      flex: "1",
      overflow: "hidden",
      marginTop: isSquareGrid ? "2px" : "5px",
      marginLeft: isMobile ? "0" : "18px",
      justifyContent: isMobile ? "center" : "start",
    };

    const displayLimit = isMobile ? 4 : 13;

    const completedEntries = entries.filter(
      (entry) =>
        entry.status === "completed" ||
        !entry.status ||
        entry.status === "" ||
        entry.status === null
    );

    // Show placeholders if we have no entries yet but have basic data
    const showPlaceholders = completedEntries.length === 0 && hasBasicData;
    const placeholderCount = isMobile ? 4 : isSquareGrid ? 14 : 13;

    return (
      <div
        className="category-widget"
        onClick={handleCategoryClick}
        style={widgetStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        <h2
          style={{
            color: "white",
            fontSize: "20px",
            marginBottom: isSquareGrid ? "0px" : "0px",
            marginTop: "0",
            fontFamily: "'Libre Baskerville', serif",
            fontWeight: "bold",
            letterSpacing: "0.03em",
            textRendering: "optimizeLegibility",
          }}
        >
          {title}
        </h2>
        <div style={gridStyle}>
          {showPlaceholders
            ? // Show placeholder boxes while loading
              Array(placeholderCount)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <PlaceholderBox isSquare={isSquareGrid} />
                  </div>
                ))
            : // Show actual entries
            completedEntries.length > 0
            ? completedEntries.slice(0, displayLimit).map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: isSquareGrid ? "0" : "0px",
                  }}
                >
                  {entry.thumbnailUrl && (
                    <img
                      src={entry.thumbnailUrl}
                      alt={entry.title}
                      style={{
                        width: isSquareGrid ? "55px" : "65px",
                        height: isSquareGrid ? "55px" : "95px",
                        aspectRatio: isSquareGrid ? "1/1" : "2/3",
                        objectFit: "cover",
                        borderRadius:
                          (entry.format === "artist" &&
                            title.toLowerCase() === "music") ||
                          (entry.format === "show" &&
                            title.toLowerCase() === "podcasts")
                            ? "50%"
                            : "8px",
                      }}
                    />
                  )}
                </div>
              ))
            : null}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto p-5 md:p-[100px] pb-[180px] min-h-screen bg-[#f2e8d5] font-['Libre_Baskerville',_serif]">
      {user && hasBasicData && (
        <>
          {/* Profile layout with avatar above and username below */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
              marginBottom: "30px",
              marginTop: "20px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div>
              {FORCE_LOADING_STATE || !user.avatarUrl ? (
                <ProfilePlaceholder />
              ) : (
                <img
                  src={user.avatarUrl}
                  alt={`${user.username}'s avatar`}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>

            <div>
              <h1
                style={{
                  fontSize: "24px",
                  margin: "0",
                  fontFamily: "'Libre Baskerville', serif",
                  fontWeight: 1000,
                  letterSpacing: "0.02em",
                  textRendering: "optimizeLegibility",
                }}
              >
                @{user.username}
              </h1>
            </div>
          </div>

          <div style={{ marginTop: "30px" }}>
            {/* TV at top - full width */}
            <CategoryWidget title="TV" entries={categorizedEntries.tv} />

            {/* Music and Podcasts side by side */}
            <div
              style={{
                display: "flex",
                gap: "15px",
                marginBottom: "0",
              }}
            >
              <div style={{ flex: "1" }}>
                <CategoryWidget
                  title="Music"
                  entries={categorizedEntries.music}
                  compact={true}
                />
              </div>

              <div style={{ flex: "1" }}>
                <CategoryWidget
                  title="Podcasts"
                  entries={categorizedEntries.podcasts}
                  compact={true}
                />
              </div>
            </div>

            {/* Books at bottom - full width */}
            <CategoryWidget title="Books" entries={categorizedEntries.books} />
          </div>
        </>
      )}

      <div />

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
                backgroundColor: "white",
                color: "#111",
                border: "none",
                borderRadius: "20px",
                padding: "10px 20px",
                fontSize: "18px",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontFamily:
                  "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                fontWeight: 500,
              }}
            >
              <img
                src="/apple-logo.svg"
                alt="Apple logo"
                style={{
                  height: "16px",
                }}
              />
              {buttonText}
            </button>
          </a>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
