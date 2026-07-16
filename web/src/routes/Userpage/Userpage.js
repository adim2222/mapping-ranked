import React from 'react';
import './Userpage.css';

const Userpage = () => {
    const userData = {
    username: "Adim2222",
    avatar: "https://a.ppy.sh/16740086", // Tu wpadnie prawdziwy avatar z osu!
    elo: 1540,
    rank: 12,
    contestsPlayed: 1,
    contestsWon: 999,
    role: "DEV"
  };
  return (
    <div className='userpage-container'>
        <header className='progile-header'>
            <div className='profile-avatar-container'>
                <img src={userData.avatar} alt="Avatar gracza" className="profile-avatar" />
            </div>
            <div className="profile-info">
                <h1 className='profile-username'>{userData.username}</h1>
                <span className="badge elo-badge">ELO: {userData.elo}</span>
            </div>
        </header>   
    </div>
  )
};

export default Userpage;
