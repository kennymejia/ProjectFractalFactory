import sys
import numpy as np
import pylab as pl
import imageio

def rgb2gray(rgb):
    r, g, b = rgb[:,:,0], rgb[:,:,1], rgb[:,:,2]
    gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
    return gray

# Minkowski–Bouligand Dimension
def fractal_dimension_minkowski_bouligand(Z, threshold=0.9):
    # Prepare image
    imageArray = imageio.imread(Z)

    if (len(imageArray.shape) == 3):
        Z = rgb2gray(imageArray)

        # Only for 2d image
        assert(len(Z.shape) == 2)

        # From https://github.com/rougier/numpy-100 (#87)
        def boxcount(Z, k):
            S = np.add.reduceat(
                np.add.reduceat(Z, np.arange(0, Z.shape[0], k), axis=0),
                                   np.arange(0, Z.shape[1], k), axis=1)

            # We count non-empty (0) and non-full boxes (k*k)
            return len(np.where((S > 0) & (S < k*k))[0])

        # Transform Z into a binary array
        Z = (Z < threshold)

        # Minimal dimension of image
        p = min(Z.shape)

        # Greatest power of 2 less than or equal to p
        n = 2**np.floor(np.log(p)/np.log(2))

        # Extract the exponent
        n = int(np.log(n)/np.log(2))

        # Build successive box sizes (from 2**n down to 2**1)
        sizes = 2**np.arange(n, 1, -1)

        # Actual box counting with decreasing size
        counts = []
        for size in sizes:
            counts.append(boxcount(Z, size))

        # Fit the successive log(sizes) with log (counts)
        coeffs = np.polyfit(np.log(sizes), np.log(counts), 1)
        return -coeffs[0]

def fractal_dimension_hausdorff(image):
    # Prepare image
    imageArray = imageio.imread(image)

    if (len(imageArray.shape) == 3):
        # Prepare image
        image = rgb2gray(imageArray)

        # finding all the non-zero pixels
        pixels=[]
        for i in range(image.shape[0]):
            for j in range(image.shape[1]):
                if image[i,j]>0:
                    pixels.append((i,j))

        Lx=image.shape[1]
        Ly=image.shape[0]
        pixels=pl.array(pixels)

        # computing the fractal dimension
        #considering only scales in a logarithmic list
        scales=np.logspace(0.01, 1, num=10, endpoint=False, base=2)
        Ns=[]
        # looping over several scales
        for scale in scales:
            # computing the histogram
            H, edges=np.histogramdd(pixels, bins=(np.arange(0,Lx,scale),np.arange(0,Ly,scale)))
            Ns.append(np.sum(H>0))

        # linear fit, polynomial of degree 1
        coeffs=np.polyfit(np.log(scales), np.log(Ns), 1)

        return -coeffs[0] #the fractal dimension is the OPPOSITE of the fitting coefficient