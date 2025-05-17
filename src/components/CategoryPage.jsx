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
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);

  // Function to get gradient based on category name
  const getGradientStyle = (category) => {
    switch (category.toLowerCase()) {
      case "books":
        return "linear-gradient(to bottom right, rgba(209, 166, 115, 1), rgba(184, 133, 89, 1), rgba(158, 107, 64, 1))";
      case "tv":
        return "linear-gradient(to bottom right, rgba(20, 102, 122, 1), rgba(15, 71, 92, 1), rgba(10, 43, 61, 1))";
      case "music":
        return "linear-gradient(to bottom right, rgba(255, 89, 102, 1), rgba(217, 64, 77, 1), rgba(179, 38, 51, 1))";
      case "podcasts":
        return "linear-gradient(to bottom right, rgba(204, 115, 242, 1), rgba(166, 77, 204, 1), rgba(128, 38, 166, 1))";
      default:
        return "linear-gradient(to bottom right, #333, #222, #111)";
    }
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
        // Get all users and find a match regardless of case
        const usersRef = collection(db, "users_v3");
        const usersSnapshot = await getDocs(usersRef);

        // Find user with matching username (case-insensitive)
        let foundUser = null;
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          // Check username match case-insensitively
          if (
            (data.username &&
              data.username.toLowerCase() === username.toLowerCase()) ||
            (data.name && data.name.toLowerCase() === username.toLowerCase())
          ) {
            foundUser = {
              id: doc.id,
              ...data,
            };
            setUserId(doc.id); // Set userId here to avoid duplicate fetches
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
    async function fetchCategoryEntries() {
      try {
        setLoading(true);

        // Normalize the category name for database query
        const normalizedCategoryName = normalizeCategoryName(categoryName);
        console.log(
          `Using normalized category name: ${normalizedCategoryName}`
        );

        // Use a simpler approach - get all entries and filter client-side
        let entriesQuery;

        if (userId) {
          // Just filter by category and userId
          entriesQuery = query(
            collection(db, "archives_v3"),
            where("category", "==", normalizedCategoryName),
            where("userId", "==", userId)
          );
          console.log(
            `Fetching all entries for category: ${normalizedCategoryName} and userId: ${userId}`
          );
        } else {
          // Just filter by category
          entriesQuery = query(
            collection(db, "archives_v3"),
            where("category", "==", normalizedCategoryName)
          );
        }

        const entriesSnapshot = await getDocs(entriesQuery);
        console.log(`Query returned ${entriesSnapshot.size} documents`);

        if (entriesSnapshot.empty) {
          setEntries([]);
          setLoading(false);
          return;
        }

        const entriesData = [];
        entriesSnapshot.forEach((doc) => {
          const data = doc.data();
          // Debug logging
          console.log(
            `Entry: ${doc.id}, Status: ${data.status}, Title: ${data.title}`
          );

          // Include if it's completed OR has no status
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

        console.log(`After filtering, we have ${entriesData.length} entries`);

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

        setEntries(entriesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching entries:", error);
        setLoading(false);
      }
    }

    fetchCategoryEntries();
  }, [categoryName, userId]);

  // Apply gradient to the entire body when component mounts
  useEffect(() => {
    // Get the gradient for this category
    const gradientBackground = getGradientStyle(categoryName);

    // Force all relevant elements to use our gradient
    document.documentElement.style.backgroundColor = "transparent";
    document.documentElement.style.background = gradientBackground;

    document.body.style.backgroundColor = "transparent";
    document.body.style.background = gradientBackground;
    document.body.style.backgroundAttachment = "fixed";

    // Find and remove any beige background that might be persisting
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (
        style.backgroundColor === "rgb(242, 232, 213)" ||
        style.backgroundColor === "#f2e8d5"
      ) {
        el.style.backgroundColor = "transparent";
      }
    });

    // Add some debugging to identify potential conflicts
    console.log("Applied gradient:", gradientBackground);
    console.log(
      "Current documentElement background:",
      window.getComputedStyle(document.documentElement).background
    );
    console.log(
      "Current body background:",
      window.getComputedStyle(document.body).background
    );

    // Add !important to make sure our styles take precedence
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      html, body {
        background: ${gradientBackground} !important;
        background-attachment: fixed !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Cleanup function
    return () => {
      document.documentElement.style.background = "";
      document.documentElement.style.backgroundColor = "";
      document.body.style.background = "";
      document.body.style.backgroundColor = "";
      if (styleEl.parentNode) {
        document.head.removeChild(styleEl);
      }
    };
  }, [categoryName]);

  // Group entries by month
  const groupEntriesByMonth = (entries) => {
    const grouped = {};

    entries.forEach((entry) => {
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

  // Get favorites entries (entries with rating of 5)
  const favoriteEntries = entries.filter((entry) => {
    const rating =
      typeof entry.rating === "string"
        ? parseFloat(entry.rating)
        : entry.rating;
    return rating === 5;
  });

  // Check if we have any favorites to display
  const hasFavorites = favoriteEntries.length > 0;

  // Add this near the top of your component, inside the function but before the return
  useEffect(() => {
    // Create a stylesheet to override any constraints for our gallery
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .favorites-gallery-container {
        margin: 0 -20px; /* Compensate for parent padding */
        width: calc(100% + 40px); /* Full width plus the margins */
        overflow-x: auto;
      }
      .favorites-wrapper {
        padding-left: 20px; /* Add padding back on the left */
        padding-right: 5px; /* Reduced padding on right to show scrolling */
        display: flex;
        gap: 10px;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div
      className="font-serif"
      style={{
        margin: "0 auto",
        maxWidth: "100%",
        padding: "0",
        color: "white",
        minHeight: "100vh",
        background: "transparent",
        position: "relative",
      }}
    >
      {/* Back button - top left as in screenshot */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "15px",
          zIndex: "2",
        }}
      >
        <Link
          to={username ? `/${username}` : "/"}
          style={{
            color: "white",
            textDecoration: "none",
            display: "block",
            padding: "10px",
          }}
        >
          <svg
            width="12"
            height="21"
            viewBox="0 0 12 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2L2 10.5L10 19"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* Main content area with proper padding */}
      <div
        style={{
          paddingTop: "50px",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingBottom: "100px", // Add extra padding at bottom of content
        }}
      >
        {/* Category title - smaller as per screenshot */}
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            fontFamily: "Baskerville, serif",
            color: "white",
            margin: "10px 0 20px 0",
          }}
        >
          {formatCategoryName(categoryName)}
        </h1>

        {loading ? (
          <p>Loading {categoryName} entries...</p>
        ) : entries.length === 0 ? (
          <p>No {categoryName} entries found.</p>
        ) : (
          <div>
            {/* Favorites Section - Only show if there are 5-star ratings */}
            {hasFavorites && (
              <div style={{ marginBottom: "30px" }}>
                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    fontFamily: "Baskerville, serif",
                    color: "white",
                    margin: "20px 0 5px 0",
                  }}
                >
                  Favourites
                </h2>

                <p
                  style={{
                    fontSize: "14px",
                    opacity: "0.8",
                    color: "white",
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    margin: "0 0 15px 0",
                  }}
                >
                  Archives with a 5-star rating
                </p>

                {/* Horizontal scrolling gallery with custom class */}
                <div className="favorites-gallery-container hide-scrollbar">
                  <div className="favorites-wrapper">
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
                        }}
                      >
                        {/* Background image */}
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
                              : "rgba(255, 255, 255, 0.2)",
                          }}
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
                                "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                              fontWeight: "500",
                              color: "white",
                              textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
                              lineHeight: "1.2",
                            }}
                          >
                            {entry.title || "Untitled Entry"}
                          </h4>

                          <p
                            style={{
                              fontSize: "12px",
                              margin: "0",
                              fontFamily:
                                "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                              color: "white",
                              opacity: "0.9",
                              textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
                              lineHeight: "1.2",
                            }}
                          >
                            {entry.creator || "Unknown Creator"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* "Watched" or equivalent section title */}
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                fontFamily: "Baskerville, serif",
                color: "white",
                margin: "20px 0 10px 0",
              }}
            >
              {getCompletedVerbForCategory(categoryName)}
            </h2>

            {/* Chronological entries by month */}
            {Object.keys(groupedEntries).map((monthYear) => (
              <div key={monthYear} style={{ marginBottom: "30px" }}>
                {/* Month heading - smaller */}
                <h3
                  style={{
                    fontSize: "22px", // Reduced size
                    color: "rgba(255, 255, 255, 0.8)",
                    marginBottom: "15px", // Reduced margin
                    fontFamily: "Baskerville, serif", // Keep month in Baskerville
                    fontWeight: "normal",
                  }}
                >
                  {monthYear}
                </h3>

                {/* Entries list with divider lines */}
                <div>
                  {groupedEntries[monthYear].map((entry, index) => (
                    <div key={entry.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          position: "relative",
                        }}
                      >
                        {/* Thumbnail/Cover - smaller */}
                        <div style={{ marginRight: "15px", flexShrink: 0 }}>
                          {entry.thumbnailUrl ? (
                            <img
                              src={entry.thumbnailUrl}
                              alt={entry.title || "Entry thumbnail"}
                              style={{
                                width: "60px", // Smaller
                                height: "60px", // Smaller
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "60px", // Smaller
                                height: "60px", // Smaller
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span style={{ fontSize: "20px" }}>?</span>
                            </div>
                          )}
                        </div>

                        {/* Entry Details - Title and Creator in SF Pro */}
                        <div style={{ flex: "1" }}>
                          <h4
                            style={{
                              fontSize: "17px", // Smaller
                              margin: "0 0 3px 0",
                              fontFamily:
                                "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", // SF Pro
                              fontWeight: "normal",
                            }}
                          >
                            {entry.title || "Untitled Entry"}
                          </h4>

                          <p
                            style={{
                              fontSize: "15px", // Smaller
                              margin: "0",
                              opacity: "0.7", // More transparent
                              fontFamily:
                                "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", // SF Pro
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {entry.creator || "Unknown Creator"}
                          </p>
                        </div>

                        {/* Rating with star - right aligned */}
                        <div
                          style={{
                            marginLeft: "auto",
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          {formatRating(entry.rating) && (
                            <span
                              style={{
                                fontSize: "15px", // Smaller
                                opacity: "0.8",
                                color: "white",
                                fontFamily:
                                  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", // SF Pro
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  marginRight: "4px",
                                  fontSize: "14px", // Smaller star
                                }}
                              >
                                ★
                              </span>
                              {formatRating(entry.rating)}
                            </span>
                          )}

                          {/* Three dots menu icon */}
                          <span
                            style={{
                              marginLeft: "12px",
                              fontSize: "16px", // Smaller
                              letterSpacing: "1px",
                              opacity: "0.6",
                            }}
                          >
                            •••
                          </span>
                        </div>
                      </div>

                      {/* Add divider line after each entry except the last one */}
                      {index < groupedEntries[monthYear].length - 1 && (
                        <div
                          style={{
                            height: "1px",
                            backgroundColor: "rgba(255, 255, 255, 0.15)", // Very faint white line
                            width: "100%",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spacer div at bottom to ensure scrollability */}
      <div style={{ height: "80px" }} />
    </div>
  );
};

export default CategoryPage;
