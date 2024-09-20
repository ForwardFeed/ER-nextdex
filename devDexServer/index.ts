import { listenWebhooks } from "./src/server.js";
import { fetchChanges, initGitRepoIfDoesNotExist } from "./src/git_control.js";
import { updateData } from "./src/nextdex_controls.js";

initGitRepoIfDoesNotExist()
fetchChanges()
listenWebhooks()