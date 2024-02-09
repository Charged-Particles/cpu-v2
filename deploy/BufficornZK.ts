
import { deployContract } from "../utils/utils";

export default async function () {
  return await deployContract('BufficornZK', ['BufficornZK', 'BZK']);
}