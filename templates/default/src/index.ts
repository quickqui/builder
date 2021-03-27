import env from "dotenv";
env.config();

import implementationModel from "../implementationModel.json";
import { launch } from "@quick-qui/launcher";
import { ImplementationModel } from '@quick-qui/model-defines';

launch(implementationModel as ImplementationModel);
