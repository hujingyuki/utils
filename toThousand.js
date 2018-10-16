/**
 * @description 金钱千分化（每三位加逗号）
 * @param {number} money
 */
export function toThousand(money) {
  if (!isEmpty(money)) {
    let reg = /(?=(?!(\b))(\d{3})+$)/g;
    let str = (money / 100).toString().replace(reg, ',');
    return str;
  } else {
    return '--';
  }
}