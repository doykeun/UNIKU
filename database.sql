CREATE DATABASE IF NOT EXISTS daystore;

USE daystore;

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY, -- Invoice ID (e.g. GJ...)
    phone VARCHAR(20) NOT NULL,
    game_name VARCHAR(50) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    status ENUM('Success', 'Waiting', 'Pending') DEFAULT 'Waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dummy Data
INSERT INTO transactions (id, phone, game_name, item_name, price, status, created_at) VALUES
('DS7908389521', '08389876521', 'Mobile Legends', '45 Diamonds', 20326, 'Success', NOW()),
('DS7608389521', '08389876521', 'Free Fire', '50 Diamonds', 21203, 'Waiting', NOW()),
('DS8708124872', '08124567872', 'Mobile Legends', '10 Diamonds', 26486, 'Success', NOW() - INTERVAL 5 HOUR);
