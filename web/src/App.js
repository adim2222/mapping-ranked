import { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './routes/Home/Home';
import './App.css';

function App() {

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has("code")) {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      window.history.replaceState({}, "", window.location.pathname);

      fetch(`http://localhost:5047/authorize?code=${code}&state=${state}`)
        .then(res => res.json())
        .then(data => console.log("Token response:", data))
        .catch(err => console.error("Token exchange failed:", err));
    }
  }, []);

  return (
    <div className="App">
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
