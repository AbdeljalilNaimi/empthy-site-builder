ALTER TABLE community_posts ADD COLUMN is_admin_post boolean NOT NULL DEFAULT false;

UPDATE community_posts SET is_admin_post = true WHERE user_id = 'admin-system';