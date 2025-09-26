import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const ArchivePage = () => {
  const navigate = useNavigate();
  
  // State variables
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = React.useRef(null);


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
        // Comment out the status clear to keep loading state
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

  // Handle user selection to navigate directly to profile
  const handleUserSelection = (user) => {
    const link = `/${getUserRouteParam(user)}`;
    navigate(link);
  };


  // Add this near the top of the component with other state declarations
  const PlaceholderBox = () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: "50%",
        animation: "pulse 1.5s ease-in-out infinite alternate",
      }}
    />
  );

  // Add this useEffect for the pulse animation
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 0.3; }
        100% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Simplify the UserAvatar component to just handle the display
  const UserAvatar = ({ user, size = "small" }) => {
    return (
      <div
        className={`${
          size === "large" ? "w-36 h-36" : "w-8 h-8"
        } rounded-full overflow-hidden flex items-center justify-center ${
          size === "small"
            ? "mr-2"
            : "mb-6 shadow-md border-2 border-white border-opacity-50"
        }`}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username || "User"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-400 flex items-center justify-center">
            <svg
              width={size === "large" ? "200" : "40"}
              height={size === "large" ? "200" : "40"}
              viewBox="2 2 20 20"
              fill="#e6e6e6"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  // Add LoadingSpinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center">
      <div className="w-8 h-8 relative">
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .loading-spinner {
              width: 32px;
              height: 32px;
              border: 3px solid rgba(0, 0, 0, 0.1);
              border-radius: 50%;
              border-top-color: #666;
              animation: spin 1s linear infinite;
            }
          `}
        </style>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center pt-44 gap-2 px-4 relative"
      style={{
        backgroundColor: "white",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
      }}
    >
      {/* Logo */}
      <div className="mb-3">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="w-24 h-24 md:w-32 md:h-32 mx-auto"
        />
      </div>

      {/* Search bar */}
      <div className="flex flex-col items-center w-full max-w-xl">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            placeholder="username"
            className="w-full py-4 pl-12 pr-10 border border-gray-300 rounded-full bg-white focus:outline-none text-black md:shadow"
            value={searchTerm}
            onChange={handleSearchChange}
            ref={searchInputRef}
            autoComplete="off"
            data-1p-ignore="true"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
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
                className="flex items-center justify-center text-gray-800 transition-colors"
                style={{ width: "1.125rem", height: "1.125rem" }}
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
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

        {/* Status message display */}
        {status && (
          <div className="w-full max-w-md my-4 flex justify-center text-gray-700">
            {status}
          </div>
        )}

        {/* Users list section */}
        {!status && hasSearched && (
          <div className="w-full max-w-md mt-4 md:max-w-[48rem]">
            {filteredUsers.length === 0 ? (
              <div className="text-center text-gray-700 mt-4">
                No users found matching "{searchTerm}"
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto bg-white rounded-2xl pt-2 pb-2 md:shadow-md">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelection(user)}
                    className="block rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    <div className="p-2">
                      <div className="flex items-center">
                        <UserAvatar user={user} size="small" />
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
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="username"
              className="w-full py-4 pl-12 pr-10 border border-gray-300 rounded-full bg-white focus:outline-none text-black md:shadow"
              value={searchTerm}
              onChange={handleSearchChange}
              ref={searchInputRef}
              autoComplete="off"
              data-1p-ignore="true"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
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
                  className="flex items-center justify-center text-gray-800 transition-colors"
                  style={{ width: "1.125rem", height: "1.125rem" }}
                  aria-label="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
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
            <div className="w-full max-w-md my-4 flex justify-center">
              <LoadingSpinner />
            </div>
          )}

          {/* Users list section - no shadow */}
          {!status && hasSearched && (
            <div className="w-full max-w-md mt-4 md:max-w-[48rem]">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-gray-700 mt-4">
                  No users found matching "{searchTerm}"
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto bg-white rounded-2xl pt-2 pb-2 md:shadow-md">
                  {filteredUsers.map((user, index) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelection(user)}
                      className="block rounded-lg transition-all duration-200 cursor-pointer"
                    >
                      <div className="p-2">
                        <div className="flex items-center">
                          <UserAvatar user={user} size="small" />
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
          {/* Add cross button */}
          <button
            onClick={() => {
              setSelectedUser(null);
              setArchiveLink("");
            }}
            className="absolute top-4 right-4 p-2"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="flex flex-col items-center">
            <div className="w-full max-w-xs">
              <div className="flex flex-col items-center justify-center">
                <UserAvatar user={selectedUser} size="large" />

                <div className="text-2xl font-bold text-white mb-10">
                  @{selectedUser.username || "username"}
                </div>

                <button
                  onClick={handleCopyLink}
                  className="text-black text-center mb-4 bg-white px-6 py-2 rounded-3xl
                   shadow-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 max-w-full"
                  aria-label="Copy link to clipboard"
                >
                  <span className="truncate text-xl">
                    seemyarchive.com/{getUserRouteParam(selectedUser)}
                  </span>
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
                    className="text-gray-500 flex-shrink-0"
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

          <Link
            to={archiveLink}
            className="rounded-lg py-3 flex flex-col items-center justify-center shadow-md"
            aria-label="See Profile"
            style={gradientStyle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="2 2 20 20"
              fill="currentColor"
              className="mb-1 text-white"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            <span className="text-sm text-white font-medium">See Profile</span>
          </Link>
        </div>
      )}

      {/* Footer */}
      <footer className="w-screen mt-auto -mx-4" style={{ backgroundColor: '#f2f2f2' }}>
        <div className="w-full px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <a 
                href="https://apps.apple.com/gb/app/archive-be-curious/id6738609084"
                className="text-sm text-gray-800 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            </div>
            <div className="flex space-x-6">
              <Link 
                to="/privacy" 
                className="text-sm text-gray-800 hover:underline"
              >
                Privacy
              </Link>
              <Link 
                to="/terms" 
                className="text-sm text-gray-800 hover:underline"
              >
                Terms
              </Link>
              <Link 
                to="/contact" 
                className="text-sm text-gray-800 hover:underline"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArchivePage;
