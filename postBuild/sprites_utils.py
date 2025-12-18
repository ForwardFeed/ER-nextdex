#!/bin/python3
from PIL import Image
from os import listdir, path, makedirs
import re

def addTransparentBackground(fullpath, newPath):
    if not path.exists(fullpath):
        print('couldn\'t find ' + fullpath)
        return
    img = Image.open(fullpath)
    #sometimes you need to do that because the front is mixed with front anim
    img = img.crop((0, 0, 64, 64)) 
    # add a transparency layer
    img = img.convert("RGBA")
    datas = img.getdata()
    newData = []
    # the first pixel is considered the transparency color
    trns = datas[0]
    for item in datas:
        if item == trns:
            # replace by a transparent pixel
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(newPath)


def getPaletteColors(line):
    colors = line.split(' ')
    red = int(colors[0])
    green = int(colors[1])
    blue = int(colors[2])
    return (red, green, blue)

def getPaletteList(filepath):
    if not path.exists(filepath):
        return
    with open(filepath, 'r') as palFile:
        lNumber = 0
        palList = []
        for line in palFile:
            lNumber += 1
            # line 3 has the number of colors in the palette, here 16
            if lNumber <= 3: 
                    continue
            for c in line.strip("\n").split(' '):
                palList.append(int(c))

        return palList

def applyPalette(inputImagePath, inputPaletteFile, outputImagePath):
    img = Image.open(inputImagePath)
    img.putpalette(getPaletteList(inputPaletteFile))
    img.save(outputImagePath, format="png")

# the .png isn't accurate, sometimes the palette differs
def getNormal(paletteFolder, ImageFolder, imageName):
    normalPalPath = paletteFolder + imageName + ".pal"
    inputImagePath = ImageFolder + imageName + ".png"
    if not path.exists(inputImagePath) or not path.exists(normalPalPath):
        print('One file doesn\'t exist:', inputImagePath, normalPalPath)
        return
    outputImagePath = ImageFolder + imageName + ".png"
    applyPalette(inputImagePath, normalPalPath, outputImagePath)

def getShiny(paletteFolder, ImageFolder, imageName):
    shinyPalPath  =  paletteFolder + "shiny_" + imageName + ".pal"
    inputImagePath = ImageFolder + imageName + ".png"
    if not path.exists(inputImagePath) or not path.exists(shinyPalPath):
        print('One file doesn\'t exist:', inputImagePath, shinyPalPath)
        return
    outputImagePath = ImageFolder + "SHINY_" + imageName + ".png"
    applyPalette(inputImagePath, shinyPalPath, outputImagePath)
    return

# todo fix this one
#getShiny("./static/js/data/palettes/", "./static/js/data/sprites/", "PANGORO")
files = listdir("./static/js/data/sprites/")
shinyRegex = re.compile('SHINY_')
for name in files:
    # do not shiny the shynies
    if shinyRegex.match(name):
        continue
    name = name.replace('.png', '')
    try:
        getShiny("./static/js/data/palettes/", "./static/js/data/sprites/", name)
        getNormal("./static/js/data/palettes/", "./static/js/data/sprites/", name)
    except Exception as e: 
        print("Couldn't get shiny of " + name + ", reason: " + str(e))
        pass

files = listdir("./static/js/data/sprites/")
for name in files:
    addTransparentBackground("./static/js/data/sprites/" + name, "./static/sprites/" + name)