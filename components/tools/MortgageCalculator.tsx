import React, { useState, useMemo } from 'react';
import { IconCopy, IconCheck, IconRefresh } from '../Icons';
import { ToolComponentProps } from '../../types';

export const MortgageCalculator: React.FC<ToolComponentProps> = ({ lang = 'zh' }) => {
  // Input States
  const [currentPrincipalWan, setCurrentPrincipalWan] = useState<string>('100'); // 剩余本金 (万元)
  const [remainingMonths, setRemainingMonths] = useState<string>('240'); // 剩余月数 (如 240月 = 20年)
  const [annualInterestRate, setAnnualInterestRate] = useState<string>('3.85'); // 年利率 %
  const [prepaymentAmountWan, setPrepaymentAmountWan] = useState<string>('20'); // 提前还款金额 (万元)
  const [paymentMethod, setPaymentMethod] = useState<1 | 2>(1); // 1: 等额本息, 2: 等额本金
  const [shortenTerm, setShortenTerm] = useState<boolean>(true); // true: 缩短年限, false: 减少月供

  const [copied, setCopied] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const isZh = lang === 'zh';

  const t = {
    title: isZh ? '提前还贷计算器' : 'Mortgage Prepayment Calculator',
    subtitle: isZh
      ? '支持等额本息/等额本金对比、缩短年限与减少月供方案计算、利息节省分析'
      : 'Calculate mortgage prepayments with Equal Principal & Interest or Equal Principal options.',
    principal: isZh ? '剩余本金' : 'Current Principal',
    remainingMonths: isZh ? '剩余还款期限' : 'Remaining Months',
    monthsUnit: isZh ? '个月' : 'months',
    yearsUnit: isZh ? '年' : 'yrs',
    annualRate: isZh ? '贷款年利率' : 'Annual Interest Rate',
    prepayment: isZh ? '提前还款金额' : 'Prepayment Amount',
    method: isZh ? '还款方式' : 'Repayment Method',
    method1: isZh ? '等额本息 (每月还款额固定)' : 'Equal Principal & Interest (Fixed Monthly)',
    method2: isZh ? '等额本金 (每月还款递减)' : 'Equal Principal (Decreasing Monthly)',
    shortenOption: isZh ? '提前还款方案' : 'Prepayment Plan',
    shortenTermTrue: isZh ? '保持月供不变，缩短还款期限' : 'Keep monthly payment, shorten term',
    shortenTermFalse: isZh ? '保持还款期限，减少每月月供' : 'Keep term, reduce monthly payment',
    wan: isZh ? '万元' : '10k RMB',
    yuan: isZh ? '元' : 'RMB',
    errorAmount: isZh ? '错误：提前还款金额不能大于剩余本金' : 'Error: Prepayment amount cannot exceed remaining principal',
    errorInvalid: isZh ? '请输入有效的数值' : 'Please enter valid numerical values',
    savedInterest: isZh ? '节省总利息' : 'Interest Saved',
    newPrincipal: isZh ? '还款后剩余本金' : 'Remaining Principal',
    newTerm: isZh ? '调整后还款期限' : 'Adjusted Term',
    shortenedBy: isZh ? '缩短了' : 'Shortened by',
    monthlyPayment: isZh ? '调整后月供' : 'New Monthly Payment',
    origMonthlyPayment: isZh ? '原月供' : 'Orig. Payment',
    totalInterest: isZh ? '剩余期总利息' : 'Remaining Total Interest',
    origTotalInterest: isZh ? '原剩余期总利息' : 'Orig. Total Interest',
    comparison: isZh ? '调整前后对比' : 'Comparison Summary',
    copySummary: isZh ? '复制计算结果' : 'Copy Summary',
    scheduleTitle: isZh ? '还款明细预览' : 'Repayment Schedule Preview',
    toggleSchedule: isZh ? '查看/隐藏还款明细表' : 'Toggle Repayment Schedule',
    monthCol: isZh ? '期数' : 'Month',
    paymentCol: isZh ? '月供(元)' : 'Payment',
    principalCol: isZh ? '本金(元)' : 'Principal',
    interestCol: isZh ? '利息(元)' : 'Interest',
    balanceCol: isZh ? '剩余本金(元)' : 'Balance',
  };

  // Convert inputs
  const pWan = parseFloat(currentPrincipalWan) || 0;
  const prepWan = parseFloat(prepaymentAmountWan) || 0;
  const currentPrincipal = pWan * 10000;
  const prepaymentAmount = prepWan * 10000;
  const months = parseInt(remainingMonths, 10) || 0;
  const rate = parseFloat(annualInterestRate) || 0;

  // Validation
  const validationError = useMemo(() => {
    if (isNaN(pWan) || pWan <= 0) return isZh ? '请输入有效的剩余本金' : 'Enter valid remaining principal';
    if (isNaN(months) || months <= 0) return isZh ? '请输入有效的剩余月数' : 'Enter valid remaining months';
    if (isNaN(rate) || rate < 0) return isZh ? '请输入有效的利率' : 'Enter valid interest rate';
    if (isNaN(prepWan) || prepWan < 0) return isZh ? '请输入有效的提前还款金额' : 'Enter valid prepayment amount';
    if (prepaymentAmount > currentPrincipal) return t.errorAmount;
    return null;
  }, [pWan, prepWan, months, rate, currentPrincipal, prepaymentAmount, isZh, t.errorAmount]);

  // Calculations
  const calcResults = useMemo(() => {
    if (validationError) return null;

    const monthlyRate = rate / 100 / 12;
    const newPrincipal = Math.max(0, currentPrincipal - prepaymentAmount);

    let originalMonthlyPayment = 0;
    let originalFirstMonthPayment = 0;
    let originalLastMonthPayment = 0;
    let originalTotalInterest = 0;

    // 1. Calculate Original
    if (paymentMethod === 1) {
      if (monthlyRate === 0) {
        originalMonthlyPayment = currentPrincipal / months;
        originalTotalInterest = 0;
      } else {
        const factor = Math.pow(1 + monthlyRate, months);
        originalMonthlyPayment = (currentPrincipal * monthlyRate * factor) / (factor - 1);
        originalTotalInterest = originalMonthlyPayment * months - currentPrincipal;
      }
    } else {
      const monthlyPrincipal = currentPrincipal / months;
      originalFirstMonthPayment = monthlyPrincipal + currentPrincipal * monthlyRate;
      originalLastMonthPayment = monthlyPrincipal + monthlyPrincipal * monthlyRate;
      originalTotalInterest = (currentPrincipal * monthlyRate * (months + 1)) / 2;
    }

    // If prepayment pays off full principal
    if (newPrincipal <= 0) {
      return {
        newPrincipal: 0,
        originalTotalInterest,
        totalInterest: 0,
        interestSaved: originalTotalInterest,
        originalMonthlyPayment,
        originalFirstMonthPayment,
        originalLastMonthPayment,
        newMonthlyPayment: 0,
        newFirstMonthPayment: 0,
        newLastMonthPayment: 0,
        newRemainingMonths: 0,
        shortenedMonths: months,
        isFullyPaid: true
      };
    }

    // 2. Calculate After Prepayment
    let newMonthlyPayment = 0;
    let newFirstMonthPayment = 0;
    let newLastMonthPayment = 0;
    let newRemainingMonths = months;
    let totalInterest = 0;

    if (paymentMethod === 1) {
      // 等额本息
      if (shortenTerm) {
        // 保持月供不变，计算新的还款期限
        if (monthlyRate === 0) {
          newRemainingMonths = Math.ceil(newPrincipal / originalMonthlyPayment);
        } else if (originalMonthlyPayment >= newPrincipal * (1 + monthlyRate)) {
          newRemainingMonths = 1;
        } else {
          let low = 1;
          let high = months;
          let closest = low;
          while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const factor = Math.pow(1 + monthlyRate, mid);
            const calculatedPayment = (newPrincipal * monthlyRate * factor) / (factor - 1);
            if (Math.abs(calculatedPayment - originalMonthlyPayment) < 0.01) {
              closest = mid;
              break;
            } else if (calculatedPayment < originalMonthlyPayment) {
              high = mid - 1;
              closest = mid;
            } else {
              low = mid + 1;
              closest = mid + 1;
            }
          }
          newRemainingMonths = Math.max(1, Math.min(closest, months));
        }

        newMonthlyPayment = originalMonthlyPayment;
        totalInterest = monthlyRate === 0 ? 0 : originalMonthlyPayment * newRemainingMonths - newPrincipal;
      } else {
        // 保持期限不变，减少月供
        newRemainingMonths = months;
        if (monthlyRate === 0) {
          newMonthlyPayment = newPrincipal / months;
          totalInterest = 0;
        } else {
          const factor = Math.pow(1 + monthlyRate, months);
          newMonthlyPayment = (newPrincipal * monthlyRate * factor) / (factor - 1);
          totalInterest = newMonthlyPayment * months - newPrincipal;
        }
      }
    } else {
      // 等额本金
      if (shortenTerm) {
        // 保持首月月供不变，计算新的还款期限
        const denominator = originalFirstMonthPayment - newPrincipal * monthlyRate;
        if (denominator <= 0) {
          newRemainingMonths = 1;
        } else {
          newRemainingMonths = Math.floor(newPrincipal / denominator);
          newRemainingMonths = Math.max(1, newRemainingMonths);
        }

        const newMonthlyPrincipal = newPrincipal / newRemainingMonths;
        newFirstMonthPayment = newMonthlyPrincipal + newPrincipal * monthlyRate;
        newLastMonthPayment = newMonthlyPrincipal + newMonthlyPrincipal * monthlyRate;
        totalInterest = (newPrincipal * monthlyRate * (newRemainingMonths + 1)) / 2;
      } else {
        // 保持期限不变，减少月供
        newRemainingMonths = months;
        const newMonthlyPrincipal = newPrincipal / months;
        newFirstMonthPayment = newMonthlyPrincipal + newPrincipal * monthlyRate;
        newLastMonthPayment = newMonthlyPrincipal + newMonthlyPrincipal * monthlyRate;
        totalInterest = (newPrincipal * monthlyRate * (months + 1)) / 2;
      }
    }

    const interestSaved = Math.max(0, originalTotalInterest - totalInterest);
    const shortenedMonths = Math.max(0, months - newRemainingMonths);

    return {
      newPrincipal,
      originalTotalInterest,
      totalInterest,
      interestSaved,
      originalMonthlyPayment,
      originalFirstMonthPayment,
      originalLastMonthPayment,
      newMonthlyPayment,
      newFirstMonthPayment,
      newLastMonthPayment,
      newRemainingMonths,
      shortenedMonths,
      isFullyPaid: false
    };
  }, [currentPrincipal, prepaymentAmount, months, rate, paymentMethod, shortenTerm, validationError]);

  // Generate Amortization Schedule (First 24 months preview)
  const schedule = useMemo(() => {
    if (!calcResults || calcResults.isFullyPaid || calcResults.newPrincipal <= 0) return [];
    const monthlyRate = rate / 100 / 12;
    const items = [];
    let balance = calcResults.newPrincipal;
    const maxMonths = Math.min(calcResults.newRemainingMonths, 60); // Preview up to 60 months

    if (paymentMethod === 1) {
      // 等额本息
      const payment = calcResults.newMonthlyPayment;
      for (let m = 1; m <= maxMonths; m++) {
        const interest = balance * monthlyRate;
        const principalPart = Math.min(balance, payment - interest);
        balance = Math.max(0, balance - principalPart);
        items.push({
          month: m,
          payment: interest + principalPart,
          principal: principalPart,
          interest: interest,
          balance: balance
        });
        if (balance <= 0) break;
      }
    } else {
      // 等额本金
      const monthlyPrincipal = calcResults.newPrincipal / calcResults.newRemainingMonths;
      for (let m = 1; m <= maxMonths; m++) {
        const interest = balance * monthlyRate;
        const payment = monthlyPrincipal + interest;
        balance = Math.max(0, balance - monthlyPrincipal);
        items.push({
          month: m,
          payment,
          principal: monthlyPrincipal,
          interest,
          balance
        });
        if (balance <= 0) break;
      }
    }
    return items;
  }, [calcResults, rate, paymentMethod]);

  const handleCopy = () => {
    if (!calcResults) return;
    const text = `【提前还贷计算结果】
- 原始剩余本金：${(currentPrincipal / 10000).toFixed(2)} 万元
- 提前还款金额：${(prepaymentAmount / 10000).toFixed(2)} 万元
- 还款方式：${paymentMethod === 1 ? '等额本息' : '等额本金'}
- 提前还款方案：${shortenTerm ? '保持月供不变，缩短还款期限' : '保持还款期限，减少每月月供'}
- 调整后剩余本金：${(calcResults.newPrincipal / 10000).toFixed(2)} 万元 (${calcResults.newPrincipal.toFixed(2)} 元)
- 节省利息总额：${calcResults.interestSaved.toFixed(2)} 元 (${(calcResults.interestSaved / 10000).toFixed(2)} 万元)
- 调整后还款期限：${calcResults.newRemainingMonths} 个月 (${(calcResults.newRemainingMonths / 12).toFixed(1)} 年)${calcResults.shortenedMonths > 0 ? ` [缩短 ${calcResults.shortenedMonths} 个月]` : ''}
${
  paymentMethod === 1
    ? `- 调整后月供：${calcResults.newMonthlyPayment.toFixed(2)} 元`
    : `- 调整后首月月供：${calcResults.newFirstMonthPayment.toFixed(2)} 元 (末月 ${calcResults.newLastMonthPayment.toFixed(2)} 元)`
}
- 剩余还款期总利息：${calcResults.totalInterest.toFixed(2)} 元 (原为 ${calcResults.originalTotalInterest.toFixed(2)} 元)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetDefaults = () => {
    setCurrentPrincipalWan('100');
    setRemainingMonths('240');
    setAnnualInterestRate('3.85');
    setPrepaymentAmountWan('20');
    setPaymentMethod(1);
    setShortenTerm(true);
  };

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-100 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🏠</span> {t.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={resetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-xs"
        >
          <IconRefresh className="w-3.5 h-3.5" />
          {isZh ? '重置参数' : 'Reset'}
        </button>
      </div>

      {/* TOP: Validation Error or Highlight Result Cards */}
      {validationError ? (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span> {validationError}
        </div>
      ) : calcResults ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Saved Interest */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-2 -bottom-2 text-white/10 text-6xl font-black select-none pointer-events-none">
              ¥
            </div>
            <div className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
              {t.savedInterest}
            </div>
            <div className="my-1.5">
              <span className="text-2xl font-extrabold font-mono tracking-tight">
                ¥ {calcResults.interestSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-[11px] text-emerald-100/90 font-medium">
              {(calcResults.interestSaved / 10000).toFixed(2)} 万元 ({calcResults.originalTotalInterest > 0 ? `${((calcResults.interestSaved / calcResults.originalTotalInterest) * 100).toFixed(1)}%` : '0%'})
            </div>
          </div>

          {/* Card 2: New Principal */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="text-xs text-slate-400 font-semibold uppercase">{t.newPrincipal}</div>
            <div className="my-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                ¥ {(calcResults.newPrincipal / 10000).toFixed(2)} {t.wan}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              ¥ {calcResults.newPrincipal.toLocaleString()} 元
            </div>
          </div>

          {/* Card 3: New Term */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="text-xs text-slate-400 font-semibold uppercase">{t.newTerm}</div>
            <div className="my-1 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {calcResults.newRemainingMonths} {t.monthsUnit}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({(calcResults.newRemainingMonths / 12).toFixed(1)} {t.yearsUnit})
              </span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {calcResults.shortenedMonths > 0
                ? `${t.shortenedBy} ${calcResults.shortenedMonths} ${t.monthsUnit} (${(calcResults.shortenedMonths / 12).toFixed(1)}年)`
                : (isZh ? '期限保持不变' : 'Term unchanged')}
            </div>
          </div>

          {/* Card 4: New Monthly Payment */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="text-xs text-slate-400 font-semibold uppercase">{t.monthlyPayment}</div>
            <div className="my-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {paymentMethod === 1 ? (
                  `¥ ${calcResults.newMonthlyPayment.toFixed(2)}`
                ) : (
                  `首月 ¥ ${calcResults.newFirstMonthPayment.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {paymentMethod === 1
                ? `${t.origMonthlyPayment}: ¥ ${calcResults.originalMonthlyPayment.toFixed(2)}`
                : `末月 ¥ ${calcResults.newLastMonthPayment.toFixed(2)}`}
            </div>
          </div>
        </div>
      ) : null}

      {/* INPUT PARAMETERS: 2 inputs per row */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
          <span>⚙️ {isZh ? '贷款与提前还款参数配置' : 'Parameters Configuration'}</span>
          <span className="text-xs font-normal text-slate-400">{isZh ? '修改参数即时计算' : 'Live calculating'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Row 1 - Input 1: Current Principal */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">{t.principal}</label>
              <span className="text-primary-600 dark:text-primary-400 font-mono">
                {currentPrincipal.toLocaleString()} {t.yuan}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={currentPrincipalWan}
                onChange={(e) => setCurrentPrincipalWan(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 outline-none font-mono pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                {t.wan}
              </span>
            </div>
            {/* Quick Presets */}
            <div className="flex gap-1.5 flex-wrap pt-0.5">
              {['50', '80', '100', '150', '200'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCurrentPrincipalWan(val)}
                  className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
                    currentPrincipalWan === val
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                  }`}
                >
                  {val}万
                </button>
              ))}
            </div>
          </div>

          {/* Row 1 - Input 2: Remaining Months */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">{t.remainingMonths}</label>
              <span className="text-slate-500 font-mono">
                {(months / 12).toFixed(1)} {t.yearsUnit}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="360"
                value={remainingMonths}
                onChange={(e) => setRemainingMonths(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 outline-none font-mono pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                {t.monthsUnit}
              </span>
            </div>
            {/* Quick Presets */}
            <div className="flex gap-1.5 flex-wrap pt-0.5">
              {[
                { label: '10年(120期)', val: '120' },
                { label: '15年(180期)', val: '180' },
                { label: '20年(240期)', val: '240' },
                { label: '30年(360期)', val: '360' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setRemainingMonths(item.val)}
                  className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
                    remainingMonths === item.val
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2 - Input 3: Annual Interest Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">{t.annualRate}</label>
              <span className="text-slate-500 font-mono">月利率 {(rate / 12).toFixed(3)}%</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0"
                max="20"
                value={annualInterestRate}
                onChange={(e) => setAnnualInterestRate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 outline-none font-mono pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
            </div>
            <div className="flex gap-1.5 flex-wrap pt-0.5">
              {['3.10', '3.45', '3.85', '4.20', '4.90'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAnnualInterestRate(val)}
                  className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
                    annualInterestRate === val
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          {/* Row 2 - Input 4: Prepayment Amount */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">{t.prepayment}</label>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {prepaymentAmount.toLocaleString()} {t.yuan}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                value={prepaymentAmountWan}
                onChange={(e) => setPrepaymentAmountWan(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 outline-none font-mono pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                {t.wan}
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap pt-0.5">
              {[
                { label: '5万', val: '5' },
                { label: '10万', val: '10' },
                { label: '20万', val: '20' },
                { label: '50万', val: '50' },
                { label: '30%', val: (pWan * 0.3).toFixed(1) },
                { label: '50%', val: (pWan * 0.5).toFixed(1) },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrepaymentAmountWan(item.val)}
                  className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
                    prepaymentAmountWan === item.val
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3 - Option 1: Payment Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{t.method}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod(1)}
                className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                  paymentMethod === 1
                    ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-600 dark:text-primary-400 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold">{isZh ? '等额本息' : 'Equal Payment'}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{isZh ? '每月月供金额固定' : 'Fixed payment per month'}</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod(2)}
                className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                  paymentMethod === 2
                    ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-600 dark:text-primary-400 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold">{isZh ? '等额本金' : 'Equal Principal'}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{isZh ? '每月月供逐月递减' : 'Decreasing payment'}</div>
              </button>
            </div>
          </div>

          {/* Row 3 - Option 2: Shorten Option */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{t.shortenOption}</label>
            <div className="grid grid-cols-1 gap-2">
              <label
                className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                  shortenTerm
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="shortenTerm"
                  checked={shortenTerm}
                  onChange={() => setShortenTerm(true)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold">{t.shortenTermTrue}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isZh ? '省利息最多，缩短还款周期' : 'Maximizes interest savings'}
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                  !shortenTerm
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="shortenTerm"
                  checked={!shortenTerm}
                  onChange={() => setShortenTerm(false)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold">{t.shortenTermFalse}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isZh ? '减少每月还款压力，现金流充裕' : 'Reduces monthly cashflow pressure'}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Detailed Comparison Table Card & Amortization Schedule */}
      {calcResults && !validationError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Comparison Table */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>📊</span> {t.comparison}
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
              >
                {copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> : <IconCopy className="w-3.5 h-3.5" />}
                <span>{copied ? (isZh ? '已复制结果' : 'Copied!') : t.copySummary}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Original Plan Column */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="font-bold text-slate-500 dark:text-slate-400 text-center border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  {isZh ? '提前还款前 (原计划)' : 'Before Prepayment'}
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{t.principal}</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    ¥ {(currentPrincipal / 10000).toFixed(2)} 万
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{t.remainingMonths}</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {months} 个月 ({(months / 12).toFixed(1)} 年)
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{isZh ? '月供情况' : 'Monthly Payment'}</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {paymentMethod === 1 ? (
                      `¥ ${calcResults.originalMonthlyPayment.toFixed(2)}`
                    ) : (
                      `首月 ¥ ${calcResults.originalFirstMonthPayment.toFixed(2)}`
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{t.origTotalInterest}</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    ¥ {calcResults.originalTotalInterest.toFixed(2)} 元
                  </div>
                </div>
              </div>

              {/* New Plan Column */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 text-center border-b border-emerald-200 dark:border-emerald-800 pb-1.5">
                  {isZh ? '提前还款后 (新计划)' : 'After Prepayment'}
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{t.newPrincipal}</div>
                  <div className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    ¥ {(calcResults.newPrincipal / 10000).toFixed(2)} 万
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{t.newTerm}</div>
                  <div className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {calcResults.newRemainingMonths} 个月 ({(calcResults.newRemainingMonths / 12).toFixed(1)} 年)
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{t.monthlyPayment}</div>
                  <div className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {paymentMethod === 1 ? (
                      `¥ ${calcResults.newMonthlyPayment.toFixed(2)}`
                    ) : (
                      `首月 ¥ ${calcResults.newFirstMonthPayment.toFixed(2)}`
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{t.totalInterest}</div>
                  <div className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    ¥ {calcResults.totalInterest.toFixed(2)} 元
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Indicator Bar */}
            {calcResults.originalTotalInterest > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">{isZh ? '利息节省比例' : 'Interest Reduction Ratio'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {((calcResults.interestSaved / calcResults.originalTotalInterest) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, (calcResults.interestSaved / calcResults.originalTotalInterest) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Repayment Schedule Collapsible */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full px-5 py-3.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex justify-between items-center transition-colors border-b border-slate-100 dark:border-slate-800"
            >
              <span className="flex items-center gap-2">
                <span>📅</span> {t.scheduleTitle}
                <span className="text-[10px] text-slate-400 font-normal">
                  ({isZh ? '前60期明细' : 'First 60 months'})
                </span>
              </span>
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                {showSchedule ? (isZh ? '收起 ▲' : 'Collapse ▲') : (isZh ? '展开 ▼' : 'Expand ▼')}
              </span>
            </button>

            {showSchedule ? (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-2 font-semibold">{t.monthCol}</th>
                      <th className="px-3 py-2 font-semibold">{t.paymentCol}</th>
                      <th className="px-3 py-2 font-semibold">{t.principalCol}</th>
                      <th className="px-3 py-2 font-semibold">{t.interestCol}</th>
                      <th className="px-3 py-2 font-semibold">{t.balanceCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {schedule.map((item) => (
                      <tr key={item.month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-3 py-1.5 font-bold">{item.month}</td>
                        <td className="px-3 py-1.5">¥ {item.payment.toFixed(2)}</td>
                        <td className="px-3 py-1.5 text-slate-500">¥ {item.principal.toFixed(2)}</td>
                        <td className="px-3 py-1.5 text-amber-600 dark:text-amber-400">¥ {item.interest.toFixed(2)}</td>
                        <td className="px-3 py-1.5 text-slate-500">¥ {item.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 my-auto">
                <span>📑</span>
                <span>{isZh ? '点击上方按钮展开逐期还款计划明细表' : 'Click above to expand repayment schedule'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MortgageCalculator;
