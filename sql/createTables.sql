-- Need to add uuid-ossp extension to generate uuid's
--CREATE EXTENSION "uuid-ossp";

CREATE TABLE users(
   user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   user_account VARCHAR (255) NOT NULL UNIQUE, -- account identifier
   password VARCHAR (255) NOT NULL, -- Password hash or token
   account_type VARCHAR (40) NOT NULL,
   admin_flag BOOLEAN DEFAULT 'f' NOT NULL,
   last_login TIMESTAMP DEFAULT NOW() NOT NULL,
   date_added TIMESTAMP DEFAULT NOW() NOT NULL,
   date_last_updated TIMESTAMP DEFAULT NOW(),
   active_flag BOOLEAN DEFAULT 't' NOT NULL
);

CREATE TABLE paintings(
	painting_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_location VARCHAR(250),
	fractal_dimension NUMERIC(5, 3), -- Null means it needs to be calculated
	-- Metadata for painting may be null ... be aware of this on front-end
	name VARCHAR(150),
	painter VARCHAR(100),
	year_created NUMERIC(4), 
	-- End of metadata
	date_added TIMESTAMP DEFAULT NOW() NOT NULL,
    date_last_updated TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE user_source_files(
   user_source_file_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
   user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT, -- Referential integrity constraint
   file_location VARCHAR(250),
   fractal_dimension NUMERIC(5, 3), -- Null means it needs to be calculated
   date_added TIMESTAMP DEFAULT NOW() NOT NULL,
   date_last_updated TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE user_paintings(
	user_painting_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	painting_id UUID NOT NULL REFERENCES paintings(painting_id) ON DELETE RESTRICT, -- Referential integrity constraint
	user_source_file_id UUID NOT NULL REFERENCES user_source_files(user_source_file_id) ON DELETE RESTRICT, -- Referential integrity constraint
	user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT, -- Referential integrity constraint
	file_location VARCHAR(250),
	watermark_flag BOOLEAN DEFAULT 't' NOT NULL,
	date_added TIMESTAMP DEFAULT NOW() NOT NULL,
    date_last_updated TIMESTAMP DEFAULT NOW() NOT NULL
);