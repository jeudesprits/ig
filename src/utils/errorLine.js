export default function __line(error) {
  const stack = error.stack.split('\n');
  const line = stack[1 + 1].split(':');
  return parseInt(line[line.length - 2], 10);
}
