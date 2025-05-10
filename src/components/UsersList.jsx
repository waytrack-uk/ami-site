// src/components/UsersList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Fetch users when component loads
  useEffect(() => {
    async function fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, "users_v3"));

        if (querySnapshot.empty) {
          setStatus("No users found in database");
          return;
        }

        const usersData = [];
        querySnapshot.forEach((doc) => {
          usersData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setUsers(usersData);
        setFilteredUsers(usersData);
        setStatus("");
      } catch (error) {
        console.error("Error fetching users:", error);
        setStatus("Error connecting to database: " + error.message);
      }
    }

    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.name &&
            user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const activateSearch = () => {
    setIsSearchActive(true);
  };

  const deactivateSearch = () => {
    setIsSearchActive(false);
    setSearchTerm("");
  };

  // Common styling for both states
  const containerStyle = {
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: "#f8f6f2", // Beige color from the images
    display: "flex",
    flexDirection: "column",
  };

  // Render home screen with "Be Curious..." text
  const renderHomeScreen = () => (
    <div style={containerStyle}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            fontFamily: "serif",
            fontWeight: "normal",
          }}
        >
          Be Curious...
        </h1>
      </div>

      {/* Search button at bottom */}
      <div
        style={{
          padding: "20px",
          position: "fixed",
          bottom: "0",
          left: "0",
          right: "0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "#f1f1f1",
            borderRadius: "20px",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
          onClick={activateSearch}
        >
          <span style={{ fontSize: "14px" }}>🔍</span>
          <span style={{ color: "#777", fontSize: "14px" }}>Search</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "15px 0",
          borderTop: "1px solid #eee",
          backgroundColor: "#f8f6f2",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "18px" }}>🏠</span>
        </div>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={activateSearch}
        >
          <span style={{ fontSize: "18px", color: "#fff" }}>🔍</span>
        </div>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "18px" }}>👤</span>
        </div>
      </div>
    </div>
  );

  // Render search screen with users list
  const renderSearchScreen = () => (
    <div style={containerStyle}>
      {/* Search bar section */}
      <div
        style={{
          padding: "10px 20px",
          backgroundColor: "#f8f6f2",
          borderBottom: "1px solid #eee",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "12px",
              color: "#888",
            }}
          >
            🔍
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus
            style={{
              width: "100%",
              padding: "8px 40px 8px 35px",
              fontSize: "16px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: "#eaeaea",
            }}
          />
          {searchTerm ? (
            <div
              onClick={handleClearSearch}
              style={{
                position: "absolute",
                right: "12px",
                backgroundColor: "#999",
                color: "#fff",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              ✕
            </div>
          ) : (
            <div
              onClick={deactivateSearch}
              style={{
                position: "absolute",
                right: "12px",
                color: "#888",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ✕
            </div>
          )}
        </div>
      </div>

      {/* User list section */}
      <div style={{ flex: 1 }}>
        {status ? (
          <p style={{ padding: "0 20px" }}>{status}</p>
        ) : (
          <div>
            {filteredUsers.length === 0 ? (
              <p
                style={{ padding: "20px", textAlign: "center", color: "#666" }}
              >
                No users found matching "{searchTerm}"
              </p>
            ) : (
              <div style={{ padding: "0 20px" }}>
                {filteredUsers.map((user) => (
                  <Link
                    key={user.id}
                    to={`/${user.id}`}
                    style={{
                      display: "flex",
                      padding: "12px 0",
                      textDecoration: "none",
                      color: "#000",
                      borderBottom: "1px solid #eee",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: "#ddd",
                        marginRight: "15px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {user.profilePicUrl ? (
                        <img
                          src={user.profilePicUrl}
                          alt={user.username}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="#888"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: "bold" }}>
                        {user.username || "username"}
                      </div>
                      <div style={{ color: "#666", fontSize: "14px" }}>
                        {user.fullName || user.name || user.username}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "15px 0",
          borderTop: "1px solid #eee",
          backgroundColor: "#f8f6f2",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "18px" }}>🏠</span>
        </div>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "18px", color: "#fff" }}>🔍</span>
        </div>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "18px" }}>👤</span>
        </div>
      </div>
    </div>
  );

  // Render the appropriate screen based on state
  return isSearchActive ? renderSearchScreen() : renderHomeScreen();
};

export default UsersList;
