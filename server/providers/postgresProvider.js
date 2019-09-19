const { Pool } = require('pg')
const configurationController = require('../controllers/configurationController.js');
const logController = require('../controllers/logController.js');


const pool = new Pool({
  host: configurationController.configurationVariables.dbhost,
  database: configurationController.configurationVariables.dbname,
  user: configurationController.configurationVariables.dbuser,
  password: configurationController.configurationVariables.dbpassword,
  port: configurationController.configurationVariables.dbport,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})


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

  query: async sql => {
    try{
		let client = await pool.connect();
		let res = await client.query(sql);

		client.release();

		return res;
		
    }catch(e){
		logController.logger.error(e);
    }
  }
  
}
