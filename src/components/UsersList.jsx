import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const ArchivePage = () => {
  // State variables
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [archiveLink, setArchiveLink] = useState("");
  const [gradientStyle, setGradientStyle] = useState({});

  // Define the available gradients with the updated colors
  const gradients = [
    // {
    //   // Books gradient (gold)
    //   background:
    //     "linear-gradient(to right, #f2d9b3, #ecd1a6, #e6bf8c, #deb378, #e6bf8c, #ecd1a6, #f2d9b3)",
    // },
    {
      // TV gradient (cyan)
      background:
        "linear-gradient(to right, #66bfd9, #5eb8d1, #4da6bf, #4099b3, #4da6bf, #5eb8d1, #66bfd9)",
    },
    {
      // Music gradient (coral)
      background:
        "linear-gradient(to right, #ff8c99, #fa8591, #f27380, #eb6673, #f27380, #fa8591, #ff8c99)",
    },
    {
      // Podcasts gradient (lavender)
      background:
        "linear-gradient(to right, #e6a6ff, #e09efa, #d98cf2, #d180eb, #d98cf2, #e09efa, #e6a6ff)",
    },
  ];

  // Select a random gradient on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * gradients.length);
    setGradientStyle(gradients[randomIndex]);
  }, []);

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
      if (searchTerm === "" && hasSearched) {
        setHasSearched(false);
      }
    } else {
      const term = searchTerm.toLowerCase();

      // Filter users that match the search term
      const filtered = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(term) ||
          user.fullName?.toLowerCase().includes(term) ||
          (user.name && user.name.toLowerCase().includes(term))
      );

      // Sort filtered results
      const sorted = [...filtered].sort((a, b) => {
        // Get usernames, defaulting to empty string if undefined
        const usernameA = (a.username || "").toLowerCase();
        const usernameB = (b.username || "").toLowerCase();

        // Check if username starts with the search term
        const aStartsWith = usernameA.startsWith(term);
        const bStartsWith = usernameB.startsWith(term);

        // If one starts with the term but the other doesn't, prioritize the one that does
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // If both start with the term or neither starts with the term,
        // sort alphabetically by username
        return usernameA.localeCompare(usernameB);
      });

      setFilteredUsers(sorted);
      setHasSearched(true);
    }
  }, [searchTerm, users]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() !== "" && !hasSearched) {
      setHasSearched(true);
    }
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchTerm("");
    setHasSearched(false);
  };

  // Helper function to create a safe URL from username
  const getUserRouteParam = (user) => {
    // If username is missing, fall back to ID
    if (!user.username) return user.id;

    // Otherwise encode the username to handle special characters
    return encodeURIComponent(user.username);
  };

  // Handle user selection to generate link instead of redirecting
  const handleUserSelection = (user) => {
    setSelectedUser(user);
    const link = `/${getUserRouteParam(user)}`;
    setArchiveLink(link);
  };

  // Handle copy to clipboard with fallback methods
  const handleCopyLink = () => {
    const fullLink = `${window.location.origin}${archiveLink}`;

    // Try different clipboard API methods
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Modern API - most browsers
      navigator.clipboard
        .writeText(fullLink)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy with clipboard API: ", err);
          fallbackCopyMethod(fullLink);
        });
    } else {
      // Fallback for older or mobile browsers
      fallbackCopyMethod(fullLink);
    }
  };

  // Fallback copy method using text area
  const fallbackCopyMethod = (text) => {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement("textarea");

      // Set its value to the text to be copied
      textArea.value = text;

      // Make it invisible but part of the document
      textArea.style.position = "fixed"; // Avoid scrolling to bottom
      textArea.style.opacity = 0;
      textArea.style.left = "-999999px";
      textArea.style.top = "0";

      document.body.appendChild(textArea);

      // Select and copy
      textArea.focus();
      textArea.select();

      // Execute copy command
      const successful = document.execCommand("copy");

      // Clean up
      document.body.removeChild(textArea);

      if (successful) {
        alert("Link copied to clipboard!");
      } else {
        // If execCommand fails, show the link and ask user to copy manually
        alert(
          "Couldn't automatically copy the link. Please copy this link manually:\n\n" +
            text
        );
      }
    } catch (err) {
      console.error("Fallback copy method failed: ", err);
      alert("Couldn't copy link. Please copy this link manually:\n\n" + text);
    }
  };

  // Handle sharing with Web Share API
  const handleShare = async () => {
    const fullLink = `${window.location.origin}${archiveLink}`;

    // Check if the Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedUser.username || "User"}'s Archive`,
          text: `Check out ${selectedUser.username || "this user"}'s archive`,
          url: fullLink, // Use the generated archive link
        });
        console.log("Content shared successfully");
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Share was cancelled by user");
        } else {
          console.error("Error sharing:", error);
          // Fallback to clipboard copy
          fallbackShare(fullLink);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      fallbackShare(fullLink);
    }
  };

  // Fallback method to copy to clipboard
  const fallbackShare = (url) => {
    // Copy URL to clipboard as fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Clipboard copy failed:", err);
          showManualCopyPrompt(url);
        });
    } else {
      // Old browsers fallback
      showManualCopyPrompt(url);
    }
  };

  // Show manual copy prompt for very old browsers
  const showManualCopyPrompt = (url) => {
    prompt("Copy this link to share:", url);
  };

  return (
    <div
      className="min-h-screen w-full font-sans flex flex-col items-center pt-28 gap-12 px-4"
      style={{ backgroundColor: "#f2e8d5" }}
    >
      <h1
        className="text-6xl md:text-8xl"
        style={{
          fontFamily: "Baskerville, serif",
        }}
      >
        Archive
      </h1>

      {/* Welcome widget - only shows on homepage (not in selected view) */}
      {/* {!selectedUser && (
        <div
          className="w-full max-w-md text-white rounded-xl p-8 mb-6 shadow-lg text-center"
          style={gradientStyle}
        >
          <h2
            className="text-3xl mb-2 font-normal"
            style={{
              fontFamily: "Baskerville, serif",
            }}
          >
            Welcome to Archive
          </h2>
          <p
            className="text-xl"
            style={{
              fontFamily: "Baskerville, serif",
            }}
          >
            This is your Link
          </p>
        </div>
      )} */}

      {/* Original rectangular widget with random gradient and increased bottom padding */}
      <div
        className="w-full max-w-md text-white rounded-xl p-8 pb-4 shadow-lg relative"
        style={gradientStyle}
      >
        {/* Dynamic header based on selection state - with bold text - only show when no user is selected */}
        {!selectedUser && (
          <h2
            className="text-center text-2xl sm:text-2xl mb-8 font-semibold"
            style={{
              fontFamily: "Baskerville, serif",
            }}
          >
            Find your link!
          </h2>
        )}

        {/* Main content area with centered search */}
        <div className="flex flex-col items-center">
          {/* Search section - only show when no user is selected */}
          {!selectedUser && (
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Type your username..."
                className="w-full py-3 pl-16 pr-10 border border-white rounded-full bg-white bg-opacity-90 focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-black"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-8 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>

              {/* Clear search button */}
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-8">
                  <button
                    onClick={handleClearSearch}
                    className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-xs"
                  >
                    X
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status message display */}
          {status && !selectedUser && (
            <div className="text-white mb-4 text-center">{status}</div>
          )}

          {/* Selected user and link display */}
          {selectedUser && (
            <div className="w-full max-w-xs">
              {/* Profile picture and user info directly in the gradient box */}
              <div className="flex flex-col items-center justify-center">
                {/* Profile picture - larger size - with thinner white border */}
                <div className="w-36 h-36 rounded-full bg-white bg-opacity-90 overflow-hidden flex items-center justify-center mb-6 shadow-md border-2 border-white border-opacity-50">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg width="72" height="72" viewBox="0 0 24 24" fill="#888">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  )}
                </div>

                {/* Username display */}
                <div className="text-2xl font-bold text-white mb-10">
                  @{selectedUser.username || "username"}
                </div>

                {/* Link display as a clickable button with copy icon */}
                <button
                  onClick={handleCopyLink}
                  className="text-black text-center text-xl mb-4 bg-white px-6 py-2 rounded-xl
                   shadow-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  aria-label="Copy link to clipboard"
                >
                  <span>seemyarchive/{getUserRouteParam(selectedUser)}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Users list section - only show when user has searched and no user is selected */}
          {!status && hasSearched && !selectedUser && (
            <div className="w-full max-w-xs mt-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-white mt-4">
                  No users found matching "{searchTerm}"
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto bg-white bg-opacity-10 rounded-lg">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelection(user)}
                      className="block p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center mr-4">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.username || "User"}
                              className="w-full h-full object-cover"
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
                          <div className="font-medium text-white">
                            {user.username || "username"}
                          </div>
                          <div className="text-purple-100 text-sm">
                            {user.fullName || user.name || user.username}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons - completely outside and below the main widget */}
      {selectedUser && (
        <div className="w-full max-w-md -mt-4 grid grid-cols-3 gap-3">
          <button
            onClick={handleShare}
            className="rounded-lg py-3 flex flex-col items-center justify-center shadow-md"
            aria-label="Share profile"
            style={gradientStyle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-1 text-white"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            <span className="text-sm text-white font-medium">Share</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="rounded-lg py-3 flex flex-col items-center justify-center shadow-md"
            aria-label="Copy"
            style={gradientStyle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-1 text-white"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span className="text-sm text-white font-medium">Copy</span>
          </button>

          <button
            onClick={() => {
              setSelectedUser(null);
              setArchiveLink("");
            }}
            className="rounded-lg py-3 flex flex-col items-center justify-center shadow-md"
            aria-label="Close"
            style={gradientStyle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-1 text-white"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="text-sm text-white font-medium">Close</span>
          </button>
        </div>
      )}

      {/* Extra space at the bottom of the page */}
      <div className="h-16"></div>
    </div>
  );
};

export default ArchivePage;
