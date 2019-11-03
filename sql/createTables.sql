-- Need to add uuid-ossp extension to generate uuid's
--CREATE EXTENSION "uuid-ossp";

CREATE TABLE users(
   user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   user_account TEXT NOT NULL UNIQUE, -- account identifier
   password TEXT, -- Password hash or token
   first_name TEXT NOT NULL,
   last_name TEXT,
   email TEXT NOT NULL,
   account_type TEXT NOT NULL,
   admin_flag BOOLEAN DEFAULT 'f' NOT NULL,
   last_login TIMESTAMPTZ DEFAULT NOW() NOT NULL,
   date_added TIMESTAMPTZ DEFAULT NOW() NOT NULL,
   date_last_updated TIMESTAMPTZ DEFAULT NOW(),
   active_flag BOOLEAN DEFAULT 't' NOT NULL
);

CREATE TABLE paintings(
	painting_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_location TEXT,
	fractal_dimension NUMERIC, -- Null means it needs to be calculated
	-- Metadata for painting may be null ... be aware of this on front-end
	name TEXT,
	painter TEXT,
	year_created TEXT,
	-- End of metadata
	date_added TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    date_last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE user_source_files(
   user_source_file_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
   user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT, -- Referential integrity constraint
   file_location TEXT,
   blocks_file_location TEXT,
   fractal_dimension NUMERIC, -- Null means it needs to be calculated
   date_added TIMESTAMPTZ DEFAULT NOW() NOT NULL,
   date_last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE user_paintings(
	user_painting_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	painting_id UUID NOT NULL REFERENCES paintings(painting_id) ON DELETE RESTRICT, -- Referential integrity constraint
	user_source_file_id UUID NOT NULL REFERENCES user_source_files(user_source_file_id) ON DELETE RESTRICT, -- Referential integrity constraint
	user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT, -- Referential integrity constraint
	file_location TEXT,
	watermark_flag BOOLEAN DEFAULT 't' NOT NULL,
	date_added TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    date_last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);