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
  const [isTouching, setIsTouching] = useState(false);
  const searchInputRef = React.useRef(null);

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

  // Add touch event handlers for the entire component
  const handleTouchMove = (e) => {
    if (!isTouching) {
      setIsTouching(true);
      // Dismiss keyboard by blurring any active input
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA")
      ) {
        document.activeElement.blur();
      }

      // Additional force for iOS
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
  };

  return (
    <div
      className="min-h-screen w-full font-sans flex flex-col items-center pt-28 gap-4 px-4"
      style={{ backgroundColor: "#f2e8d5" }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Only show the title when no user is selected */}
      {!selectedUser && (
        <div className="mb-3">
          <h1
            className="text-5xl md:text-8xl text-center"
            style={{
              fontFamily: "Baskerville, serif",
            }}
          >
            Find your <br />
            Archive link.
          </h1>
        </div>
      )}

      {/* Search bar only, no colored widget */}
      {!selectedUser ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Type your username..."
              className="w-full py-3 pl-12 pr-10 border border-gray-300 rounded-full bg-white focus:outline-none text-black"
              value={searchTerm}
              onChange={handleSearchChange}
              ref={searchInputRef}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <button
                  onClick={handleClearSearch}
                  className="rounded-full flex items-center justify-center text-white transition-colors bg-gray-400"
                  style={{ width: "1.125rem", height: "1.125rem" }}
                  aria-label="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Status message display - no shadow */}
          {status && (
            <div className="text-gray-700 my-4 text-center">{status}</div>
          )}

          {/* Users list section - no shadow */}
          {!status && hasSearched && (
            <div className="w-full max-w-md mt-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-gray-700 mt-4">
                  No users found matching "{searchTerm}"
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto bg-white rounded-2xl pt-2 pb-2">
                  {filteredUsers.map((user, index) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelection(user)}
                      className="block rounded-lg transition-all duration-200 cursor-pointer"
                    >
                      <div className="p-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-400 overflow-hidden flex items-center justify-center mr-2">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.username || "User"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg
                                width="40"
                                height="40"
                                viewBox="2 2 20 20"
                                fill="#e6e6e6"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-xs">
                              {user.username || "username"}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {user.fullName || user.name || user.username}
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < filteredUsers.length - 1 && (
                        <div className="flex items-center">
                          <div className="w-12 flex-shrink-0"></div>
                          <div className="border-t border-gray-100 w-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Selected user view with the colored widget and shadow restored */
        <div
          className="w-full max-w-md text-white rounded-xl p-8 pb-4 shadow-lg relative mb-4"
          style={gradientStyle}
        >
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xs">
              <div className="flex flex-col items-center justify-center">
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

                <div className="text-2xl font-bold text-white mb-10">
                  @{selectedUser.username || "username"}
                </div>

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
          </div>
        </div>
      )}

      {/* Action buttons - add shadows back */}
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
