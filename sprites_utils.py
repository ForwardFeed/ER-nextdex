#!/bin/python3
from PIL import Image
from os import listdir, path, makedirs

def addTransparentBackground(fullpath):
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
    
def getShiny(palettePath, ImageFolder, imageName):
    if not path.exists(palettePath):
            return
    with open(palettePath, 'r') as palFile:
        lNumber = 0
        palList = []
        for line in palFile:
            lNumber = lNumber + 1
            line = line.rstrip()
            # header stuff, don't verify it
            if lNumber <= 3:
                continue
            palList.append(getPaletteColors(line))
        colorList = []
        inputImagePath = ImageFolder + imageName + ".png"
        if not path.exists(inputImagePath):
            return
        img = Image.open(inputImagePath).convert('RGB')
        pixel_map = img.load()
        new_image = []
        width, height = img.size
        for j in range(height): 
            for i in range(width):
                r,g,b = pixel_map[i,j]

                if not (r,g,b) in colorList:
                    colorList.append((r,g,b))
                new_image.append(palList[colorList.index((r,g,b))])
        
        img.putdata(new_image)
        img.save(ImageFolder + "SHINY_" + imageName + ".png", format="png")

# you may uncomment from here, i just commented it because of i didn't needed it at one point
# but it's functionnal
        
files = listdir("./static/sprites/")
for name in files:
    addTransparentBackground("./static/sprites/" + name)
'''
files = listdir("./out/sprites/")
for name in files:
    name = name.replace('.png', '')
    getShiny("./out/palettes/" + name + ".pal", "./static/sprites/", name)'''