export function getNowTime(): string {
  const now = new Date();

  const year = now.getFullYear().toString();
  const mon = (now.getMonth() + 1).toString();
  const day = now.getDate().toString();

  return (
    now.getFullYear().toString() +
    "-" +
    (now.getMonth() + 1).toString() +
    "-" +
    now.getDate() +
    " | " +
    now.getHours().toString() +
    ":" +
    now.getMinutes().toString()
  );
}

console.log(getNowTime());
