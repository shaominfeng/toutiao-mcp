#!/usr/bin/env tsx

/**
 * 今日头条登录脚本
 */

import { TouTiaoAuth } from '../lib/auth';

async function main() {
  console.log('='.repeat(60));
  console.log('今日头条自动登录工具');
  console.log('='.repeat(60));
  console.log();

  const auth = new TouTiaoAuth();

  console.log('正在启动浏览器...');
  console.log('请在浏览器中完成以下操作：');
  console.log('  1. 输入手机号');
  console.log('  2. 点击获取验证码');
  console.log('  3. 输入验证码');
  console.log('  4. 点击登录');
  console.log('  5. 等待跳转到创作者中心');
  console.log();

  const success = await auth.loginWithSelenium();

  if (success) {
    console.log();
    console.log('✅ 登录成功！');
    console.log('Cookie 已保存，现在可以使用发布功能了');

    // 验证登录状态
    const isLoggedIn = await auth.checkLoginStatus();
    if (isLoggedIn) {
      console.log('✅ 登录状态验证通过');
    }
  } else {
    console.log();
    console.log('❌ 登录失败');
    console.log('请重新运行此脚本重试');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('发生错误:', error);
  process.exit(1);
});
