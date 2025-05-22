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
  const { username } = useParams(); // Use username from URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [categorizedEntries, setCategorizedEntries] = useState({
    tv: [],
    music: [],
    podcasts: [],
    books: [],
  });
  // Add state for download button
  const [showDownloadButton, setShowDownloadButton] = useState(true);
  // Add state for button text to handle async loading
  const [buttonText, setButtonText] = useState("Join Archive");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
          // Check all possible username fields and match case-insensitively
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
          setStatus("User not found");
          return;
        }

        setUser(foundUser);

        // Fetch user's entries
        const entriesQuery = query(
          collection(db, "archives_v3"),
          where("userId", "==", foundUser.id)
        );

        const entriesSnapshot = await getDocs(entriesQuery);

        if (entriesSnapshot.empty) {
          setStatus("");
          setEntries([]);
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
            // Try to use updatedAt, then fallback to createdAt
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
        });

        setCategorizedEntries(categorized);
        setStatus("");
      } catch (error) {
        console.error("Error fetching data:", error);
        setStatus("Error: " + error.message);
      }
    }

    if (username) {
      fetchUserAndEntries();
    }

    // Ensure download button appears
    setShowDownloadButton(true);
  }, [username]);

  // Add this inside the UserProfile component, next to your other useEffect hooks
  useEffect(() => {
    // Force the background color on all possible elements
    document.documentElement.style.backgroundColor = "#f2e8d5";
    document.body.style.backgroundColor = "#f2e8d5";

    // Load fonts programmatically
    const libreBaskerville = document.createElement("link");
    libreBaskerville.rel = "stylesheet";
    libreBaskerville.href =
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap";
    document.head.appendChild(libreBaskerville);

    const sfPro = document.createElement("link");
    sfPro.rel = "stylesheet";
    sfPro.href = "https://fonts.cdnfonts.com/css/sf-pro-display";
    document.head.appendChild(sfPro);

    // This technique prevents the black overscroll in iOS Safari
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

  // Add useEffect to handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Widget component to display a category of entries
  const CategoryWidget = ({ title, entries, compact = false }) => {
    // Function to navigate to category page with username
    const handleCategoryClick = () => {
      navigate(`/${user.username}/${title.toLowerCase()}`);
    };

    // Function to get gradient based on category title
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

    // Determine if this is a square grid (Music/Podcasts) or horizontal layout (TV/Books)
    const isSquareGrid = compact;

    // Set consistent heights for all widgets
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

    // Add hover style
    const handleMouseOver = (e) => {
      e.currentTarget.style.transform = "scale(1.02)";
    };

    const handleMouseOut = (e) => {
      e.currentTarget.style.transform = "scale(1)";
    };

    // Create appropriate grid style based on widget type
    const gridStyle = {
      display: "grid",
      gridTemplateColumns: isMobile
        ? isSquareGrid
          ? "repeat(2, 65px)"
          : "repeat(4, 75px)" // Mobile layout
        : isSquareGrid
        ? "repeat(7, 60px)"
        : "repeat(5, 70px)", // Desktop layout - larger & more columns
      gridTemplateRows: isSquareGrid ? "repeat(2, 1fr)" : "1fr",
      columnGap: "0px",
      rowGap: isSquareGrid ? "3px" : "4px",
      flex: "1",
      overflow: "hidden",
      marginTop: isSquareGrid ? "2px" : "5px",
      marginLeft: isMobile ? "0" : "18px",
      // Only apply justifyContent center on mobile
      justifyContent: isMobile ? "center" : "start",
    };

    // Limit entries to display
    const displayLimit = isMobile ? 4 : 20; // Show 4 items for all widgets

    // Filter for completed entries only (should already be filtered, but just to be sure)
    const completedEntries = entries.filter(
      (entry) =>
        entry.status === "completed" ||
        !entry.status ||
        entry.status === "" ||
        entry.status === null
    );

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
          {completedEntries.length > 0
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
      {status ? (
        <p>{status}</p>
      ) : (
        <>
          {user && (
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
                {/* Avatar - now above */}
                <div>
                  <img
                    src={user.avatarUrl || "https://via.placeholder.com/60"}
                    alt={`${user.username}'s avatar`}
                    style={{
                      width: "100px", // Increased size for better visibility
                      height: "100px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Username below */}
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
                  {/* Music on left - half width */}
                  <div style={{ flex: "1" }}>
                    <CategoryWidget
                      title="Music"
                      entries={categorizedEntries.music}
                      compact={true}
                    />
                  </div>

                  {/* Podcasts on right - half width */}
                  <div style={{ flex: "1" }}>
                    <CategoryWidget
                      title="Podcasts"
                      entries={categorizedEntries.podcasts}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Books at bottom - full width */}
                <CategoryWidget
                  title="Books"
                  entries={categorizedEntries.books}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Add a spacer div at the bottom */}
      <div style={{ height: "80px" }} />

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
