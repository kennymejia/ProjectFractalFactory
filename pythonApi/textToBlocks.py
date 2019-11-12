import os
import re
from PIL import Image, ImageDraw, ImageFont

def main(sourceFile, outputDirectory):
    text = ""

    # Get text of user source file
    with open(sourceFile, "r") as f:
        text = f.read()

    # Replace all characters but white space with block character
    text = re.sub("\S", u"\u2588", text)

    # Replace all tabs with 2 spaces because they show up in the image
    text = re.sub("[ \t]", "  ", text)

    # Get the width of the largest line and the height of the text
    textArray = text.split("\n")
    longestString = max(textArray, key=len)
    lineNumber = len(textArray)

    ######################################################################

    # Create image with black background
    img = Image.new('RGB', (1000, 1000), color = "black") # Don't make too small or else no font will do/ will have to have decimals
    d = ImageDraw.Draw(img)

    # Width and height of image
    W, H = img.size


    # Starting font size
    fontsize = 1

    # Use specified font that supports \u2588 block character
    font = ImageFont.truetype('Tests/fonts/DejaVuSans.ttf', fontsize)

    while (font.getsize(longestString)[0] < img.size[0]) and (font.getsize(longestString)[1]*lineNumber < img.size[1]):
        # iterate until the text size is just larger than the criteria
        fontsize += 1
        font = ImageFont.truetype('Tests/fonts/DejaVuSans.ttf', fontsize)

    # optionally de-increment to be sure it is less than criteria
    fontsize -= 1
    font = ImageFont.truetype('Tests/fonts/DejaVuSans.ttf', fontsize)

    w, h = d.textsize(text, font=font)

    # put the text on the image
    d.text(((W-w)/2,(H-h)/2), text, font=font, fill="white")

    #img = img.convert('1')
    img = img.resize((200, 200))

    blocksFileLocation = outputDirectory + sourceFile.split(os.sep)[-1].split(".")[0] + ".jpg"
    img.save(blocksFileLocation)

    return blocksFileLocation