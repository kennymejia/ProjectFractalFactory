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

    getUserByUsername: async username => {
        try {
            let result = await module.exports.query(`SELECT * FROM users 
                                           WHERE account_type = 'default' AND user_account = $1`, [username]);
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

    getUserById: async id => {
        try {
            let result = await module.exports.query(`SELECT * FROM users 
                                               WHERE account_type = 'default' AND user_id = $1`, [id]);
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

    getUserPaintingIds: async id => {
	    try {
            let result = await module.exports.query(`SELECT user_painting_id FROM user_paintings 
                                               WHERE user_id = $1`, [id]);
            return result.rows;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    getUserPaintingLocation: async (user_id, user_painting_id) => {
        try {
            let result = await module.exports.query(`SELECT file_location FROM user_paintings 
                                               WHERE user_id = $1 AND user_painting_id = $2`,
                                    [user_id, user_painting_id]);

            return result.rows[0].file_location;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    getPaintingIds: async (fractalDimension) => {
        try {
            let result = await module.exports.query(`SELECT painting_id FROM paintings 
                                               WHERE user_id = $1 AND user_painting_id = $2`,
                [user_id, user_painting_id]);

            return result.rows[0].file_location;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    getPaintingLocation: async (user_id, user_painting_id) => {
        try {
            let result = await module.exports.query(`SELECT file_location FROM user_paintings 
                                               WHERE user_id = $1 AND user_painting_id = $2`,
                [user_id, user_painting_id]);

            return result.rows[0].file_location;
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
                                   VALUES ($1, $2, $3)`, [userAccount, password, accountType]);
            return result;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    addUserPainting: async (userId, paintingId, userSourceFileId) => {
        try {
            // Create user in database...prepared statement for sanitation
            let result = await module.exports.query(`INSERT INTO user_paintings (user_id, painting_id, user_source_file_id)
                                   VALUES ($1, $2, $3)`, [userId, paintingId, userSourceFileId]);
            return result;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    }
}
