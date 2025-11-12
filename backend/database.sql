-- Create Database
CREATE DATABASE IF NOT EXISTS store_rating_db;
USE store_rating_db;

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(400) NOT NULL,
  role INT NOT NULL COMMENT '1=Admin, 2=Normal User, 3=Store Owner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- -----------------------------------------------------
-- Table `stores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  address VARCHAR(400) NOT NULL,
  owner_id INT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Table `ratings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
  user_id INT NOT NULL,
  store_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, store_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Initial Admin User (Default Password: AdminPassword!123)
-- -----------------------------------------------------
-- You should hash this password manually or register an admin via the API 
-- after the server is running. For immediate testing, you may insert directly.
-- WARNING: This is placeholder, real deployment requires hashing this password.

-- Example: Insert a System Administrator (Role 1)
-- INSERT INTO users (name, email, password, address, role) 
-- VALUES ('System Administrator', 'admin@example.com', '$2a$10$tT1d7YqfB8P7R.R/q9wPz.O/V8p1yG5fC9e9gX1k7y3K8F0W9/h8X', 'Admin HQ, Earth', 1); 
-- (The hash above is for 'AdminPassword!123')

-- Example: Insert a Store Owner (Role 3) and corresponding store
-- INSERT INTO users (name, email, password, address, role) 
-- VALUES ('Store Owner A', 'owner@example.com', '$2a$10$tT1d7YqfB8P7R.R/q9wPz.O/V8p1yG5fC9e9gX1k7y3K8F0W9/h8X', '123 Store Lane', 3);
-- SET @owner_id = LAST_INSERT_ID();
-- INSERT INTO stores (name, email, address, owner_id) 
-- VALUES ('The Demo Store', 'store@demo.com', '456 Retail Blvd', @owner_id);