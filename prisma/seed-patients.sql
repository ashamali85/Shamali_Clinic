-- ============================================================================
-- Dr. Shamali Gastroenterology Clinic
-- Bulk-insert 10,000 random patients directly in PostgreSQL.
--
-- HOW TO RUN
--   Paste this whole file into your SQL console (Neon / Vercel / Supabase SQL
--   editor) and run it, or:  psql "<your DATABASE_URL>" -f seed-patients.sql
--
-- REQUIREMENTS
--   * The tables must already exist (run `npm run db:push` / `prisma db push`).
--   * The lookup tables must be seeded first (`npm run db:seed`) so there are
--     Areas and Nationalities to reference. This script FAILS LOUDLY if not.
--
-- WHAT IT DOES
--   * Generates gender-appropriate names.
--   * Links each patient to a real Area (whose Governorate relation is already
--     valid) and a real Nationality picked at random from the lookup tables.
--   * Builds a unique 12-digit Civil ID from the date of birth.
--   * Creates a Kuwait mobile number (+965 with a 5/6/9 prefix).
--   * Assigns sequential file numbers, continuing after any existing patients,
--     and advances the Counter so the app keeps numbering correctly afterwards.
--
-- SAFE TO RE-RUN: each run appends another 10,000 with fresh unique numbers.
-- To remove test data later:  DELETE FROM "Patient";
-- ============================================================================

DO $$
DECLARE
  v_count        int  := 10000;                        -- how many to create
  v_year         int  := EXTRACT(YEAR FROM now())::int;
  v_counter_key  text := 'patient-file:' || v_year;
  v_start        int;                                  -- file-number start offset
  v_areas        text[];
  v_nats         text[];
  v_doctor       text;
BEGIN
  -- Make sure the lookup tables are populated.
  SELECT array_agg(id) INTO v_areas FROM "Area";
  SELECT array_agg(id) INTO v_nats  FROM "Nationality";

  IF v_areas IS NULL OR array_length(v_areas, 1) IS NULL
     OR v_nats IS NULL OR array_length(v_nats, 1) IS NULL THEN
    RAISE EXCEPTION
      'Lookup tables are empty. Seed governorates/areas/nationalities first (npm run db:seed).';
  END IF;

  -- Optional: link created patients to the demo doctor if present.
  SELECT id INTO v_doctor FROM "User" WHERE username = 'doctor' LIMIT 1;

  -- Reserve a contiguous block of file numbers via the Counter, so numbering
  -- stays unique and the app continues correctly after this bulk load.
  INSERT INTO "Counter" ("key", "value")
  VALUES (v_counter_key, v_count)
  ON CONFLICT ("key") DO UPDATE SET "value" = "Counter"."value" + v_count
  RETURNING "value" - v_count INTO v_start;

  -- Build all rows in one INSERT ... SELECT over a generated series.
  INSERT INTO "Patient" (
    "id", "fileNumber",
    "firstName", "middleName", "lastName", "gender", "dateOfBirth", "nationalityId",
    "mobile1", "mobile2", "email",
    "addressLine1", "addressLine2", "areaId",
    "civilId", "paciNumber",
    "createdById", "createdAt", "updatedAt"
  )
  SELECT
    -- Prisma-style cuid-ish unique id (prefixed random string).
    'c' || substr(md5(random()::text || g::text || clock_timestamp()::text), 1, 24) AS id,

    -- Sequential file number, e.g. MGH-2026-0001. lpad here uses GREATEST so a
    -- 5-digit sequence (10000+) is never truncated to 4 characters.
    'MGH-' || v_year || '-'
      || lpad((v_start + g)::text, GREATEST(4, length((v_start + g)::text)), '0') AS "fileNumber",

    first_name,
    -- ~30% have no middle name
    CASE WHEN random() < 0.30 THEN NULL ELSE middle_name END,
    last_name,
    gender,
    dob,
    v_nats[1 + floor(random() * array_length(v_nats, 1))::int] AS "nationalityId",

    -- Kuwait mobile: +965 then 5/6/9 then 7 digits
    '+965' || (ARRAY['5','6','9'])[1 + floor(random() * 3)::int]
            || lpad(floor(random() * 10000000)::int::text, 7, '0') AS mobile1,
    CASE WHEN random() < 0.35
         THEN '+965' || (ARRAY['5','6','9'])[1 + floor(random() * 3)::int]
                     || lpad(floor(random() * 10000000)::int::text, 7, '0')
         ELSE NULL END AS mobile2,
    CASE WHEN random() < 0.70
         THEN lower(regexp_replace(first_name || '.' || last_name, '[^a-zA-Z]', '', 'g'))
              || g::text || '@'
              || (ARRAY['gmail.com','hotmail.com','live.com','yahoo.com','outlook.com'])
                   [1 + floor(random() * 5)::int]
         ELSE NULL END AS email,

    'Block ' || (1 + floor(random() * 12)::int)
      || ', Street ' || (1 + floor(random() * 40)::int)
      || ', Building ' || (1 + floor(random() * 90)::int) AS "addressLine1",
    CASE WHEN random() < 0.50
         THEN 'Floor ' || (1 + floor(random() * 20)::int)
              || ', Apt ' || (1 + floor(random() * 60)::int)
         ELSE NULL END AS "addressLine2",
    v_areas[1 + floor(random() * array_length(v_areas, 1))::int] AS "areaId",

    -- 12-digit Civil ID: century(2/3) + YYMMDD(from dob) + 4-digit serial + check
    (CASE WHEN EXTRACT(YEAR FROM dob) < 2000 THEN '2' ELSE '3' END)
      || to_char(dob, 'YYMMDD')
      || lpad((g % 10000)::text, 4, '0')
      || floor(random() * 10)::int::text AS "civilId",
    CASE WHEN random() < 0.60
         THEN (10000000 + floor(random() * 89999999)::int)::text
         ELSE NULL END AS "paciNumber",

    v_doctor,
    now(),
    now()
  FROM (
    SELECT
      g,
      gender,
      -- date of birth between 1940-01-01 and 2015-12-31
      (date '1940-01-01' + (floor(random() * 27758))::int)::timestamp AS dob,
      -- gender-appropriate first name
      CASE WHEN gender = 'MALE'
        THEN (ARRAY['Abdullah','Ahmad','Mohammed','Ali','Yousef','Khaled','Fahad',
                    'Saad','Bader','Nasser','Faisal','Salem','Hamad','Jassim','Turki',
                    'Rashed','Waleed','Talal','Mansour','Sultan','Majed','Omar','Hassan',
                    'Hussain','Ibrahim','Tariq','Adel','Sami','Raj','Anil','Suresh',
                    'Imran','Bilal','Zaid','Karim','Hadi','Marwan','Ziad'])
             [1 + floor(random() * 38)::int]
        ELSE (ARRAY['Fatima','Aisha','Maryam','Noura','Sara','Hessa','Latifa','Dana',
                    'Shaikha','Munira','Bushra','Amal','Reem','Ghada','Huda','Layla',
                    'Nada','Salma','Zainab','Rana','Dalal','Wadha','Asma','Hanan','Iman',
                    'Kholoud','Lulwa','Maha','Noor','Priya','Anjali','Farah','Yasmin',
                    'Rania','Wafa','Bibi'])
             [1 + floor(random() * 36)::int]
      END AS first_name,
      (ARRAY['A','M','S','H','K','Abdullah','Ahmad','Mohammed','Ali','Nasser','Salem',
             'Khaled','Fahad','Hamad','Jassim'])[1 + floor(random() * 15)::int] AS middle_name,
      (ARRAY['Al Shamali','Al Sabah','Al Ali','Al Ahmad','Al Mutairi','Al Ajmi',
             'Al Rashidi','Al Enezi','Al Azmi','Al Dosari','Al Hajri','Al Shammari',
             'Al Otaibi','Al Qahtani','Al Harbi','Al Fadhli','Al Kandari','Al Failakawi',
             'Al Sayegh','Al Roumi','Al Awadhi','Al Bahar','Al Ghanim','Al Sager',
             'Khan','Kumar','Sharma','Nair','Patel','Rahman','Hussain','Iqbal','Das',
             'Reddy','Menon','Fernandez','Silva','Santos'])[1 + floor(random() * 38)::int] AS last_name
    FROM (
      SELECT
        gs AS g,
        CASE WHEN random() < 0.5 THEN 'MALE' ELSE 'FEMALE' END AS gender
      FROM generate_series(1, v_count) AS gs
    ) base
  ) people;

  RAISE NOTICE 'Inserted % patients (file numbers MGH-%-% .. MGH-%-%). Total now: %',
    v_count,
    v_year, lpad((v_start + 1)::text, GREATEST(4, length((v_start + 1)::text)), '0'),
    v_year, lpad((v_start + v_count)::text, GREATEST(4, length((v_start + v_count)::text)), '0'),
    (SELECT count(*) FROM "Patient");
END $$;
