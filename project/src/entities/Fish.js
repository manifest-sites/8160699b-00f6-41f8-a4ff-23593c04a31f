import { createEntityClient } from "../utils/entityWrapper";
import schema from "./Fish.json";
export const Fish = createEntityClient("Fish", schema);
