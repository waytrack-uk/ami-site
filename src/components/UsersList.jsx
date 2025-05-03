// src/components/UsersList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("Loading...");

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
        setStatus("");
      } catch (error) {
        console.error("Error fetching users:", error);
        setStatus("Error connecting to database: " + error.message);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div style={{ margin: "20px" }}>
      <h2>Users Directory</h2>

      {status ? (
        <p>{status}</p>
      ) : (
        <div>
          <p>Found {users.length} users:</p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {users.map((user) => (
              <li key={user.id} style={{ marginBottom: "8px" }}>
                <Link
                  to={`/${user.id}`}
                  style={{
                    display: "block",
                    padding: "10px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "#333",
                  }}
                >
                  {user.username}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UsersList;
