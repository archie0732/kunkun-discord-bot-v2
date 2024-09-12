import chalk from "chalk";

const getTime = () => {
  const now = new Date(Date.now());
  return chalk.gray(
    [
      [
        now.getFullYear(),
        (now.getMonth() + 1).toString().padStart(2, "0"),
        now.getDate().toString().padStart(2, "0"),
      ].join("/"),
      [
        now.getHours().toString().padStart(2, "0"),
        now.getMinutes().toString().padStart(2, "0"),
        now.getSeconds().toString().padStart(2, "0"),
      ].join(":"),
    ].join(" ")
  );
};

const pad = (level: string) => level.padEnd(5, " ");

export default {
  info: (message: string) => {
    console.info(`${getTime()} ${chalk.blue(pad("Info"))} ${message}`);
  },
  warn: (message: string) => {
    console.warn(`${getTime()} ${chalk.yellow(pad("Warn"))} ${message}`);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`${getTime()} ${chalk.red.bold(pad("Error"))} ${message}`);
    for (const arg of args) {
      console.error(arg);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    console.debug(`${getTime()} ${chalk.cyan(pad("Debug"))} ${message}`);
    for (const arg of args) {
      console.debug(arg);
    }
  },
  trace: (message: string, ...args: unknown[]) => {
    console.log(
      `${getTime()} ${chalk.gray.italic(pad("Trace"))} ${chalk.gray.italic(
        message
      )}`
    );
    for (const arg of args) {
      console.log(Bun.inspect(arg));
    }
  },
};
