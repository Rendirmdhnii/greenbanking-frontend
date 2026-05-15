"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import TransferModal from "@/components/TransferModal";
import StrukModal from "@/components/StrukModal";
import { useUserContext } from "@/hooks/useUserData";

export default function TransferPage() {
  const userHook = useUserContext();
  const { refreshUserData } = userHook;
  const [strukData, setStrukData] = useState<any>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ArrowRightLeft size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#064e3b] mb-2">Transfer Dana</h1>
          <p className="text-gray-500">Kirim uang ke rekening GreenBanking lain dengan cepat dan aman.</p>
        </div>

        <TransferModal 
          isOpen={true} 
          onClose={() => window.history.back()}
          onSuccess={(data) => {
            setStrukData(data);
            refreshUserData();
          }}
          serviceType="transfer"
          serviceLabel="Transfer Dana"
          strukTitle="Struk Transfer Dana"
        />
      </motion.div>

      <StrukModal 
        isOpen={!!strukData} 
        onClose={() => { setStrukData(null); window.history.back(); }} 
        data={strukData} 
      />
    </>
  );
}
