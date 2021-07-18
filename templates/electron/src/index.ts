import env from "dotenv";
env.config();

import launcherImplementation from "../launcherImplementation.json";
import { launch } from "@quick-qui/launcher";
import { Implementation } from "@quick-qui/implementation-model";

launch(launcherImplementation as Implementation);
