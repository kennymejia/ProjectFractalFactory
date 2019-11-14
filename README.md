# Fractal-Factory

### Description
Fractal Factory was created for the purpose of a senior capping project at Marist College.
The team that created this application consisted of five students: Brandon Kline, Candice Rivera, Eric Stenton,
Kenny Mejia, and Jada Tijani while under the supervision of Dr.Pablo Rivas, an Assistant Professor of Computer
Science. The goal was to create a service that allows users to upload source code that our application will
turn into an image of blocks, calculate its fractal dimension, and match it with an existing painting in our database.
Once a match is found a new painting would be produced in the style of the painting that it was matched with.
You only need about 100 lines of code to try it out, we hope you enjoy our application!

## Getting Started

### Prerequisites
* Node.js version 12.11.1
* NPM version 6.11.3
* PM2 latest
* Python 3 (Required packages listed during installation)
* Git


### Installing
1. Clone master branch to machine
2. Place pythonApi file onto machine that will run the neural network API
3. Install the following python packages on API machine: numpy, scikit-image, keras, gdown, pillow, ISR, imageio, matplotlib, flask, python-dotenv
4. Run 'npm install' from command line in main Fractal-Factory application root directory

### Database (Postgres)
1. Create a database and user for the application
2. Edit pg_hba.conf file to allow application to connect to database
3. Run SQL create statements provided in the 'sql' folder (Make sure to uncomment uuid plugin installation at top for first time run)

### Running
1. Create .env file with provided example '.env.example' for both main application and flask API
2. Run 'pm2 start ./server/fractalFactory.js' from command line in application root directory
3. Run 'python3 app.py' to start flask API on python machine in application directory
4. Fill database with paintings from Metropolitan Museum of Art API by running 'npm run addPaintings (number)' where number is the number of desired paintings to be retrieved

## Authors
* Jada Tijani (IS)
    * [LinkedIn](https://www.linkedin.com/in/jadatijani/)
    * [Github](https://github.com/jadatijani)
* Candice Rivera (CS)
    * [LinkedIn](https://www.linkedin.com/in/candice-rivera-406283161/)
    * [Github](https://github.com/Zriveracandice2019)
* Eric Stenton (CS)
    * [LinkedIn](https://www.linkedin.com/in/eric-stenton/)
    * [Github](https://www.github.com/StentonRR)
* Kenny Mejia (CS)
    * [LinkedIn](https://www.linkedin.com/in/mejia-kenny/)
    * [Github](https://github.com/kennymejia)
* Brandon Kline (IT)
    * [LinkedIn](https://www.linkedin.com/in/brandon-kline-792705176/)
    * [Github](https://github.com/brandon-kline)

## Acknowledgements
* Pablo Rivas -- Oversaw Capping project development and created autoencoder neural network
* Ron Coleman -- Author of original research in calculating fractal dimensions of programming code converted into BAM or blocked images