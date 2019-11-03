import os
import numpy as np

from skimage import io
from skimage.io import imsave
from skimage.transform import resize
from skimage.util import crop
from skimage.exposure import equalize_adapthist

from keras.models import load_model
from keras import backend as K

import gdown

from PIL import Image
from ISR.models import RDN



# Prepare image
def prepareImg(imageFilePath,
               outputImgSize):
  """Prepares some image to be an input to the encoder

  # Arguments
      imageFilePath: path to the image
      outputImgSize: size of the image the encoder expects
  """

  inputImg = np.zeros((1,outputImgSize,outputImgSize,3), dtype=np.float32)
  theimage = io.imread(imageFilePath)

  if len(theimage.shape) < 3:
    theimage = gray2rgb(theimage)

  # gets center part
  rows, cols, chs = theimage.shape
  if rows < cols:
    pixdiff = cols - rows
    theimage = crop(theimage, ((0,0), (pixdiff // 2, int(np.ceil(pixdiff/2))), (0,0)))
  elif cols < rows:
    pixdiff = rows - cols
    theimage = crop(theimage, ((pixdiff // 2, int(np.ceil(pixdiff/2))), (0,0), (0,0)))

  # resizes it
  image_resized = resize(theimage, (outputImgSize,outputImgSize,3), anti_aliasing=True)

  # enhances it
  image_enhanced = equalize_adapthist(image_resized)

  inputImg[0] = image_enhanced

  return inputImg


# Encode
def encodeImg(encoder,
            inputImg):
    """Encodes image into a latent vector

    # Arguments
        encoder: encoder model
        inputImg: the input image
    """

    z_mean, z_log_var, z = encoder.predict(inputImg, batch_size=1)

    return z_mean, z_log_var, z


# Decode
def decodeVec(decoder,
              latentVector,
              outputImgSize,
              saveArt=''):
  """Decodes a latent vector

  # Arguments
      decoder: decoder model
      latentVector: vector to decode
      outputImgSize: size of the output image
      saveArt: path and filename to use to save output
  """

  x_decoded = decoder.predict(latentVector)
  x_decoded = np.reshape(x_decoded, (outputImgSize, outputImgSize, 3))
  x_decoded = equalize_adapthist(x_decoded)
  newArt = (x_decoded * 255.0).astype(np.uint8)

  if saveArt != '':
    imsave(saveArt, newArt)

  return newArt


# BAM encode
def encodeBAM(BAMimageFilePath,
              encoder,
              encodeSize,
              useXception=False):
  """Encodes BAM image using Xception

  # Arguments
      BAMimageFilePath: path to the image
      encoder: encoder model
      encodeSize: size of the encoded BAM
      useXception: determines if Xception network should be used; otherwise, an
                   autoencoder trained over BAMs is used
  """

  if useXception:
    base_model = Xception(weights='imagenet')
    model = Model(inputs=base_model.input, outputs=base_model.get_layer('avg_pool').output)

    img = image.load_img(BAMimageFilePath, target_size=(299, 299))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)

    x_features = model.predict(x)

    xf = resize(x_features, (1, encodeSize))

    return xf, xf, xf

  inputImg = io.imread(BAMimageFilePath, as_gray=True)
  inputImg = resize(inputImg, (100,100))
  inputImg = np.reshape(inputImg, (-1, 100*100))

  z_mean, z_log_var, z = encoder.predict(inputImg, batch_size=1)

  return z_mean, z_log_var, z


def upResolution(lowResImg,
                 saveArt=''):
  """Increases the resolution of the input image by a factor of 4

  # Arguments
      lowResImg: input low resolution image
      saveArt: path and filename to use to save output
  """

  rdn = RDN(arch_params={'C':6, 'D':20, 'G':64, 'G0':64, 'x':2})
  rdn.model.load_weights('rdn-C6-D20-G64-G064-x2_ArtefactCancelling_epoch219.hdf5')

  lowResImg = rdn.predict(lowResImg)
  srImg = rdn.predict(lowResImg)
  Image.fromarray(srImg)

  if saveArt != '':
    imsave(saveArt, srImg)

  return srImg


def loadAEs(modelsPath):
  """Loads all of the encoder decoder networks

  # Arguments
      modelsPath: path to where all the mdeols are stored
  """

  if os.path.isfile(modelsPath + 'bamencoder.h5'):
    bamencoder = load_model(modelsPath + 'bamencoder.h5')
  else:
    gdown.download('https://drive.google.com/uc?id=1-4Amye8mspWMJk7Z8bo-RyapPZFbZ6L6', modelsPath + 'bamencoder.h5', quiet=False)
    bamencoder = load_model(modelsPath + 'bamencoder.h5')

  if os.path.isfile(modelsPath + 'bamdecoder.h5'):
    bamdecoder = load_model(modelsPath + 'bamdecoder.h5')
  else:
    gdown.download('https://drive.google.com/uc?id=1-7gzxzub6QKX9RRbz-1Z8cEICK3fcR8U', modelsPath + 'bamdecoder.h5', quiet=False)
    bamdecoder = load_model(modelsPath + 'bamdecoder.h5')

  if os.path.isfile(modelsPath + 'encoder.h5'):
    encoder = load_model(modelsPath + 'encoder.h5')
  else:
    gdown.download('https://drive.google.com/uc?id=1DcFDRVtt88SFq7xkUF_JXw3Aj1O-WSLg', modelsPath + 'encoder.h5', quiet=False)
    encoder = load_model(modelsPath + 'encoder.h5')

  if os.path.isfile(modelsPath + 'decoder.h5'):
    decoder = load_model(modelsPath + 'decoder.h5')
  else:
    gdown.download('https://drive.google.com/uc?id=1ndoFZ_wPM937E75Pi9n3Mq3LVJDLDY5p', modelsPath + 'decoder.h5', quiet=False)
    decoder = load_model(modelsPath + 'decoder.h5')

  return encoder, decoder, bamencoder, bamdecoder


def produceNewArt(modelsPath, imageFilePath, bamFilePath,
                artFD, bamFD, saveArt=''):
    """Produces new art given the image of an artistic piece and a BAM image

    # Arguments
        modelsPath: path where the trained models are stored
        imageFilePath: image of the input art is located
        bamFilePath: input BAM image from code
        artFD: fractal dimension of the painting/art
        bamFD: fractal dimension of the BAM image
        saveArt: path and filename to use to save output
    """

    encoder, decoder, bamencoder, bamdecoder = loadAEs(modelsPath)

    trainedImgSize = 100
    inputImg = prepareImg(imageFilePath, trainedImgSize)

    z_mean, z_log_var, z = encodeImg(encoder, inputImg)

    latentDimensions = 512
    b_mean, b_log_var, b = encodeBAM(bamFilePath, bamencoder, latentDimensions)

    #TODO: use the FD to create the rate by which the art is influenced by the
    #      code, then replace the 0.5s

    newArt = decodeVec(decoder, b*0.5 + z*0.5, trainedImgSize, saveArt)

    newArtHiRes = upResolution(newArt, "HiRes" + saveArt)

    return newArtHiRes



modelsPath = './server/python/'
imageFilePath = './server/python/painting.jpg'  # some local image of art
bamFilePath = './server/python//bam.jpg'  # some BAM image

newArtHiRes = produceNewArt(modelsPath, imageFilePath, bamFilePath,
                            artFD=0.5, bamFD=0.5, saveArt='test.png')
