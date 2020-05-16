import env from "dotenv";
import implementationModel from "../implementationModel.json";
import { launch } from "@quick-qui/launcher";
import { ImplementationModel } from '@quick-qui/model-defines';
env.config();

launch(implementationModel as ImplementationModel);
