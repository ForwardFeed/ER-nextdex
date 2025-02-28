import json
from copy import deepcopy

def returnSortedList(toSort,moveList,index):
    toSort = sorted(toSort, key=lambda x: x[index])

if __name__ == "__main__":
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
        if move["prio"] == 0: move["prio"] = 101 # Guaranteed hit moves should be at the top
        moveList[move["id"]] = [move["name"], move["pwr"], move["acc"], move["prio"]]

    # Getting Moves and organizing them (2.2)
    moveList2 = [""] * len(data2["moves"])
    for move in data2["moves"]:
        moveList2[move["id"]] = move["name"]
    
    # Now that we have the natdex learnsets
        
    # Going through every mon and:
    # Getting all moves from egg, level up, tm/hm, and tutor from both 2.2 and 2.5
    # Combining every move in a set
    # Creating a new set replacing the numbers with move names
    # Ordering it alphabetically
    # Replacing the move names with numbers once again
    # Putting everything into a massive list of tutor moves, with all other move categories blank
    moveSets = dict()

    for pokemon in data5["species"]:
        # print(f"{pokemon["name"]}: {pokemon["id"]}")
        tempSet = set()
        for move in pokemon["levelUpMoves"]:
            if (move["lv"] <= 100): tempSet.add(move["id"])
            else: print(f"{pokemon["name"]} can't learn {move["id"]}.")
        for move in pokemon["tutor"]:
            tempSet.add(move)
        
        tempSet2 = set()
        for id in tempSet:
            tempSet2.add(moveList[id][0])
        moveSets[pokemon["id"]] = tempSet2
        
        if pokemon["name"] in natdexdata.keys():
            moveSets[pokemon["id"]] = set(natdexdata[pokemon["name"]]).union(moveSets[pokemon["id"]])
        """else:
            print(f"Cant find {pokemon["name"]}.")"""

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
            
    # Edge Cases for Partner Pokemon   
    moveSets[1852] = moveSets[1852].union(moveSets[25]) # Pikachu
    moveSets[1854] = moveSets[1854].union(moveSets[52]) # Meowth   
    moveSets[1853] = moveSets[1853].union(moveSets[133]) # Eevee  
    moveSets[1857] = moveSets[1857].union(moveSets[884]) # Duraludon  
    moveSets[1859] = moveSets[1859].union(moveSets[926]) # Fidough    

    # Standard Alphabetical
    for id, moveset in moveSets.items():
        namedTempMoveset = list(moveset)
        namedTempMoveset.sort()
        alphabetizedMoveset = []
        for move in namedTempMoveset:
            # Exceptions for these 2 since they were removed in 2.5
            if (move == "Quick Stream" or
                move == "Lighting Strike"): continue
            newID = 0
            # Wrote a for loop because the find functions were annoying me
            for move2 in moveList:
                if (move2[0] != move): newID += 1
                else: break
            alphabetizedMoveset.append(newID)
        moveSets[id] = alphabetizedMoveset

    for pokemon in data5["species"]:
        pokemon["levelUpMoves"] = []
        pokemon["tutor"] = moveSets[pokemon["id"]]

    with open('gameDataV2.5.json', 'w', encoding='utf-8') as file:
        json.dump(data5, file, ensure_ascii=False, indent=2)
        print("Finished standard sorting in gameDataV2.5.json.")
    
    alphabetizedMoveset = dict()
    for id, moveset in moveSets.items():
        tempMoveset = list()
        for move in moveset:
            tempMoveset.append(moveList[move])
        alphabetizedMoveset[id] = tempMoveset
    
    bpMovesets = dict()
    accMovesets = dict()
    prioMovesets = dict()
    
    # Sorted by Base Power
    for id, moveset in alphabetizedMoveset.items():
        tempMoveset = sorted(moveset, key=lambda x: x[1], reverse=True)
        newMoveset = list()
        for move in tempMoveset:
            newID = moveList.index(move)
            newMoveset.append(newID)
        moveSets[id] = newMoveset
    
    for pokemon in data5["species"]:
        pokemon["levelUpMoves"] = []
        pokemon["tutor"] = moveSets[pokemon["id"]]

    with open('gameDataV2.2.json', 'w', encoding='utf-8') as file:
        json.dump(data5, file, ensure_ascii=False, indent=2)
        print("Finished base power sorting in gameDataV2.2.json.")
    
    # Sorted by Accuracy
    for id, moveset in alphabetizedMoveset.items():
        tempMoveset = sorted(moveset, key=lambda x: x[2], reverse=True)
        newMoveset = list()
        for move in tempMoveset:
            newID = moveList.index(move)
            newMoveset.append(newID)
        moveSets[id] = newMoveset
    
    for pokemon in data5["species"]:
        pokemon["levelUpMoves"] = []
        pokemon["tutor"] = moveSets[pokemon["id"]]

    with open('gameDataV2.1.json', 'w', encoding='utf-8') as file:
        json.dump(data5, file, ensure_ascii=False, indent=2)
        print("Finished accuracy sorting in gameDataV2.1.json.")
    
    
    # Sorted by Priority
    for id, moveset in alphabetizedMoveset.items():
        tempMoveset = sorted(moveset, key=lambda x: x[3], reverse=True)
        newMoveset = list()
        for move in tempMoveset:
            newID = moveList.index(move)
            newMoveset.append(newID)
        moveSets[id] = newMoveset
    
    for pokemon in data5["species"]:
        pokemon["levelUpMoves"] = []
        pokemon["tutor"] = moveSets[pokemon["id"]]

    with open('gameDataVBeta2.1.json', 'w', encoding='utf-8') as file:
        json.dump(data5, file, ensure_ascii=False, indent=2)
        print("Finished priority sorting in gameDataVBeta2.1.json.")
    