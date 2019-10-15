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

    getPaintingMetadata: async paintingId => {
        try {
            let result = await module.exports.query(`SELECT name, painter, year_created FROM paintings 
                                                    WHERE painting_id = $1`,
                                         [paintingId]);

            return result.rows[0] || {};
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

    getUserSourceFileFractalDimension: async userSourceFileId => {
        try {
            let result = await module.exports.query(`SELECT fractal_dimension FROM user_source_files 
                                               WHERE user_source_file_id = $1`,
                                    [userSourceFileId]);

            return result.rows[0].fractal_dimension || 1; // If no fractal dimension, default to 1

        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    getHeatmapData: async () => {
        try {
            let result = await module.exports.query(`SELECT date_added FROM user_source_files ORDER BY date_added`);

            // Get number of rows occurring in specified hours within a week period
            let totalHours = {};
            let cnt = 0;
            for(let d=0; d<7; d++){
                for (let h=0; h<24; h++) {
                    totalHours[cnt] = 0;
                    cnt++;
                }
            }

            let day;
            let hour;
            for (let row of result.rows) {
                day = row.date_added.getDay();
                hour = row.date_added.getHours();
                totalHours[(day*24) + hour] = totalHours[(day*24) + hour] + 1;
            }

            // Format dates as day, hour, and # of occurrences
            let dataUseAll =[];
            cnt = 0;
            for(let d=0; d<7; d++){
                for (let h=0; h<24; h++) {
                    dataUseAll.push({day: d+1, hour: h+1, value: totalHours[cnt]});
                    cnt++;
                }
            }

            // Clear object
            totalHours = {};
            cnt = 0;
            for(let d=0; d<7; d++){
                for (let h=0; h<24; h++) {
                    totalHours[cnt] = 0;
                    cnt++;
                }
            }

            // Get rows that were added in the past week
            result = await module.exports.query(`SELECT date_added FROM user_source_files
                                          WHERE date_added > NOW() - interval '7 days'
                                          ORDER BY date_added`);

            day;
            hour;
            for (let row of result.rows) {
                day = row.date_added.getDay();
                hour = row.date_added.getHours();
                totalHours[(day*24) + hour] = totalHours[(day*24) + hour] + 1;
            }

            // Format dates as day, hour, and # of occurrences for last 7 days
            let dataUseWeek =[];
            cnt = 0;
            for(let d=0; d<7; d++){
                for (let h=0; h<24; h++) {
                    dataUseWeek.push({day: d+1, hour: h+1, value: totalHours[cnt]});
                    cnt++;
                }
            }

            return [dataUseAll, dataUseWeek];
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    getStatistics: async () => {
        try {
            let statistics = {"Total Users": 0,
                              "Total User Paintings": 0,
                              "Total Paintings": 0,
                              "Total User Source Files": 0};

            let result;
            result = await module.exports.query('SELECT COUNT(*) FROM users');
            statistics["Total Users"] = result.rows[0].count;

            result = await module.exports.query('SELECT COUNT(*) FROM user_paintings');
            statistics["Total User Paintings"] = result.rows[0].count;

            result = await module.exports.query('SELECT COUNT(*) FROM paintings');
            statistics["Total Paintings"] = result.rows[0].count;

            result = await module.exports.query('SELECT COUNT(*) FROM user_source_files');
            statistics["Total User Source Files"] = result.rows[0].count;

            return statistics;
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
                                               VALUES ($1, $2, $3) RETURNING user_id`,
                                    [userAccount, password, accountType]);
            return result.rows[0].user_id;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    addUserPainting: async (userId, paintingId, userSourceFileId) => {
        try {
            let result = await module.exports.query(`INSERT INTO user_paintings
                                               (user_id, painting_id, user_source_file_id)
                                               VALUES ($1, $2, $3) RETURNING user_painting_id`,
                                    [userId, paintingId, userSourceFileId]);
            return result.rows[0].user_painting_id;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    addPainting: async (fractalDimension, name, painter, yearCreated) => {
        try {
            let result = await module.exports.query(`INSERT INTO paintings
                                               (fractal_dimension, name, painter, year_created)
                                               VALUES ($1, $2, $3, $4) RETURNING painting_id`,
                                    [fractalDimension, name, painter, yearCreated]);
            return result.rows[0].painting_id;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    addUserSourceFile: async (userId) => {
        try {
            let result = await module.exports.query(`INSERT INTO user_source_files
                                               (user_id)
                                               VALUES ($1) RETURNING user_source_file_id`,
                                    [userId]);
            return result.rows[0].user_source_file_id;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    ////////////////////// Update Data //////////////////////

    updatePaintingFileLocation: async (paintingId, fileLocation) => {
        try {
            let result = await module.exports.query(`UPDATE paintings SET file_location = $1,
                                                    date_last_updated = NOW()
                                                    WHERE painting_id = $2`,[fileLocation, paintingId]);
            return result;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    updateUserSourceFileLocation: async (userSourceFileId, fileLocation) => {
        try {
            let result = await module.exports.query(`UPDATE user_source_files SET file_location = $1,
                                                    date_last_updated = NOW()
                                                    WHERE user_source_file_id = $2`,
                                         [fileLocation, userSourceFileId]);
            return result;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    updateUserSourceFractalDimension: async (userSourceFileId, fractalDimension) => {
        try {
            let result = await module.exports.query(`UPDATE user_source_files SET fractal_dimension = $1,
                                                    date_last_updated = NOW()
                                                    WHERE user_source_file_id = $2`,
                [fractalDimension, userSourceFileId]);
            return result;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    updateLoginDate: async (userId) => {
        try {
            let result = await module.exports.query(`UPDATE users SET last_login = NOW(),
                                                    date_last_updated = NOW()
                                                    WHERE user_id = $1`,[userId]);
            return result;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    }
};