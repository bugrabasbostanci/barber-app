-- Script to find and fix duplicate appointments before adding unique constraint

-- 1. First, let's see what duplicates exist
SELECT 
  "staffId", 
  date, 
  "startTime", 
  COUNT(*) as duplicate_count,
  array_agg(id) as appointment_ids,
  array_agg(status) as statuses
FROM appointments 
GROUP BY "staffId", date, "startTime" 
HAVING COUNT(*) > 1
ORDER BY date DESC, "startTime";

-- 2. For each duplicate group, keep the first one and cancel others
-- This will be done row by row to be safe

-- Example of what we'll do for each duplicate:
-- UPDATE appointments 
-- SET status = 'CANCELLED', 
--     "updatedAt" = now(),
--     notes = COALESCE(notes || ' | ', '') || 'Cancelled due to duplicate booking cleanup'
-- WHERE id IN (
--   SELECT id FROM appointments 
--   WHERE "staffId" = 'specific-staff-id' 
--     AND date = 'specific-date' 
--     AND "startTime" = 'specific-time'
--     AND status != 'CANCELLED'
--   ORDER BY "createdAt" 
--   OFFSET 1  -- Keep the first one, cancel the rest
-- );

-- Note: Run the SELECT first to see duplicates, then manually handle them
-- This is safer than automated cleanup for production data