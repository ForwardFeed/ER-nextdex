#!/bin/python3
from PIL import Image
from os import listdir, path, makedirs

def generate(fullpath):
    img = Image.open(fullpath)
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
    
files = listdir("./static/sprites/")
for name in files:
    generate("./static/sprites/" + name)
