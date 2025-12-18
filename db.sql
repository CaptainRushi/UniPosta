-- Create a table for social posts
CREATE TABLE social_posts (
  id SERIAL PRIMARY KEY,
  social_network VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  schedule_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for tweets
CREATE TABLE tweets (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  schedule_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for facebook posts
CREATE TABLE facebook_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  schedule_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for instagram posts
CREATE TABLE instagram_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  schedule_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for linkedin posts
CREATE TABLE linkedin_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  schedule_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for pinterest posts
CREATE TABLE pinterest_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  schedule_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for reddit posts
CREATE TABLE reddit_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  schedule_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for snapchat posts
CREATE TABLE snapchat_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  schedule_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for tiktok posts
CREATE TABLE tiktok_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  schedule_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for youtube posts
CREATE TABLE youtube_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  schedule_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
