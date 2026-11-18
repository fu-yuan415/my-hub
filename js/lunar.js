/* 农历转换（纯本地算法，无网络、无依赖）
 * 数据覆盖 1900-2100 年，采用常见的压缩 lunarInfo 表。
 * 提供：
 *   Lunar.solarToLunar(y, m, d) -> { lYear, lMonth, lDay, monthName, dayName, isLeap }
 *   Lunar.festival(y,m,d) -> 公历节日名或 ''
 */
const Lunar = (() => {
  // 每年农历信息：低位4位=当年闰月；bit4-15=12/13个月大小(1=30天)；bit16=闰月天数
  const INFO = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
    0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
    0x0d520
  ];
  const BASE_YEAR = 1900;
  const BASE_DATE = new Date(1900, 0, 31); // 1900-01-31 = 农历 1900 正月初一

  const CN_NUM = ['零','一','二','三','四','五','六','七','八','九','十'];
  const MONTH_NAMES = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
  const DAY_NAMES = [
    '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
    '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
  ];

  function leapMonth(y) { return INFO[y - BASE_YEAR] & 0xf; }
  function leapDays(y) {
    return leapMonth(y) ? ((INFO[y - BASE_YEAR] & 0x10000) ? 30 : 29) : 0;
  }
  function monthDays(y, m) {
    return (INFO[y - BASE_YEAR] & (0x10000 >> m)) ? 30 : 29;
  }
  function yearDays(y) {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) sum += (INFO[y - BASE_YEAR] & i) ? 1 : 0;
    return sum + leapDays(y);
  }

  function solarToLunar(y, m, d) {
    if (y < BASE_YEAR || y > 2100) return null;
    const target = new Date(y, m - 1, d);
    let offset = Math.floor((target - BASE_DATE) / 86400000);
    if (offset < 0) return null;

    let ly = BASE_YEAR;
    while (ly < 2101) {
      const days = yearDays(ly);
      if (offset < days) break;
      offset -= days;
      ly++;
    }
    if (ly > 2100) return null;

    const leap = leapMonth(ly);
    let lm = 1, isLeap = false;
    // 遍历月份
    for (let i = 1; i <= 12; i++) {
      let days = monthDays(ly, i);
      // 闰月插在 leap 月之后
      if (leap === i) { /* 先处理本月，再处理闰月 */ }
      if (offset < days) { lm = i; isLeap = false; break; }
      offset -= days;
      if (leap === i) {
        const ld = leapDays(ly);
        if (offset < ld) { lm = i; isLeap = true; break; }
        offset -= ld;
      }
    }
    const ld = offset + 1;
    return {
      lYear: ly, lMonth: lm, lDay: ld, isLeap,
      monthName: (isLeap ? '闰' : '') + MONTH_NAMES[lm - 1] + '月',
      dayName: DAY_NAMES[ld - 1] || ('初' + ld)
    };
  }

  const SOLAR_FESTIVALS = {
    '1-1':'元旦', '2-14':'情人节', '3-8':'妇女节', '3-12':'植树节',
    '4-1':'愚人节', '5-1':'劳动节', '5-4':'青年节', '6-1':'儿童节',
    '7-1':'建党节', '8-1':'建军节', '9-10':'教师节', '10-1':'国庆节',
    '12-25':'圣诞节'
  };
  function festival(m, d) { return SOLAR_FESTIVALS[m + '-' + d] || ''; }

  return { solarToLunar, festival, MONTH_NAMES, DAY_NAMES };
})();
