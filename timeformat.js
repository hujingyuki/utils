/**
 * @description 将时间转化为yyyy-MM-dd
 * @param {string} dataStr 时间字符串
 * @param {string} appendStr 追加字符串
 * IE中只支持对2018/10/10格式进行时间格式化
 */
export function dateFormat(dataStr, appendStr) {
  //if是为了兼容ie和safari
  if (typeof dataStr == 'string') {
    dataStr = dataStr.replace(/-/g, '/');
  }
  let d = new Date(dataStr);
  let year = d.getFullYear();
  let month =
    d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
  let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
  let newStr = [year, month, day].join('/') + appendStr;
  return newStr;
}

/**
 * 将秒数转为时间格式
 * @param {number} second
 */
export function formatTime(second) {
  let dd, hh, mm, ss;
  if (!second || second < 0) {
    return;
  }
  dd = (second / (24 * 3600)) | 0;
  second = Math.round(second) - dd * 24 * 3600;
  hh = (second / 3600) | 0;
  second = Math.round(second) - hh * 3600;
  mm = (second / 60) | 0;
  ss = Math.round(second) - mm * 60;

  if (Math.round(dd) < 10) {
    dd = dd > 0 ? '0' + dd : '';
  }
  if (Math.round(hh) < 10) {
    hh = '0' + hh;
  }
  if (Math.round(mm) < 10) {
    mm = '0' + mm;
  }
  if (Math.round(ss) < 10) {
    ss = '0' + ss;
  }
  
  return hh == '00' ? mm + ':' + ss : hh + ':' + mm + ':' + ss;
}