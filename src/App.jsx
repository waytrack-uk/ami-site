// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsersList from "./components/UsersList";
import UserProfile from "./components/UserProfile";
import CategoryPage from "./components/CategoryPage"; // Import the category page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UsersList />} />
        <Route path="/:username" element={<UserProfile />} />
        <Route path="/:username/:categoryName" element={<CategoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
