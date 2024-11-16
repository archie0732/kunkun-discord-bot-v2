export function getNowTime(): string {
  const now = new Date();
  return (
    now.getFullYear().toString()
    + '-'
    + (now.getMonth() + 1).toString()
    + '-'
    + now.getDate()
    + ' | '
    + now.getHours().toString()
    + ':'
    + now.getMinutes().toString()
  );
}

export const getNowDate = () => {
  const now = new Date();

  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};
