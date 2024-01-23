#!/bin/python3
from PIL import Image
from os import listdir, path, makedirs

def addTransparentBackground(fullpath):
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
    img.save(fullpath)


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
            palList.append(getPaletteColors(line))
        return palList
            
'''
    Main struggle i have is how did the colors where indexed,
    the first color met linearily isn't the one indexed
'''
def reorderPaletteFromPrecedent(img, colorListExemple, colorList):
    colorListImg = indexImageColor(img)
    linearOrderedColorList = []
    for i in range(len(colorListImg)):
        #colorListImg[i]
        #print(colorListImg[i], colorListExemple[i])
        newIndex = colorListExemple.index(colorListImg[i])
        linearOrderedColorList.append(colorList[newIndex])
    return linearOrderedColorList
         

def indexImageColor(img):
    pixelMap = img.load()
    width, height = img.size
    colorList = []
    for i in range(height): 
            for j in range(width):
                r,g,b = pixelMap[j,i]
                if not (r,g,b) in colorList:
                    colorList.append((r,g,b))
    return colorList

def applyPalette(img, palette):
    applied = []
    colorList = [] ## color to replace
    width, height = img.size
    for i in range(height): 
        for j in range(width):
            r,g,b = img.getpixel((j,i))
            if not (r,g,b) in colorList:
                colorList.append((r,g,b))
            applied.append(palette[colorList.index((r,g,b))])
    return applied


def getShiny(paletteFolder, ImageFolder, imageName):

    normalPalPath = paletteFolder + imageName + ".pal"
    shinyPalPath  =  paletteFolder + "shiny_" + imageName + ".pal"
    inputImagePath = ImageFolder + imageName + ".png"
    if not path.exists(inputImagePath) or not path.exists(normalPalPath) or not path.exists(shinyPalPath):
        print('One file doesn\'t exist:', inputImagePath, normalPalPath, shinyPalPath)
        return
    img = Image.open(inputImagePath).convert('RGB')
    normalPal =  getPaletteList(normalPalPath)
    shiny =  getPaletteList(shinyPalPath)
    reorderedShiny = reorderPaletteFromPrecedent(img, normalPal, shiny)
    newImg = applyPalette(img, reorderedShiny)
    img.putdata(newImg)
    img.save(ImageFolder + "SHINY_" + imageName + ".png", format="png")

# you may uncomment from here, i just commented it because of i didn't needed it at one point
# but it's functionnal

'''files = listdir("./out/sprites/")
for name in files:
    name = name.replace('.png', '')
    try:
        getShiny("./out/palettes/", "./out/sprites/", name)
    except Exception:
        print("Couldn't get shiny of" + name)
        pass
'''
files = listdir("./static/sprites/")
for name in files:
    addTransparentBackground("./static/sprites/" + name)

