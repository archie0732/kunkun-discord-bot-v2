import { ExtendedClient } from "../../types/ExtendedClient";

function isNumeric(input: string): boolean {
  const numericRegex = /^[0-9]+$/;
  return numericRegex.test(input);
}

export default (client: ExtendedClient) => {
  client.isNumberic = isNumeric;
};
