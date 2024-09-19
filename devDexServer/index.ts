import { listenWebhooks } from "./src/webhooks.js";
import { initGitRepoIfDoesNotExist } from "./src/git_control.js";
import { updateData } from "./src/nextdex_controls.js";


updateData()

//initGitRepoIfDoesNotExist()
//listenWebhooks()