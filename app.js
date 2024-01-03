// app.js
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// MySQL 연결 설정
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'whwnsgh0258',
  database: process.env.DB_DATABASE || 'restaurants',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 정적 파일 서비스
app.use(express.static(path.join(__dirname, 'public')));

// 음식점 데이터 삽입 예제
app.get('/insert', async (req, res) => {
  const restaurantData = {
    title: '오프커스',
    address: '부산시 부산진구 전포대로199번길 30 중림빌딩 1층 102호',
    time: '11:00~22:30',
    latitude: 35.15475887030011,
    longitude: 129.06364157668318
  };

  try {
    const query = 'INSERT INTO restaurants SET ?';
    const [results] = await pool.query(query, restaurantData);
    console.log('Inserted a new restaurant:', results);
    res.send('Restaurant inserted successfully.');
  } catch (error) {
    console.error('Error inserting restaurant:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 음식점 데이터 조회 예제
app.get('/restaurants', async (req, res) => {
  try {
    const query = 'SELECT * FROM restaurants';
    const [results] = await pool.query(query);
    console.log('Query results:', results);
    res.json(results);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 서버 시작 및 오류 처리
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${3000}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use. Trying another port...`);
    // 다른 포트로 시도하거나 다른 조치를 취하세요.
  } else {
    console.error('Server error:', error);
  }
});
