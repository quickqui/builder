import env from "dotenv";
import implementationModel from "../implementationModel.json";
import { launch } from "@quick-qui/launcher";
env.config();

launch(implementationModel);
