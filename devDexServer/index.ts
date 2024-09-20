import { startServer } from "./src/server.js";
import { fetchChanges, initGitRepoIfDoesNotExist, setRemoteUrl } from "./src/git_control.js";
import { updateData } from "./src/nextdex_controls.js";

initGitRepoIfDoesNotExist(function(){
    setRemoteUrl(fetchChanges)
    startServer()
})
