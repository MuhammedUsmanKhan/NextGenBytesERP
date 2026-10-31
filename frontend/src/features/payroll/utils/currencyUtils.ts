/**
 * Formats a number to Pakistani Rupees currency string (e.g. 471880 -> "Rs. 471,880")
 */
export function formatPKR(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-PK")}`;
}

/**
 * Converts a number into formal English words for banking and payroll receipts
 * e.g. 471880 -> "Rupees Four Hundred Seventy-One Thousand Eight Hundred Eighty Only"
 */
export function numberToWordsPKR(num: number): string {
  if (num === 0) return "Rupees Zero Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertGroup(n: number): string {
    let output = "";
    if (n >= 100) {
      output += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      output += b[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + a[n % 10] : "") + " ";
    } else if (n > 0) {
      output += a[n] + " ";
    }
    return output.trim();
  }

  let integerPart = Math.floor(Math.abs(num));
  let words = "";

  // Crores (10,000,000)
  if (integerPart >= 10000000) {
    const crore = Math.floor(integerPart / 10000000);
    words += convertGroup(crore) + " Crore ";
    integerPart %= 10000000;
  }

  // Lakhs (100,000)
  if (integerPart >= 100000) {
    const lakh = Math.floor(integerPart / 100000);
    words += convertGroup(lakh) + " Lakh ";
    integerPart %= 100000;
  }

  // Thousands (1,000)
  if (integerPart >= 1000) {
    const thousand = Math.floor(integerPart / 1000);
    words += convertGroup(thousand) + " Thousand ";
    integerPart %= 1000;
  }

  // Remainder hundreds
  if (integerPart > 0) {
    words += convertGroup(integerPart);
  }

  return `Rupees ${words.trim()} Only`;
}

