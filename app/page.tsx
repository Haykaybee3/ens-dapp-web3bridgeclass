"use client";

import { Contract } from "ethers";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { pinata } from "@/utils/config";
import { MdSignalWifiStatusbarConnectedNoInternet } from "react-icons/md";
import { truncateAddr } from "@/utils/utils";
import { getENSContract } from "./services";
import Wrapper from "./components/shared/wrapper";
import { RegisterName } from "./components/shared/registerName";
import { OwnedNamesDisplay } from "./components/shared/ownedNames";
type ActiveTab = "register" | "check" | "owned";

export default function Home() {
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const { isConnected, address } = useAccount();
  const [contract, setContract] = useState<Contract | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("register");

  // Initialize contract
  useEffect(() => {
    const initContract = async () => {
      const contractInstance: Contract = await getENSContract();
      setContract(contractInstance);
    };

    initContract();
  }, []);

  const uploadFile = async () => {
    if (!file) {
      alert("No file selected");
      return;
    }

    try {
      setUploading(true);
      const urlRequest = await fetch("/api/url"); // Fetches the temporary upload URL
      const urlResponse = await urlRequest.json(); // Parse response
      const upload = await pinata.upload.public.file(file).url(urlResponse.url); // Upload the file with the signed URL
      const fileUrl = await pinata.gateways.public.convert(upload.cid);
      setUrl(fileUrl);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target?.files?.[0]);
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleNameClick = (name: string) => {
    // You can implement name details modal or navigation here
    console.log('Clicked name:', name);
    setMessage({
      type: 'success',
      text: `Clicked on "${name}" - you can implement detailed view here`
    });
  };
  
  const handleRegistrationSuccess = (name: string, txHash: string) => {
    setMessage({
      type: "success",
      text: `Successfully registered`,
    });
    // Switch to owned names tab to see the new registration
    setActiveTab("owned");
  };

  const handleError = (error: string) => {
    setMessage({
      type: "error",
      text: error,
    });
  };

  const tabs = [
    { id: "register" as ActiveTab, label: "Register Name", icon: "📝" },
    { id: "check" as ActiveTab, label: "Check Availability", icon: "🔍" },
    { id: "owned" as ActiveTab, label: "My Names", icon: "📋" },
  ];

  return (
    <Wrapper className="flex flex-col w-full h-[calc(100%-80px)] py-10 relative">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white">ENS Manager</h1>
          <p className="text-gray-400">👋 Welcome, {truncateAddr(address)}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
            {activeTab === 'register' && (
              <RegisterName
                contract={contract}
                onSuccess={handleRegistrationSuccess}
                onError={handleError}
              />
            )}


          {activeTab === 'owned' && (
              <OwnedNamesDisplay
                contract={contract}
                onError={handleError}
                onNameClick={handleNameClick}
              />
           )}
      </div>

    </Wrapper>
  );
}
