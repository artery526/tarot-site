(function attachEmilyNumerology(root, createApi) {
  const api = createApi();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.EmilyNumerology = api;
  }
})(typeof globalThis === "undefined" ? this : globalThis, () => {
  function parseIsoDate(value) {
    if (typeof value !== "string") return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (year < 1 || month < 1 || month > 12) return null;

    const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const daysPerMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day < 1 || day > daysPerMonth[month - 1]) return null;

    return { year, month, day };
  }

  function compareDates(left, right) {
    if (left.year !== right.year) return left.year - right.year;
    if (left.month !== right.month) return left.month - right.month;
    return left.day - right.day;
  }

  function getTodayParts(today) {
    if (typeof today === "string") return parseIsoDate(today);
    const current = today instanceof Date ? today : new Date();
    if (Number.isNaN(current.getTime())) return null;
    return { year: current.getFullYear(), month: current.getMonth() + 1, day: current.getDate() };
  }

  function calculateLifePathNumber(dateValue, today) {
    const birthDate = parseIsoDate(dateValue);
    if (!birthDate) {
      return { valid: false, error: "請選擇有效的西元出生年月日。" };
    }

    const todayParts = getTodayParts(today);
    if (!todayParts) {
      return { valid: false, error: "目前無法確認日期，請稍後再試。" };
    }
    if (compareDates(birthDate, todayParts) > 0) {
      return { valid: false, error: "出生日期不能晚於今天喔。" };
    }

    const digits = dateValue.replaceAll("-", "").split("").map(Number);
    let total = digits.reduce((sum, digit) => sum + digit, 0);
    const steps = [`${digits.join("+")} = ${total}`];

    while (total > 9) {
      const reducedDigits = String(total).split("").map(Number);
      total = reducedDigits.reduce((sum, digit) => sum + digit, 0);
      steps.push(`${reducedDigits.join("+")} = ${total}`);
    }

    const formattedDate = `${String(birthDate.year).padStart(4, "0")}/${String(birthDate.month).padStart(2, "0")}/${String(birthDate.day).padStart(2, "0")}`;
    return { valid: true, number: total, steps, formattedDate };
  }

  return Object.freeze({ calculateLifePathNumber, parseIsoDate });
});
