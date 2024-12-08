import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';

interface BalanceResponse {
  balance: number;
  goal: number;
}

const App: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [goal, setGoal] = useState<number>(10000); // Set the goal to 10,000 NIS
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setError(null);
      const response = await axios.get<BalanceResponse>('http://localhost:4000/balance');
      setBalance(response.data.balance);
      setGoal(response.data.goal);
    } catch (err) {
      setError('Failed to fetch balance. Please check your backend.');
      console.error(err);
    }
  };

  const progress = Math.min((balance / goal) * 100, 100);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(() => {
      fetchBalance();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate ticks dynamically based on predefined intervals
  const interval = 1000; // Set tick interval (e.g., 1000 NIS)
  const tickCount = Math.floor(goal / interval); // Total number of ticks
  const ticks = Array.from({ length: tickCount }, (_, i) => ({
    value: (interval * (i + 1)) / goal, // Normalized position
    label: `${interval * (i + 1)} ₪`,
  }));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#fff',
        color: '#333',
        padding: 2,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: '#333' }}>
        Donation Progress
      </Typography>
      <Box
        sx={{
          position: 'relative',
          height: '80%',
          width: '5vw',
          maxWidth: 50,
          border: '1px solid #ccc',
          borderRadius: 4,
          backgroundColor: '#e0e0e0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column-reverse',
        }}
      >
        {/* Progress bar fill */}
        <Box
          sx={{
            width: '100%',
            height: `${progress}%`,
            backgroundColor: '#3f51b5',
            transition: 'height 0.5s ease',
          }}
        ></Box>

        {/* Ticks */}
        {ticks.map((tick, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              left: '100%',
              bottom: `${tick.value * 100}%`,
              transform: 'translateX(10px)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Tick line */}
            <Box
              sx={{
                width: '10px',
                height: '1px',
                backgroundColor: '#333',
                marginRight: '5px',
              }}
            />
            {/* Tick label */}
            <Typography
              variant="caption"
              sx={{ color: '#333', fontSize: '10px', whiteSpace: 'nowrap' }}
            >
              {tick.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
        <Typography variant="h6" sx={{ color: '#333', marginRight: 1 }}>
          ₪{balance.toFixed(2)} / ₪{goal.toFixed(2)}
        </Typography>
      </Box>
      {error && (
        <Typography variant="body1" color="error" sx={{ marginTop: 2, color: '#d32f2f' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default App;
