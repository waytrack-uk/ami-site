// src/components/UserArchives.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const UserArchives = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("Loading...");

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

  return (
    <div style={{ margin: "20px" }}>
      <p>
        <Link to="/">← Back to All Users</Link>
      </p>

      {status ? (
        <p>{status}</p>
      ) : (
        <>
          {user && (
            <div>
              <h2>Archives for {user.username}</h2>

              {entries.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        padding: "15px",
                        border: "1px solid #eee",
                        borderRadius: "5px",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      {entry.thumbnailUrl && (
                        <div style={{ marginBottom: "10px" }}>
                          <img
                            src={entry.thumbnailUrl}
                            alt={entry.title || "Entry thumbnail"}
                            style={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                              borderRadius: "3px",
                            }}
                          />
                        </div>
                      )}
                      <h3 style={{ margin: "0 0 10px 0" }}>
                        {entry.title || "Untitled Entry"}
                      </h3>
                      <div>
                        <p style={{ fontSize: "14px", color: "#666" }}>
                          {entry.category}
                          {entry.format ? ` • ${entry.format}` : ""}
                        </p>
                        <p style={{ fontSize: "14px", color: "#666" }}>
                          Status: {entry.status || "N/A"}
                        </p>
                        {entry.rating > 0 && (
                          <p style={{ fontSize: "14px", color: "#666" }}>
                            Rating: {entry.rating}/10
                          </p>
                        )}
                      </div>
                      <div style={{ marginTop: "auto" }}>
                        <small style={{ color: "#999" }}>
                          {new Date(
                            entry.createdAt?.seconds * 1000
                          ).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No archives found for this user</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserArchives;
