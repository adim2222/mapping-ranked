import React, { useState } from 'react';
import './Userpage.css';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, // X-axis
    LinearScale,   // Y-axis
    PointElement,  // Dots on the chart
    LineElement,   // The line itself
    Tooltip,        // Hover info
    plugins
} from 'chart.js';
import { data } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const Userpage = () => {
    const [userData, setUserData] = useState({
        id: 1,
        osuId: 15744871,
        username: "adim2222",
        avatar: "https://a.ppy.sh/15744871",
        elo: 1000,
        eloChange: 30,
        rank: 1,
        contestsPlayed: 1,
        contestsWon: 999,

        eloHistory: {
            labels: ['Cycle 1', 'Cycle 2', 'Cycle 3', 'Cycle 4', 'Current'],
            datasets: [
                {
                    label: 'ELO Rating',
                    data: [1300, 1350, 1420, 1460, 1540],
                    borderColor: '#ff66aa',
                    tension: .4,
                },
            ],
        },

        rankHistory: {
            labels: [5, 4, 3, 2, 1], // Dni temu
            datasets: [
                {
                    label: 'Global ranking',
                    data: [20, 18, 13, 12, 1],
                    borderColor: '#f8d40c',
                    borderWidth: 3,
                    tension: 0.3,
                }
            ],
        },
        featuredMaps: [],
        recentEntries: [],
    });

    const [isEditing, setIsEditing] = useState(false);
    const [newMapTitle, setNewMapTitle] = useState("");

    const rankChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                displayColors: false, 
                backgroundColor: '#0a0a24',
                titleFont: { family: 'Geomini, Torus, sans-serif', size: 16, weight: 'bold' },
                bodyFont: { family: 'Geomini, Torus, sans-serif', size: 14, weight: 'bold' },
                titleColor: '#cdd6f4',
                bodyColor: '#fab387',
                padding: 12,
                cornerRadius: 10,
                callbacks: {
                    title: (tooltipItems) => `Global Rank: #${tooltipItems[0].raw}`,
                    label: (tooltipItem) => {
                        const days = tooltipItem.label;
                        return days === '1' ? `${days} day ago` : `${days} days ago`;
                    }
                }
            }
        },
        scales: {
            y: {
                reverse: true, 
                grid: { display: false },
                ticks: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: { display: false }
            }
        }
    };

    const eloChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                displayColors: false,
                backgroundColor: '#181825',
            }
        },
        scales: {
            y: {
                grid: { color: '#313244' },
                ticks: { color: '#a6adc8' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#a6adc8' }
            }
        }
    };

    const isPositive = userData.eloChange > 0;
    const isNegative = userData.eloChange < 0;



    const formattedEloChange = isPositive
        ? `+${userData.eloChange}`
        : userData.eloChange;

    let eloColorClass = 'elo-neutral';
    if (isPositive) eloColorClass = 'elo-positive';
    if (isNegative) eloColorClass = 'elo-negative';
    return (
        <div className='profile-container'>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <button className={isEditing ? "edit-button-clicked" : "edit-button"} onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Save Changes" : "Enter Edit Mode"}
                </button>
            </div>
            <header className='profile-header'>
                <div className='profile-avatar-container'>
                    <img src={userData.avatar} alt="User Avatar" className="profile-avatar" />
                </div>
                <div className="profile-info">
                    <h1 className='profile-username'>{userData.username}</h1>
                    <div className="elo-wrapper">
                        <span className="badge elo">ELO: {userData.elo} </span>
                        <span className={`elo-gain-loss ${eloColorClass}`}>
                            {formattedEloChange}
                        </span>
                    </div>

                    <span className='badge-rank'>Global Ranking: #{userData.rank}</span>

                    <div className="rank-graph-container" style={{ width: '100%', maxWidth: '350px', height: '80px', marginTop: '15px' }}>
                        <Line data={userData.rankHistory} options={rankChartOptions} />
                    </div>

                </div>
                <div className='stat-box'>
                    <h3>Cycles Played</h3>
                    <p className='stat-value'>{userData.contestsPlayed}</p>
                </div>
                <div className='stat-box'>
                    <h3>Cycles Won</h3>
                    <p className='stat-value'>{userData.contestsWon}</p>
                </div>
            </header>

            <section className="profile-lower">
                <h2>Featured Maps</h2>

                {/* Ten blok pokaże się tylko w trybie edycji */}
                {isEditing && (
                    <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Type in map name (fte. Blue Zenith)..." 
                            value={newMapTitle}
                            onChange={(e) => setNewMapTitle(e.target.value)}
                        />
                        <button>Add Map</button>
                    </div>
                )}

                <h2>Elo history (Last 30 days)</h2>
                {/* ELOCHART */}
                <div style={{ height: '250px' }}>
                    <Line data={userData.eloHistory} options={eloChartOptions} /> 
                </div>
            </section>
        </div>
    );
};

export default Userpage;
