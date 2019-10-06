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
