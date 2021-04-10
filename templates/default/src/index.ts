import env from "dotenv";
env.config();

import launcherImplementation from "../launcherImplementation.json";
import { launch } from "@quick-qui/launcher";
import { Implementation } from "@quick-qui/model-defines";

launch(launcherImplementation as Implementation);
