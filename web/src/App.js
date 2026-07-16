import { Routes, Route, Link } from 'react-router';
import { useAuth } from './context/AuthContext';
import Home from './routes/Home/Home';
import './App.css';

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="App">
      <nav>
        <Link to="/">Home</Link>
        {user && <span> | Logged in as {user.username} <button onClick={logout}>Logout</button></span>}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
