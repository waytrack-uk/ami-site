// src/components/CategoryPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch entries for this category
  useEffect(() => {
    async function fetchCategoryEntries() {
      try {
        setLoading(true);

        // Create a query to get all entries for this category
        const entriesQuery = query(
          collection(db, "archives_v3"),
          where("category", "==", categoryName.toLowerCase())
        );

        const entriesSnapshot = await getDocs(entriesQuery);

        if (entriesSnapshot.empty) {
          setEntries([]);
          setLoading(false);
          return;
        }

        const entriesData = [];
        entriesSnapshot.forEach((doc) => {
          entriesData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Sort entries by date (newest first)
        entriesData.sort((a, b) => {
          const dateA = a.createdAt
            ? a.createdAt.toDate
              ? a.createdAt.toDate()
              : new Date(a.createdAt)
            : new Date(0);
          const dateB = b.createdAt
            ? b.createdAt.toDate
              ? b.createdAt.toDate()
              : new Date(b.createdAt)
            : new Date(0);
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
  }, [categoryName]);

  // Apply gradient to the entire body when component mounts
  useEffect(() => {
    // Store the original background
    const originalBackground = document.body.style.background;
    const originalOverflow = document.body.style.overflow;

    // Apply new styles to body
    document.body.style.background = getGradientStyle(categoryName);
    document.body.style.backgroundAttachment = "fixed"; // Keeps the background fixed during scroll
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.minHeight = "100vh";

    // Cleanup function to restore original background when component unmounts
    return () => {
      document.body.style.background = originalBackground;
      document.body.style.overflow = originalOverflow;
    };
  }, [categoryName]);

  // Group entries by month
  const groupedEntries = groupEntriesByMonth(entries);

  // Function to format the rating (ensure it has one decimal place)
  const formatRating = (rating) => {
    if (rating === undefined || rating === null) {
      return "0.0"; // Default if no rating
    }

    // Convert to number if it's a string
    const numRating = typeof rating === "string" ? parseFloat(rating) : rating;

    // Format to one decimal place
    return numRating.toFixed(1);
  };

  return (
    <div
      className="font-serif"
      style={{
        margin: "0 auto",
        maxWidth: "800px",
        padding: "20px 15px",
        fontFamily: "Baskerville, serif",
        color: "white",
        minHeight: "100vh",
      }}
    >
      {/* Back button */}
      <div style={{ marginBottom: "25px" }}>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "24px",
          }}
        >
          ←
        </Link>
      </div>

      {loading ? (
        <p>Loading {categoryName} entries...</p>
      ) : entries.length === 0 ? (
        <p>No {categoryName} entries found.</p>
      ) : (
        <div>
          {Object.keys(groupedEntries).map((monthYear) => (
            <div key={monthYear} style={{ marginBottom: "40px" }}>
              <div style={{ marginBottom: "15px" }}>
                <h2
                  style={{
                    fontSize: "28px",
                    margin: "0 0 5px 0",
                    fontFamily: "Baskerville, serif",
                    fontWeight: "bold",
                  }}
                >
                  {categoryName === "music"
                    ? `Listened in ${monthYear}`
                    : categoryName === "books"
                    ? `Read in ${monthYear}`
                    : categoryName === "tv"
                    ? `Watched in ${monthYear}`
                    : categoryName === "podcasts"
                    ? `Heard in ${monthYear}`
                    : `Added in ${monthYear}`}
                </h2>
              </div>

              {groupedEntries[monthYear].map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                    position: "relative",
                  }}
                >
                  {/* Thumbnail/Cover */}
                  <div style={{ marginRight: "15px", flexShrink: 0 }}>
                    {entry.thumbnailUrl ? (
                      <img
                        src={entry.thumbnailUrl}
                        alt={entry.title || "Entry thumbnail"}
                        style={{
                          width: "75px",
                          height: "75px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "75px",
                          height: "75px",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>?</span>
                      </div>
                    )}
                  </div>

                  {/* Entry Details */}
                  <div style={{ flex: "1" }}>
                    <h3
                      style={{
                        fontSize: "22px",
                        margin: "0 0 4px 0",
                        fontFamily: "Baskerville, serif",
                        fontWeight: "normal",
                      }}
                    >
                      {entry.title || "Untitled Entry"}
                    </h3>

                    <p
                      style={{
                        fontSize: "18px",
                        margin: "0",
                        opacity: "0.8",
                        fontFamily: "Baskerville, serif",
                      }}
                    >
                      {entry.creator || "Unknown Creator"}
                      {/* Display actual rating from the entry */}
                      <span
                        style={{
                          marginLeft: "10px",
                          fontSize: "18px",
                          opacity: "0.9",
                        }}
                      >
                        ★ {formatRating(entry.rating)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
