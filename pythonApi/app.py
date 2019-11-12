from dotenv import load_dotenv
load_dotenv()
import os

from flask import Flask, request, send_file, after_this_request, jsonify
from werkzeug.utils import secure_filename
app = Flask(__name__)
model = None

import textToBlocks
import fractalDimension
import encoder


@app.route('/generate-bam', methods=["POST"])
def generateBam():

    # Save source file
    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join( os.getenv("USERSOURCEFILEDIRECTORY"), filename )
    file.save(filepath)

    # Create BAM
    bampath = textToBlocks.main( filepath, os.getenv("BLOCKFILEDIRECTORY") )

    # Send BAM image back
    return send_file(bampath, mimetype='image/jpg')


@app.route('/fractal-dimension', methods=["POST"])
def getFractalDimension():

    # Save image
    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join( os.getenv("BLOCKFILEDIRECTORY") if request.form['type'] == 'bam'
                             else os.getenv("PAINTINGDIRECTORY"), filename )

    file.save(filepath)

    # Get fractal dimension
    fractaldimension = fractalDimension.fractal_dimension_hausdorff(filepath)

    # Send fractal dimension back
    return jsonify(fractaldimension)


@app.route('/create-painting', methods=["POST"])
def createPainting():

    # Save bam file
    bamfile = request.files['userSourceFile']
    bamfilename = secure_filename(bamfile.filename)
    bamfilepath = os.path.join( os.getenv("BLOCKFILEDIRECTORY"), bamfilename )
    bamfile.save(bamfilepath)

    # Save painting file
    paintingfile = request.files['paintingFile']
    paintingfilename = secure_filename(paintingfile.filename)
    paintingfilepath = os.path.join( os.getenv("PAINTINGDIRECTORY"), paintingfilename )
    paintingfile.save(paintingfilepath)

    # Get fractal dimensions
    bamfd = float(request.form['userSourceFileFractalDimension'])
    paintingfd = float(request.form['paintingFractalDimension'])

    # Get user painting output path
    userpaintingfilepath = os.path.join( os.getenv("USERPAINTINGDIRECTORY"), request.form['userPaintingId']+'.png' )

    # Create painting
    encoder.produceNewArt(os.getenv("MODELDIRECTORY"), paintingfilepath, bamfilepath,
                                paintingfd, bamfd, userpaintingfilepath)

    # Send user painting back
    return send_file(userpaintingfilepath, mimetype='image/png')


# If this is the main thread of execution, first load the model and
# then start the server
if __name__ == '__main__':
    print(("* Loading Keras model and starting Flask server..."
            "Please wait until server has fully started"))
    encoder.load_models()
    app.run(debug=True)