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

  return (
    <div
      className="min-h-screen w-full font-sans flex flex-col items-center pt-20 gap-8"
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

      {/* Search section */}
      <div className="relative w-full max-w-md px-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full py-3 pl-16 pr-10 border border-gray-500 rounded-full bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-8 pointer-events-none">
          <svg
            className="w-5 h-5"
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
              className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Status message display */}
      {status && <div className="text-gray-600 mt-2 mb-4">{status}</div>}

      {/* Users list section - only show when user has searched */}
      {!status && hasSearched && (
        <div className="w-full max-w-md px-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-600 mt-4">
              No users found matching "{searchTerm}"
            </div>
          ) : (
            <div className="">
              {filteredUsers.map((user) => (
                <Link
                  key={user.id}
                  to={`/${getUserRouteParam(user)}`}
                  className="block p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center mr-4">
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
                      <div className="font-medium">
                        {user.username || "username"}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {user.fullName || user.name || user.username}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArchivePage;
