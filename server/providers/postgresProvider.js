const dotenv = require('dotenv');
dotenv.config();

const { Pool } = require('pg')
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

    getUserPaintingsInfo: async id => {
	    try {
            let result = await module.exports.query(`SELECT * FROM user_paintings 
                                               WHERE user_id = $1`, [id]);
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    addUser: async (userAccount, password, accountType) => {
        try {
            // Create user in database...prepared statement for sanitation
            await provider.query(`INSERT INTO users (user_account, password, account_type)
                                   VALUES ($1, $2, $3)`, [userAccount, password, accountType]);
        } catch(e) {
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
  }
  
}
