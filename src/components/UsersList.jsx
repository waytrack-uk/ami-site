import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const ArchivePage = () => {
  const navigate = useNavigate();
  
  // State variables
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
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

      const filtered = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(term) ||
          user.fullName?.toLowerCase().includes(term) ||
          (user.name && user.name.toLowerCase().includes(term))
      );

      // Sort filtered results
      const sorted = filtered.sort((a, b) => {
        const aUsername = (a.username || "").toLowerCase();
        const bUsername = (b.username || "").toLowerCase();
        
        const aStartsWithTerm = aUsername.startsWith(term);
        const bStartsWithTerm = bUsername.startsWith(term);
        
        if (aStartsWithTerm && !bStartsWithTerm) return -1;
        if (!aStartsWithTerm && bStartsWithTerm) return 1;
        
        return aUsername.localeCompare(bUsername);
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

  // Handle clear search functionality
  const handleClearSearch = () => {
    setSearchTerm("");
    setHasSearched(false);
  };

  // Helper function to create a safe URL from username
  const getUserRouteParam = (user) => {
    if (!user.username) return user.id;
    return encodeURIComponent(user.username);
  };

  // Handle user selection to navigate directly to profile
  const handleUserSelection = (user) => {
    const link = `/${getUserRouteParam(user)}`;
    navigate(link);
  };

  // User Avatar Component  
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
          <div className="w-full h-full bg-gray-300 bg-opacity-30 flex items-center justify-center overflow-hidden">
            <svg
              width={size === "large" ? "144" : "32"}
              height={size === "large" ? "144" : "32"}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-gray-500"
              style={{ 
                transform: `translateY(${size === "large" ? "20px" : "4px"}) scale(${size === "large" ? "1.3" : "1.3"})` 
              }}
            >
              <path d="M12 4C13.0609 4 14.0783 4.42143 14.8284 5.17157C15.5786 5.92172 16 6.93913 16 8C16 9.06087 15.5786 10.0783 14.8284 10.8284C14.0783 11.5786 13.0609 12 12 12C10.9391 12 9.92172 11.5786 9.17157 10.8284C8.42143 10.0783 8 9.06087 8 8C8 6.93913 8.42143 5.92172 9.17157 5.17157C9.92172 4.42143 10.9391 4 12 4ZM12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z" />
            </svg>
          </div>
        )}
      </div>
    );
  };

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
            placeholder="Username"
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