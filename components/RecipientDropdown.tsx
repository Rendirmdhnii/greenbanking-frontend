"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, User, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Recipient {
  name: string;
  accountNumber: string;
  email?: string;
}

interface RecipientDropdownProps {
  recipients: Recipient[];
  selectedValue: string;
  onSelect: (recipient: Recipient) => void;
  placeholder?: string;
  error?: string;
}

export default function RecipientDropdown({
  recipients,
  selectedValue,
  onSelect,
  placeholder = "Pilih Rekening Tujuan...",
  error,
}: RecipientDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter recipients based on search query
  const filteredRecipients = recipients.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.accountNumber.includes(searchQuery)
  );

  const selectedRecipient = recipients.find((r) => r.accountNumber === selectedValue);

  const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 border rounded-xl text-left transition-all ${
          isOpen
            ? "border-emerald-500 ring-2 ring-emerald-100"
            : error
            ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-emerald-500/20"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <User size={16} />
          </div>
          {selectedRecipient ? (
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                {selectedRecipient.name}
              </p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Rek: {selectedRecipient.accountNumber}
              </p>
            </div>
          ) : (
            <span className="text-sm text-gray-400 font-semibold">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-250 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Options Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
          >
            {/* Search Input inside Dropdown */}
            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cari nama atau rekening..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Recipients list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
              {filteredRecipients.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400 font-medium">
                  Tidak ada rekening ditemukan
                </div>
              ) : (
                filteredRecipients.map((recipient) => {
                  const isSelected = recipient.accountNumber === selectedValue;
                  return (
                    <button
                      key={recipient.accountNumber}
                      type="button"
                      onClick={() => {
                        onSelect(recipient);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-emerald-50/20 text-left transition-colors ${
                        isSelected ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {getInitials(recipient.name)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 leading-tight">
                            {recipient.name}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {recipient.accountNumber}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check size={16} className="text-emerald-600" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
