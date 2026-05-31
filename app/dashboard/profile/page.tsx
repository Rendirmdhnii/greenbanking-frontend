"use client";

import { motion } from "framer-motion";
import { User, Mail, Shield, Wallet } from "lucide-react";
import { useUserContext } from "@/hooks/useUserData";
import { formatIDR } from "@/utils/format";

export default function ProfilePage() {
    const { userBalance } = useUserContext();

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 max-w-4xl mx-auto w-full"
        >
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil Pengguna</h1>

                <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                        <User size={40} />
                    </div>
                    <div className="text-center md:text-left space-y-1">
                        <h2 className="text-xl font-bold text-gray-800">Muhammad Rendy Ramadhani</h2>
                        <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-1">
                            <Mail size={14} /> IT Student & Main Developer
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                        <Wallet className="text-emerald-600" size={20} />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Saldo EcoBank</p>
                            <p className="font-bold text-gray-800">{formatIDR(userBalance)}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                        <Shield className="text-emerald-600" size={20} />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Akun</p>
                            <p className="font-bold text-emerald-700 text-sm">Terverifikasi Kampus (UB)</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}