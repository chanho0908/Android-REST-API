-- init.sql

-- MySQL 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS cloudbridge_database SET utf8mb4 COLLATE utf8mb4_unicode_ci;;

-- 'chanho' 사용자 생성 및 권한 설정
CREATE USER IF NOT EXISTS 'chanho'@'%' IDENTIFIED BY '0908';
GRANT ALL PRIVILEGES ON cloudbridge_database.* TO 'chanho'@'%';
FLUSH PRIVILEGES;

-- 사용할 데이터베이스 선택
USE cloudbridge_database;


