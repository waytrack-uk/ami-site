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
  const { userId } = useParams();
  const navigate = useNavigate(); // Move this outside of CategoryWidget
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [categorizedEntries, setCategorizedEntries] = useState({
    tv: [],
    music: [],
    podcasts: [],
    books: [],
  });

  useEffect(() => {
    async function fetchUserAndEntries() {
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users_v3", userId));

        if (!userDoc.exists()) {
          setStatus("User not found");
          return;
        }

        const userData = {
          id: userDoc.id,
          ...userDoc.data(),
        };
        setUser(userData);

        // Fetch user's entries
        const entriesQuery = query(
          collection(db, "archives_v3"),
          where("userId", "==", userId)
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
            (entry) => entry.category?.toLowerCase() === "podcasts"
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

    if (userId) {
      fetchUserAndEntries();
    }
  }, [userId]);

  // Widget component to display a category of entries
  const CategoryWidget = ({ title, entries, backgroundColor }) => {
    // Remove useNavigate from here

    // Function to navigate to category page
    const handleCategoryClick = () => {
      navigate(`/category/${title.toLowerCase()}`);
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
          return {
            backgroundColor: backgroundColor,
          };
      }
    };

    return (
      <div
        className="font-serif"
        onClick={handleCategoryClick}
        style={{
          ...getGradientStyle(title),
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
          minHeight: "200px", // Ensures widgets maintain minimum size
          fontFamily: "Baskerville, serif",
          cursor: "pointer", // Add cursor pointer for better UX
          transition: "transform 0.2s ease", // Add transition for hover effect
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <h2
          className="font-serif font-bold"
          style={{
            color: "white",
            fontSize: "28px",
            marginBottom: "15px",
            fontFamily: "Baskerville, serif",
          }}
        >
          {title}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", // Reduced from 100px to 80px
            gap: "10px",
            minHeight: "120px", // Ensures content area has minimum height
          }}
        >
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div key={entry.id}>
                {entry.thumbnailUrl && (
                  <img
                    src={entry.thumbnailUrl}
                    alt={entry.title}
                    style={{
                      width: "100%",
                      aspectRatio: "2/3",
                      objectFit: "cover",
                      borderRadius: "8px",
                      maxHeight: "120px", // Limit the height of thumbnails
                    }}
                  />
                )}
              </div>
            ))
          ) : (
            <p
              className="text-white col-span-full font-serif"
              style={{ fontFamily: "Baskerville, serif" }}
            >
              No {title.toLowerCase()} entries yet
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="font-serif"
      style={{
        margin: "0 auto",
        maxWidth: "800px",
        padding: "20px",
        fontFamily: "Baskerville, serif",
        position: "relative", // Added for logo positioning
      }}
    >
      {/* Logo in top right corner */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: "10",
        }}
      >
        <img
          src="/logo.png"
          alt="Archive Logo"
          style={{
            height: "40px",
            width: "auto",
          }}
        />
      </div>

      {status ? (
        <p className="font-serif" style={{ fontFamily: "Baskerville, serif" }}>
          {status}
        </p>
      ) : (
        <>
          {user && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                {user.userAvatarUrl && (
                  <img
                    src={user.userAvatarUrl}
                    alt={`${user.username}'s avatar`}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      marginRight: "15px",
                    }}
                  />
                )}
                <h1
                  className="font-serif font-bold"
                  style={{
                    fontSize: "32px",
                    margin: 0,
                    fontFamily: "Baskerville, serif",
                  }}
                >
                  {user.username}
                </h1>
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
    </div>
  );
};

export default UserProfile;
