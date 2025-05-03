import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsersList from "./components/UsersList";
import UserArchives from "./components/UserArchives";
import UserProfile from "./components/UserProfile"; // Import the new component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UsersList />} />
        <Route path="/:userId" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
