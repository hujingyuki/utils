/**
 * @description 对字符串进行rsa加密
 * @param {string} newStr
 */
import { JSEncrypt } from 'jsencrypt';
export function getRSAword(newStr) {
  let publicKey = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7/DW0QadIf1YtyKImyA41D9s8FQ5E6Hx`; // 从后台获取公钥，这里省略，直接赋值
  let encryptor = new JSEncrypt(); // 新建JSEncrypt对象
  encryptor.setPublicKey(publicKey); // 设置公钥
  let rsaPassWord = encryptor.encrypt(newStr); // 对密码进行加密
  return rsaPassWord;
}