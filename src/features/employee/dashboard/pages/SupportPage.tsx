import React from 'react'
import { Mail, Phone, MessageSquare, FileText } from 'lucide-react'

const SupportPage: React.FC = () => {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-white">Help & Support</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Support */}
                <div className="bg-[#1a2232] p-6 rounded-xl border border-white/5 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Contact Support</h2>
                    <p className="text-gray-400">
                        Need assistance? Our support team is available 24/7 to help you with any
                        issues.
                    </p>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-gray-300">
                            <div className="p-2 bg-white/5 rounded-lg">
                                <Phone size={20} className="text-[#fe7e32]" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Hotline</p>
                                <p className="font-medium">1900 123 456</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-300">
                            <div className="p-2 bg-white/5 rounded-lg">
                                <Mail size={20} className="text-[#fe7e32]" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium">support@movieticket.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-[#1a2232] p-6 rounded-xl border border-white/5 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Quick Links</h2>
                    <div className="space-y-2">
                        <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left group">
                            <FileText
                                size={20}
                                className="text-gray-400 group-hover:text-[#fe7e32]"
                            />
                            <div>
                                <p className="text-sm font-medium text-white">User Manual</p>
                                <p className="text-xs text-gray-500">
                                    Guide for booking and payment
                                </p>
                            </div>
                        </button>

                        <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left group">
                            <MessageSquare
                                size={20}
                                className="text-gray-400 group-hover:text-[#fe7e32]"
                            />
                            <div>
                                <p className="text-sm font-medium text-white">FAQ</p>
                                <p className="text-xs text-gray-500">Frequently asked questions</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SupportPage
