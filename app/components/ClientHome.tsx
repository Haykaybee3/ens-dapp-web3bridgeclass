"use client";

import type { Contract } from "ethers";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { truncateAddr } from "@/utils/utils";
import Wrapper from "./shared/wrapper";
import { RegisterName } from "./shared/registerName";
import { OwnedNamesDisplay } from "./shared/ownedNames";
import { CheckAvailability } from "./shared/checkAvailability";
import { EventsFeed } from "./shared/eventsFeed";
import { ManageName } from "./shared/manageName";
import NetworkGuard from "./shared/NetworkGuard";

type ActiveTab = "register" | "check" | "owned" | "manage" | "events";

export default function ClientHome() {
    const { address } = useAccount();
    const [contract, setContract] = useState<Contract | null>(null);
    const [contractLoading, setContractLoading] = useState(true);
    const [contractError, setContractError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>("register");
    const [selectedName, setSelectedName] = useState<string | null>(null);

    useEffect(() => {
        const initContract = async () => {
            try {
                setContractLoading(true);
                setContractError(null);
                const { getENSContract } = await import("../services");
                const contractInstance: Contract = await getENSContract();
                setContract(contractInstance);
            } catch (error: any) {
                console.error("Failed to initialize contract:", error);
                setContract(null);
                setContractError(error.message || "Failed to initialize contract");
            } finally {
                setContractLoading(false);
            }
        };
        initContract();
    }, []);

    const handleNameClick = (name: string) => {
        setSelectedName(name);
        setActiveTab('manage');
    };

    return (
        <Wrapper className="flex flex-col w-full h-[calc(100%-80px)] py-8 gap-8">
            <NetworkGuard />
            <div className="flex items-center justify-between fade-in">
                <div className="flex flex-col gap-3">
                    <h1 className="text-5xl font-bold text-light-purple floating-animation">
                        ENS Manager
                    </h1>
                    <p className="text-accent-purple text-xl font-medium">Welcome, {truncateAddr(address)}</p>
                </div>
                <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-secondary-purple rounded-full opacity-20 floating-animation"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-primary-purple rounded-2xl p-6 hover-lift slide-in">
                        <h2 className="text-2xl font-bold text-light-purple mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setActiveTab('register')}
                                className={`p-4 rounded-xl text-center transition-all duration-300 ${
                                    activeTab === 'register' 
                                        ? 'bg-accent-purple text-white shadow-lg' 
                                        : 'bg-secondary-purple text-light-purple hover:bg-accent-purple hover:text-white'
                                }`}
                            >
                                <div className="font-semibold text-light-purple">Register</div>
                            </button>
                            <button
                                onClick={() => setActiveTab('check')}
                                className={`p-4 rounded-xl text-center transition-all duration-300 ${
                                    activeTab === 'check' 
                                        ? 'bg-accent-purple text-white shadow-lg' 
                                        : 'bg-secondary-purple text-light-purple hover:bg-accent-purple hover:text-white'
                                }`}
                            >
                                <div className="font-semibold text-light-purple">Check</div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-secondary-purple rounded-2xl p-6 hover-lift fade-in">
                        <h2 className="text-2xl font-bold text-light-purple mb-4">My Names</h2>
                        <button
                            onClick={() => setActiveTab('owned')}
                            className={`w-full p-4 rounded-xl text-center transition-all duration-300 ${
                                activeTab === 'owned' 
                                    ? 'bg-accent-purple text-white shadow-lg' 
                                    : 'bg-primary-purple text-light-purple hover:bg-accent-purple hover:text-white'
                            }`}
                        >
                            <div className="font-semibold text-light-purple">View My Names</div>
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-accent-purple rounded-2xl p-6 hover-lift slide-in">
                        <h2 className="text-xl font-bold text-light-purple mb-4">Management</h2>
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`w-full p-4 rounded-xl text-center transition-all duration-300 ${
                                activeTab === 'manage' 
                                    ? 'bg-primary-purple text-white shadow-lg' 
                                    : 'bg-secondary-purple text-light-purple hover:bg-primary-purple hover:text-white'
                            }`}
                        >
                            <div className="font-semibold text-light-purple">Manage</div>
                        </button>
                    </div>

                    <div className="bg-primary-purple rounded-2xl p-6 hover-lift fade-in">
                        <h2 className="text-xl font-bold text-light-purple mb-4">Live Feed</h2>
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`w-full p-4 rounded-xl text-center transition-all duration-300 ${
                                activeTab === 'events' 
                                    ? 'bg-accent-purple text-white shadow-lg' 
                                    : 'bg-secondary-purple text-light-purple hover:bg-accent-purple hover:text-white'
                            }`}
                        >
                            <div className="font-semibold text-light-purple">Events</div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="fade-in">
                {contractLoading && (
                    <div className="bg-primary-purple rounded-2xl p-8 border border-accent-purple text-center hover-lift">
                        <div className="flex items-center justify-center gap-3 text-light-purple">
                            <div className="w-6 h-6 border-2 border-light-purple border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-lg">Initializing contract...</p>
                        </div>
                    </div>
                )}

                {contractError && (
                    <div className="bg-red-600 rounded-2xl p-8 border border-red-500 text-center hover-lift">
                        <p className="text-white text-lg font-medium mb-2">Contract Initialization Failed</p>
                        <p className="text-red-200 text-sm">{contractError}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-4 px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!contractLoading && !contractError && contract && (
                    <>
                        {activeTab === 'register' && (
                            <RegisterName
                                contract={contract}
                                onSuccess={() => setActiveTab('owned')}
                            />
                        )}

                        {activeTab === 'check' && (
                            <CheckAvailability contract={contract} />
                        )}

                        {activeTab === 'owned' && (
                            <OwnedNamesDisplay
                                contract={contract}
                                onNameClick={handleNameClick}
                            />
                        )}

                        {activeTab === 'manage' && (
                            <div className="space-y-4">
                                {selectedName ? (
                                    <ManageName
                                        contract={contract}
                                        name={selectedName}
                                        onSuccess={() => setActiveTab('owned')}
                                    />
                                ) : (
                                    <div className="bg-secondary-purple rounded-2xl p-8 border border-accent-purple text-center hover-lift">
                                        <p className="text-light-purple text-lg">Select a name from "My Names" to manage.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'events' && <EventsFeed />}
                    </>
                )}

                {!contractLoading && !contractError && !contract && (
                    <div className="bg-secondary-purple rounded-2xl p-8 border border-accent-purple text-center hover-lift">
                        <p className="text-light-purple text-lg">Contract not available. Please check your wallet connection.</p>
                    </div>
                )}
            </div>
        </Wrapper>
    );
}


