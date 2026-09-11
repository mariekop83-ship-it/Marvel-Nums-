import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  Building2,
  Copy,
  Check,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { PaymentMethod } from '../types';
import { api } from '../api/client';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFundingSubmitted: () => void;
}

export const FundWalletModal: React.FC<FundWalletModalProps> = ({
  isOpen,
  onClose,
  onFundingSubmitted
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState<string>('1000');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [referenceNote, setReferenceNote] = useState<string>('');
  
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successFundId, setSuccessFundId] = useState<string | null>(null);

  const presets = [500, 1000, 2500, 5000, 10000];

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const res = await api.getPaymentMethods();
      setPaymentMethods(res.paymentMethods);
      if (res.paymentMethods.length > 0) {
        setSelectedMethod(res.paymentMethods[0]);
      }
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    } finally {
      setLoadingMethods(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image must be less than 8MB.');
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const num = Number(amount);
    if (!num || num < 100) {
      setErrorMsg('Minimum deposit amount is ₦100.');
      return;
    }

    if (!selectedMethod) {
      setErrorMsg('Please choose a payment method.');
      return;
    }

    if (!receiptImage) {
      setErrorMsg('Please upload a screenshot or image of your payment transfer receipt.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await api.submitFundRequest({
        amount: num,
        paymentMethodId: selectedMethod.id,
        receiptUrl: receiptImage,
        referenceNote
      });

      if (res.success && res.request) {
        setSuccessFundId(res.request.id);
        setStep(3);
        onFundingSubmitted();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit funding request. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Deposit / Fund Wallet</h2>
              <p className="text-[11px] text-slate-400">Step {step} of 3 • Automated Verification Desk</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: AMOUNT & PAYMENT METHOD */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Deposit Amount (₦ NGN)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 font-mono font-bold text-base">₦</span>
                <input
                  type="number"
                  min="100"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                {presets.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(String(p))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                      Number(amount) === p
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    +₦{p.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Destination Account
              </label>

              {loadingMethods ? (
                <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Loading payment channels...</span>
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                  No payment accounts configured currently. Please contact support.
                </div>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.map(pm => {
                    const isSelected = selectedMethod?.id === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedMethod(pm)}
                        className={`w-full p-3.5 rounded-2xl text-left transition-all border flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-950 border-emerald-500 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{pm.title}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {pm.bankName} • {pm.accountNumber}
                            </div>
                          </div>
                        </div>

                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              id="fund-wallet-continue-btn"
              type="button"
              onClick={() => {
                if (!Number(amount) || Number(amount) < 100) {
                  setErrorMsg('Minimum deposit is ₦100.');
                  return;
                }
                if (!selectedMethod) {
                  setErrorMsg('Please select a payment method.');
                  return;
                }
                setErrorMsg(null);
                setStep(2);
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
            >
              <span>View Account Details & Instructions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: ACCOUNT DETAILS & RECEIPT UPLOAD */}
        {step === 2 && selectedMethod && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs text-slate-400">
                Transfer exactly <span className="font-bold text-white font-mono text-sm">₦{Number(amount).toLocaleString()}</span> to:
              </div>

              {/* Bank Name */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Bank / Institution</div>
                  <div className="text-xs font-bold text-white">{selectedMethod.bankName}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(selectedMethod.bankName, 'bank')}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  {copiedKey === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                <div>
                  <div className="text-[10px] text-emerald-400 font-semibold uppercase">Account Number</div>
                  <div className="text-base font-extrabold font-mono text-white tracking-wider">
                    {selectedMethod.accountNumber}
                  </div>
                </div>
                <button
                  type="button"
                  id="copy-deposit-acc-number"
                  onClick={() => copyText(selectedMethod.accountNumber, 'acc')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                >
                  {copiedKey === 'acc' ? (
                    <>
                      <Check className="w-3 h-3 text-slate-950" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-950" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Account Name</div>
                  <div className="text-xs font-bold text-white">{selectedMethod.accountName}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(selectedMethod.accountName, 'name')}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  {copiedKey === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {selectedMethod.instructions && (
                <div className="text-[11px] text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/50 leading-relaxed">
                  💡 {selectedMethod.instructions}
                </div>
              )}
            </div>

            {/* Upload Receipt */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Upload Transfer Receipt</span>
                <span className="text-[10px] text-emerald-400 font-normal">Required for instant credit</span>
              </label>

              <label className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-white">
                  {receiptFileName || 'Click to select screenshot or receipt image'}
                </span>
                <span className="text-[10px] text-slate-500">PNG, JPG up to 8MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {receiptImage && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs">
                  <Check className="w-4 h-4" />
                  <span className="truncate">Receipt attached ({receiptFileName})</span>
                </div>
              )}
            </div>

            {/* Optional Note */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">
                Depositor Name or Reference (Optional)
              </label>
              <input
                type="text"
                value={referenceNote}
                onChange={e => setReferenceNote(e.target.value)}
                placeholder="e.g. John Doe / First Bank transfer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
              >
                Back
              </button>
              <button
                id="submit-deposit-receipt-btn"
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !receiptImage}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Submitting Deposit...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Payment Proof</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 3 && (
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Deposit Proof Submitted!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Your deposit request of <strong className="text-white">₦{Number(amount).toLocaleString()}</strong> has been submitted to the verification desk with ID <strong className="text-emerald-400 font-mono">{successFundId}</strong>.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 max-w-sm mx-auto">
              ⚡ A real-time alert was dispatched to the administration channel. Your wallet balance will update automatically upon confirmation.
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
