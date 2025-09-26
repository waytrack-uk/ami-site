// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsersList from "./components/UsersList";
import UserProfile from "./components/UserProfile";
import CategoryPage from "./components/CategoryPage"; // Import the category page
import Privacy from "./components/Privacy";
import Terms from "./components/Terms";
import Contact from "./components/Contact";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UsersList />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/:username" element={<UserProfile />} />
        <Route path="/:username/:categoryName" element={<CategoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
