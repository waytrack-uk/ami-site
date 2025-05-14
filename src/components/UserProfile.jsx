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
            (entry) => entry.category?.toLowerCase() === "tv"
          ),
          music: entriesData.filter(
            (entry) => entry.category?.toLowerCase() === "music"
          ),
          podcasts: entriesData.filter(
            (entry) => entry.category?.toLowerCase() === "podcast"
          ),
          books: entriesData.filter(
            (entry) => entry.category?.toLowerCase() === "books"
          ),
        };

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

  // Widget component to display a category of entries
  const CategoryWidget = ({ title, entries }) => {
    // Function to navigate to category page with username
    const handleCategoryClick = () => {
      navigate(`/category/${title.toLowerCase()}`, {
        state: { username: user.username },
      });
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

    return (
      <div
        className="category-widget"
        onClick={handleCategoryClick}
        style={getGradientStyle(title)}
      >
        <h2 className="category-title">{title}</h2>
        <div className="image-grid">
          {entries.length > 0
            ? entries.map((entry) => (
                <div key={entry.id}>
                  {entry.thumbnailUrl && (
                    <img
                      src={entry.thumbnailUrl}
                      alt={entry.title}
                      className="entry-image"
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
                <CategoryWidget title="TV" entries={categorizedEntries.tv} />
                <CategoryWidget
                  title="Music"
                  entries={categorizedEntries.music}
                />
                <CategoryWidget
                  title="Podcasts"
                  entries={categorizedEntries.podcasts}
                />
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
            bottom: 30,
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
                borderRadius: "25px",
                padding: "12px 30px",
                fontSize: "25px",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <img
                src="/apple-logo.svg"
                alt="Apple logo"
                style={{
                  height: "22px",
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
