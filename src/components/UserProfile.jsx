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
import "./UserProfile.css"; // Import the CSS file

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

    // This technique prevents the black overscroll in iOS Safari
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#f2e8d5";
    document.head.appendChild(meta);

    return () => {
      if (meta.parentNode) {
        document.head.removeChild(meta);
      }
    };
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
              "linear-gradient(to bottom right, rgba(209, 166, 115, 1), rgba(184, 133, 89, 1), rgba(158, 107, 64, 1))",
          };
        case "tv":
          return {
            background:
              "linear-gradient(to bottom right, rgba(20, 102, 122, 1), rgba(15, 71, 92, 1), rgba(10, 43, 61, 1))",
          };
        case "music":
          return {
            background:
              "linear-gradient(to bottom right, rgba(255, 89, 102, 1), rgba(217, 64, 77, 1), rgba(179, 38, 51, 1))",
          };
        case "podcasts":
          return {
            background:
              "linear-gradient(to bottom right, rgba(204, 115, 242, 1), rgba(166, 77, 204, 1), rgba(128, 38, 166, 1))",
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
      padding: "15px",
      marginBottom: "20px",
      height: "180px",
      cursor: "pointer",
      transition: "transform 0.2s ease",
      display: "flex",
      flexDirection: "column",
    };

    // Create appropriate grid style based on widget type
    const gridStyle = {
      display: "grid",
      gridTemplateColumns: isSquareGrid
        ? "repeat(2, 1fr)" // 2x2 grid for Music/Podcasts
        : "repeat(4, 1fr)", // 4 horizontal items for TV/Books
      gridTemplateRows: isSquareGrid ? "repeat(2, 1fr)" : "1fr",
      gap: isSquareGrid ? "8px" : "10px", // Smaller gap for square grid
      flex: "1",
      overflow: "hidden",
    };

    // Limit entries to display
    const displayLimit = 4; // Show 4 items for all widgets

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
      >
        <h2
          className="category-title"
          style={{
            fontSize: "24px",
            marginBottom: "6px",
            marginTop: "0",
          }}
        >
          {title}
        </h2>
        <div className="image-grid" style={gridStyle}>
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
                  }}
                >
                  {entry.thumbnailUrl && (
                    <img
                      src={entry.thumbnailUrl}
                      alt={entry.title}
                      className="entry-image"
                      style={{
                        width: isSquareGrid ? "55px" : "100%",
                        height: isSquareGrid ? "55px" : "90px",
                        aspectRatio: isSquareGrid ? "1/1" : "2/3",
                        objectFit: "cover",
                        borderRadius: "8px",
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
    <div
      className="profile-container"
      style={{
        margin: "0 auto",
        maxWidth: "800px",
        padding: "20px",
        paddingBottom: "80px",
        minHeight: "100vh",
        backgroundColor: "#f2e8d5",
      }}
    >
      {status ? (
        <p>{status}</p>
      ) : (
        <>
          {user && (
            <>
              {/* Mobile-friendly flexbox layout with controllable gap */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px" /* ADJUST THIS VALUE to control spacing between avatar and username */,
                  marginBottom: "30px",
                  width: "100%",
                }}
              >
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                  <img
                    src={user.avatarUrl || "https://via.placeholder.com/60"}
                    alt={`${user.username}'s avatar`}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Username with font styling */}
                <div
                  style={{
                    flexGrow: 0,
                    maxWidth: "fit-content",
                  }}
                >
                  <h1
                    style={{
                      fontSize: "32px",
                      margin: "0",
                      fontFamily: "'Libre Baskerville', serif",
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      whiteSpace:
                        "nowrap" /* Prevents username from wrapping */,
                    }}
                  >
                    {user.username}
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
                    marginBottom: "0", // Remove extra margin since widgets have their own
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
              className="download-button" // Add this class to use our CSS
              style={{
                backgroundColor: "white",
                color: "#111",
                border: "none",
                borderRadius: "20px", // Reduced from 25px
                padding: "10px 20px", // Reduced from 12px 30px
                fontSize: "18px", // Reduced from 25px
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px", // Reduced from 8px
              }}
            >
              <img
                src="/apple-logo.svg"
                alt="Apple logo"
                style={{
                  height: "16px", // Reduced from 22px
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
