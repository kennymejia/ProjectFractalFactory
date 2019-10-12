const dotenv = require('dotenv');
dotenv.config();

const { Pool } = require('pg');
const logController = require('../controllers/logController.js');


const pool = new Pool({
  host: process.env.DBHOST,
  database: process.env.DBNAME,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  port: process.env.DBPORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});


module.exports = {

	test: async () => {
		try{
			let client = await pool.connect();
			let res = await client.query('SELECT NOW()');
			
			client.release();
			
			return res;
			
		}catch(e){
            console.log(e);
			logController.logger.error(e);
		}
  },

    query: async (sql, parameters) => {
        try{
            let client = await pool.connect();
            let res = await client.query(sql, parameters);

            client.release();

            return res;

        }catch(e){
            console.log(e);
            logController.logger.error(e);
        }
    },

    ////////////////////// Get Data //////////////////////

    getUserByAccount: async userAccount => {
        try {
            let result = await module.exports.query(`SELECT * FROM users 
                                           WHERE account_type = 'default' AND user_account = $1`,
                                [userAccount]);
            if (!result.rows) {
                return null;
            } else {
                return result.rows[0];
            }
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    getUserById: async userId => {
        try {
            let result = await module.exports.query(`SELECT * FROM users 
                                               WHERE account_type = 'default' AND user_id = $1`, [userId]);
            if (!result.rows) {
                return null;
            } else {
                return result.rows[0];
            }
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    getUserPaintingIds: async userId => {
	    try {
            let result = await module.exports.query(`SELECT user_painting_id FROM user_paintings 
                                               WHERE user_id = $1`, [userId]);
            return result.rows;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    getUserPaintingLocation: async (userId, userPaintingId) => {
        try {
            let result = await module.exports.query(`SELECT file_location FROM user_paintings 
                                               WHERE user_id = $1 AND user_painting_id = $2`,
                                    [userId, userPaintingId]);

            if (result.rows){
                return result.rows[0].file_location;
            } else {
                return null;
            }

        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    // Limit set in environment configuration -- get paintings closest to given fractal dimension
    getPaintingIds: async fractalDimension => {
        try {
            let result = await module.exports.query(`SELECT painting_id
                                               FROM paintings ORDER BY ABS(fractal_dimension - $1) 
                                               LIMIT ${process.env.TOPPAINTINGNUMBER}`,
                                    [fractalDimension]);
            return result.rows;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    getPaintingLocation: async paintingId => {
        try {
            let result = await module.exports.query(`SELECT file_location FROM paintings 
                                               WHERE painting_id = $1`,
                                    [paintingId]);

            if (result.rows){
                return result.rows[0].file_location;
            } else {
                return null;
            }
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    getUserSourceFileIds: async userId => {
        try {
            let result = await module.exports.query(`SELECT user_source_file_id
                                               FROM user_source_files WHERE user_id = $1`,
                                    [userId]);
            return result.rows;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    getUserSourceFileLocation: async userSourceFileId => {
        try {
            let result = await module.exports.query(`SELECT file_location FROM user_source_files 
                                               WHERE user_source_file_id = $1`,
                                    [userSourceFileId]);

            if (result.rows){
                return result.rows[0].file_location;
            } else {
                return null;
            }
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    ////////////////////// Add Data //////////////////////

    addUser: async (userAccount, password, accountType) => {
        try {
            // Create user in database...prepared statement for sanitation
            let result = await module.exports.query(`INSERT INTO users (user_account, password, account_type)
                                               VALUES ($1, $2, $3)`,
                                    [userAccount, password, accountType]);
            return result;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    addUserPainting: async (userId, paintingId, userSourceFileId, fileLocation) => {
        try {
            let result = await module.exports.query(`INSERT INTO user_paintings
                                               (user_id, painting_id, user_source_file_id, file_location)
                                               VALUES ($1, $2, $3, $4)`,
                                    [userId, paintingId, userSourceFileId, fileLocation]);
            return result;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    addPainting: async (fileLocation, fractalDimension, name, painter, yearCreated) => {
        try {
            let result = await module.exports.query(`INSERT INTO paintings
                                               (file_location, fractal_dimension, name, painter, year_created)
                                               VALUES ($1, $2, $3, $4, $5)`,
                                    [fileLocation, fractalDimension, name, painter, yearCreated]);
            return result;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    addUserSourceFile: async (userId, fileLocation, fractalDimension) => {
        try {
            let result = await module.exports.query(`INSERT INTO user_source_files
                                               (user_id, file_location, fractal_dimension)
                                               VALUES ($1, $2, $3)`,
                                    [userId, fileLocation, fractalDimension]);
            return result;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    }

}

//