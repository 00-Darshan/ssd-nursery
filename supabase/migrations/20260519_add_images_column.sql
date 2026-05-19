-- Add images array column to plants table for multi-image gallery support.
-- The existing image_url column is kept as the primary/first image for
-- backward compatibility. The images column stores all gallery image URLs.

ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';
