export function compareMoney(
  a:number,
  b:number
){

  const diff =
    Math.abs(
      Number(a || 0) -
      Number(b || 0)
    );


  return diff <= 0.1;

}