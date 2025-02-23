import json

data2 = ""
data5 = ""
natdexdata = dict()

# Loading both 2.2 and 2.5
with open('formatted2.2.txt', 'r', encoding='utf8') as file: data2 = json.load(file)
with open('formatted2.5.txt', 'r', encoding='utf8') as file: data5 = json.load(file)

# Getting the full list of Natdex Moves
with open('natdexlearnsets.txt', 'r', encoding='utf8') as file:
    for line in file:
        splitname = line.split(':\t')
        splitmoves = splitname[1].replace('\n','').split(', ')
        natdexdata[splitname[0]] = splitmoves

# Getting Moves and organizing them (2.5)
moveList = [""] * len(data5["moves"])
for move in data5["moves"]:
    moveList[move["id"]] = move["name"]

# Getting Moves and organizing them (2.2)
moveList2 = [""] * len(data2["moves"])
for move in data2["moves"]:
    moveList2[move["id"]] = move["name"]
    
# Going through every mon and:
# Getting all moves from egg, level up, tm/hm, and tutor from both 2.2 and 2.5
# Combining every move in a set
# Creating a new set replacing the numbers with move names
# Ordering it alphabetically
# Replacing the move names with numbers once again
# Putting everything into a massive list of tutor moves, with all other move categories blank
moveSets = dict()

for pokemon in data5["species"]:
    print (pokemon["name"])
    tempSet = set()
    for move in pokemon["levelUpMoves"]:
        if (move["lv"] <= 100): tempSet.add(move["id"])
    for move in pokemon["tutor"]:
        tempSet.add(move)
    
    tempSet2 = set()
    for id in tempSet:
        tempSet2.add(moveList[id])
    moveSets[pokemon["id"]] = tempSet2

for pokemon in data2["species"]:
    tempSet = set()
    for move in pokemon["levelUpMoves"]:
        if (move["lv"] <= 100): tempSet.add(move["id"])
    for move in pokemon["tutor"]:
        tempSet.add(move)
    for move in pokemon["TMHMMoves"]:
        tempSet.add(move)
    for move in pokemon["eggMoves"]:
        tempSet.add(move)
    
    tempSet2 = set()
    for id in tempSet:
        tempSet2.add(moveList2[id])
    # Four moves that every mon gets no matter what
    tempSet2.add("Protect")
    tempSet2.add("Secret Power")
    tempSet2.add("Hidden Power")
    tempSet2.add("Substitute")
    moveSets[pokemon["id"]] = tempSet2.union(moveSets[pokemon["id"]])
    if pokemon["name"] in natdexdata.keys():
        moveSets[pokemon["id"]] = set(natdexdata[pokemon["name"]]).union(moveSets[pokemon["id"]])

print (moveList)
for id, moveset in moveSets.items():
    namedTempMoveset = list(moveset)
    namedTempMoveset.sort()
    alphabetizedMoveset = []
    for move in namedTempMoveset:
        # Exceptions for these 2 since they were removed in 2.5
        if (move == "Quick Stream" or
            move == "Lighting Strike"): continue
        newID = moveList.index(move)
        alphabetizedMoveset.append(newID)
    moveSets[id] = alphabetizedMoveset

for pokemon in data5["species"]:
    pokemon["levelUpMoves"] = []
    pokemon["tutor"] = moveSets[pokemon["id"]]

with open('gameDataV2.5.json', 'w', encoding='utf-8') as file:
    json.dump(data5, file, ensure_ascii=False, indent=2)
    