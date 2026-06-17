-- Drop function if exists to change return type
DROP FUNCTION IF EXISTS get_alerts_within_radius(double precision, double precision, double precision);

CREATE OR REPLACE FUNCTION get_alerts_within_radius(
  usr_lat double precision,
  usr_lng double precision,
  radius_meters double precision
)
RETURNS TABLE (
  id uuid,
  category risk_category,
  description text,
  status alert_status,
  latitude double precision,
  longitude double precision,
  confirmations integer,
  photo_url text,
  created_at timestamptz,
  expires_at timestamptz,
  user_id uuid,
  user_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.category,
    a.description,
    a.status,
    ST_Y(a.location::geometry) AS latitude,
    ST_X(a.location::geometry) AS longitude,
    a.confirmations,
    a.photo_url,
    a.created_at,
    a.expires_at,
    a.user_id,
    p.display_name AS user_name
  FROM alerts a
  LEFT JOIN user_profiles p ON p.id = a.user_id
  WHERE ST_DWithin(
    a.location, 
    ST_SetSRID(ST_MakePoint(usr_lng, usr_lat), 4326)::geography, 
    radius_meters
  )
  AND a.status != 'expired';
END;
$$ LANGUAGE plpgsql;
