'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { 
  doc,
  getDoc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaHeart, FaCheck, FaTimes, FaExclamationCircle } from 'react-icons/fa';

interface GuestInfo {
  name: string;
  phone: string;
  numberOfGuests: number;
  guestNames: string[];
}

interface ValidationError {
  name?: string;
  phone?: string;
  guestNames?: Record<number, string>;
}

interface InviteDoc {
  isUsed: boolean;
  primaryGuest: {
    name: string;
    phone: string;
  };
  additionalGuests: string[];
  createdAt: Timestamp;
  modifiedAt: Timestamp;
}

export default function InviteValidator() {
  const router = useRouter();
  const [step, setStep] = useState<'token' | 'details' | 'success'>('token');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'loading' | 'error' | 'used' | 'success'>('idle');
  const [guestCountInput, setGuestCountInput] = useState('1');
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '',
    phone: '',
    numberOfGuests: 1,
    guestNames: []
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError>({});

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name is too short';
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return 'Phone number is required';
    // Remove all non-numeric characters for validation
    const numericPhone = phone.replace(/\D/g, '');
    if (numericPhone.length < 10) return 'Phone number must be at least 10 digits';
    if (!/^\d+$/.test(numericPhone)) return 'Phone number can only contain numbers';
    return undefined;
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
  };

  const validateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationStatus('loading');
    
    try {
      const inviteRef = doc(db, 'invites', token.toUpperCase());
      const inviteSnap = await getDoc(inviteRef);
      
      if (!inviteSnap.exists()) {
        setError('Invalid invitation code. Please check and try again.');
        setValidationStatus('error');
        return;
      }

      const invite = inviteSnap.data() as InviteDoc;
      
      if (invite.isUsed) {
        setError('This invitation code has already been used.');
        setValidationStatus('used');
        return;
      }

      setValidationStatus('success');
      // Wait for success animation
      await new Promise(resolve => setTimeout(resolve, 800));
      setStep('details');
    } catch {
      setError('An error occurred. Please try again.');
      setValidationStatus('error');
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const value = e.target.value;
    
    if (typeof index === 'number') {
      // Additional guest name validation
      const newNames = [...guestInfo.guestNames];
      newNames[index] = value;
      const error = validateName(value);
      
      setValidationErrors(prev => {
        const newGuestNames = { ...(prev.guestNames || {}) };
        if (error) {
          newGuestNames[index] = error;
        } else {
          delete newGuestNames[index];
        }
        return {
          ...prev,
          guestNames: Object.keys(newGuestNames).length > 0 ? newGuestNames : undefined
        };
      });
      
      setGuestInfo({ ...guestInfo, guestNames: newNames });
    } else {
      // Primary guest name validation
      const error = validateName(value);
      setValidationErrors(prev => ({ ...prev, name: error }));
      setGuestInfo({ ...guestInfo, name: value });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatPhoneNumber(value);
    const error = validatePhone(value);
    setValidationErrors(prev => ({ ...prev, phone: error }));
    setGuestInfo({ ...guestInfo, phone: formattedValue });
  };

  const handleGuestInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const nameError = validateName(guestInfo.name);
    const phoneError = validatePhone(guestInfo.phone);
    const guestNameErrors: { [key: number]: string } = {};
    
    guestInfo.guestNames.forEach((name, index) => {
      const error = validateName(name);
      if (error) guestNameErrors[index] = error;
    });

    const newValidationErrors = {
      name: nameError,
      phone: phoneError,
      guestNames: Object.keys(guestNameErrors).length > 0 ? guestNameErrors : undefined
    };

    setValidationErrors(newValidationErrors);

    // Check if there are any validation errors
    if (nameError || phoneError || Object.keys(guestNameErrors).length > 0) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    try {
      const inviteRef = doc(db, 'invites', token.toUpperCase());
      await updateDoc(inviteRef, {
        isUsed: true,
        primaryGuest: {
          name: guestInfo.name.trim(),
          phone: guestInfo.phone.trim(),
        },
        additionalGuests: guestInfo.guestNames.map(name => name.trim()),
        modifiedAt: Timestamp.now()
      });

      setStep('success');
    } catch (err) {
      setError(`An error occurred while submitting your RSVP. ${err}`);
    }
  };

  const handleGuestCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setGuestCountInput(inputValue);

    // Convert to number only if there's a value
    if (inputValue) {
      const newCount = Math.min(Math.max(parseInt(inputValue) || 1, 1), 10);
      
      // Update guest names array
      let newGuestNames = [...guestInfo.guestNames];
      if (newCount === 1) {
        newGuestNames = [];
      } else {
        // Adjust array size for additional guests (excluding primary guest)
        const targetLength = newCount - 1;
        if (newGuestNames.length < targetLength) {
          while (newGuestNames.length < targetLength) {
            newGuestNames.push('');
          }
        } else if (newGuestNames.length > targetLength) {
          newGuestNames = newGuestNames.slice(0, targetLength);
        }
      }

      setGuestInfo({
        ...guestInfo,
        numberOfGuests: newCount,
        guestNames: newGuestNames
      });
    }
  };

  const handleGuestCountBlur = () => {
    // On blur, ensure we have a valid number
    const newCount = Math.min(Math.max(parseInt(guestCountInput) || 1, 1), 10);
    setGuestCountInput(newCount.toString());
  };

  if (step === 'success') {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-50 p-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-sky-200/20 to-sky-300/20 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-yellow-200/20 to-yellow-300/20 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <motion.div 
          className="max-w-md w-full text-center space-y-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center"
            >
              <FaCheck className="h-8 w-8 text-green-500" />
            </motion.div>

            <motion.h2 
              className="text-4xl font-bold text-gray-900 font-serif"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Thank You!
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Your RSVP has been successfully submitted.
            </motion.p>
            <motion.p 
              className="text-gray-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              We look forward to celebrating with you on our special day.
            </motion.p>
            {guestInfo.numberOfGuests > 1 && (
              <motion.p 
                className="text-gray-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                We have noted that you will be bringing {guestInfo.numberOfGuests - 1} guest{guestInfo.numberOfGuests > 2 ? 's' : ''}.
              </motion.p>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 rounded-xl text-white
                       bg-gradient-to-r from-sky-400 to-sky-500
                       hover:from-sky-500 hover:to-sky-600
                       transition-all duration-300 transform
                       font-semibold tracking-wide"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Return to Home
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (step === 'details') {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-50 p-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-sky-200/20 to-sky-300/20 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-yellow-200/20 to-yellow-300/20 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4 text-gray-800 font-serif"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Almost There! ✨
            </motion.h2>
            <motion.p 
              className="text-gray-600 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Please provide your details
            </motion.p>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-sky-50/30 to-transparent" />

            <form onSubmit={handleGuestInfoSubmit} className="relative space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl
                             bg-white/50 placeholder-gray-400 text-black
                             focus:ring-2 focus:ring-sky-200 focus:outline-none
                             transition-all duration-200
                             ${validationErrors.name 
                               ? 'border-red-300 focus:border-red-400' 
                               : 'border-sky-200 focus:border-sky-400'}`}
                    placeholder="Enter your full name"
                    value={guestInfo.name}
                    onChange={handleNameChange}
                  />
                  {validationErrors.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 mr-3"
                    >
                      <FaExclamationCircle className="text-red-500" />
                    </motion.div>
                  )}
                </div>
                {validationErrors.name && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {validationErrors.name}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl
                             bg-white/50 placeholder-gray-400 text-black
                             focus:ring-2 focus:ring-sky-200 focus:outline-none
                             transition-all duration-200
                             ${validationErrors.phone 
                               ? 'border-red-300 focus:border-red-400' 
                               : 'border-sky-200 focus:border-sky-400'}`}
                    placeholder="(123) 456-7890"
                    value={guestInfo.phone}
                    onChange={handlePhoneChange}
                  />
                  {validationErrors.phone && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 mr-3"
                    >
                      <FaExclamationCircle className="text-red-500" />
                    </motion.div>
                  )}
                </div>
                {validationErrors.phone && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {validationErrors.phone}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests (including yourself)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl
                           bg-white/50 placeholder-gray-400
                           focus:ring-2 focus:ring-sky-200 focus:border-sky-400 focus:outline-none
                           transition-all duration-200 text-black "
                  value={guestCountInput}
                  onChange={handleGuestCountChange}
                  onBlur={handleGuestCountBlur}
                />
              </motion.div>

              <AnimatePresence>
                {guestInfo.numberOfGuests > 1 && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Guest Names
                    </label>
                    {guestInfo.guestNames.map((name, index) => (
                      <motion.div
                        key={index}
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <input
                          type="text"
                          required
                          className={`w-full px-4 py-3 border-2 rounded-xl
                                   bg-white/50 placeholder-gray-400 text-black
                                   focus:ring-2 focus:ring-sky-200 focus:outline-none
                                   transition-all duration-200
                                   ${validationErrors.guestNames?.[index]
                                     ? 'border-red-300 focus:border-red-400'
                                     : 'border-sky-200 focus:border-sky-400'}`}
                          placeholder={`Guest ${index + 1} Name`}
                          value={name}
                          onChange={(e) => handleNameChange(e, index)}
                        />
                        {validationErrors.guestNames?.[index] && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute right-0 top-1/2 -translate-y-1/2 mr-3"
                            >
                              <FaExclamationCircle className="text-red-500" />
                            </motion.div>
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-1 text-sm text-red-500"
                            >
                              {validationErrors.guestNames[index]}
                            </motion.p>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div 
                  className="rounded-lg p-3 text-sm bg-red-50 text-red-800"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2">
                    <FaTimes className="h-4 w-4 text-red-500 flex-shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}

              <motion.button
                type="submit"
                className="relative w-full py-3 px-4 rounded-xl font-semibold tracking-wide
                         text-white overflow-hidden
                         bg-gradient-to-r from-sky-400 to-sky-500
                         transition-all duration-300
                         hover:from-sky-500 hover:to-sky-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                <span className="relative">Submit RSVP</span>
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (step === 'token') {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-50 p-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-sky-200/20 to-sky-300/20 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-yellow-200/20 to-yellow-300/20 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <motion.div 
          className="w-full max-w-md relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h1 
              className="text-4xl sm:text-5xl font-bold mb-4 text-gray-800 font-serif"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              You&apos;re Invited <span className="inline-block animate-pulse">💌</span>
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Enter your special code to RSVP
            </motion.p>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-sky-50/30 to-transparent" />

            <form onSubmit={validateToken} className="relative space-y-6">
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label 
                  htmlFor="inviteCode" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Invitation Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="inviteCode"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value.toUpperCase());
                      setValidationStatus('idle');
                      setError('');
                    }}
                    className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl
                              transition-all duration-300 text-gray-900
                              placeholder-gray-400 bg-white/50
                              focus:ring-2 focus:ring-offset-2 focus:outline-none
                              ${validationStatus === 'error' || validationStatus === 'used' 
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                : validationStatus === 'success'
                                  ? 'border-green-300 focus:border-green-400 focus:ring-green-200'
                                  : 'border-sky-200 focus:border-sky-400 focus:ring-sky-200'}`}
                    placeholder="Enter code (e.g. ABC123)"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AnimatePresence mode="wait">
                      {validationStatus === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                        >
                          <FaTimes className="h-5 w-5 text-red-500" />
                        </motion.div>
                      )}
                      {validationStatus === 'success' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                        >
                          <FaCheck className="h-5 w-5 text-green-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    className={`rounded-lg p-3 text-sm ${
                      validationStatus === 'used' 
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      {validationStatus === 'used' ? (
                        <FaHeart className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      ) : (
                        <FaTimes className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={validationStatus === 'loading' || !token}
                className={`relative w-full py-3 px-4 rounded-xl font-semibold tracking-wide
                          text-white overflow-hidden transition-all duration-300
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${validationStatus === 'loading' ? 'bg-gray-400' : 'bg-gradient-to-r from-sky-400 to-sky-500'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                <span className="relative">
                  {validationStatus === 'loading' ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Validating...
                    </div>
                  ) : validationStatus === 'success' ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaCheck className="h-4 w-4" />
                      Valid Code!
                    </div>
                  ) : (
                    'Verify Code'
                  )}
                </span>
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            RSVP Details
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please provide your information
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleGuestInfoSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <input
              type="text"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border 
                       border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none 
                       focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
              placeholder="Your Name"
              value={guestInfo.name}
              onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
            />

            <input
              type="tel"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border 
                       border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none 
                       focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
              placeholder="Phone Number"
              value={guestInfo.phone}
              onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests (including yourself)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border 
                         border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none 
                         focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                value={guestCountInput}
                onChange={handleGuestCountChange}
                onBlur={handleGuestCountBlur}
              />
            </div>

            {guestInfo.numberOfGuests > 1 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Guest Names
                </label>
                {guestInfo.guestNames.map((name, index) => (
                  <input
                    key={index}
                    type="text"
                    required
                    className="appearance-none rounded relative block w-full px-3 py-2 border 
                             border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none 
                             focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                    placeholder={`Guest ${index + 1} Name`}
                    value={name}
                    onChange={(e) => {
                      const newNames = [...guestInfo.guestNames];
                      newNames[index] = e.target.value;
                      setGuestInfo({ ...guestInfo, guestNames: newNames });
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                     text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Submit RSVP
          </button>
        </form>
      </div>
    </div>
  );
} 