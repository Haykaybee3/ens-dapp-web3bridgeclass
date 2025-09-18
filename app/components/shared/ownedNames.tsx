import React, { useState, useEffect } from 'react';
import type { Contract } from 'ethers';
import { useAccount } from 'wagmi';
import { truncateAddr } from '@/utils/utils';
import { useToast } from '../ui/toast';

interface OwnedNamesDisplayProps {
  contract: Contract | null;
  onNameClick?: (name: string) => void;
}

interface NameDetails {
  name: string;
  owner: string;
  resolvedAddress: string;
  imageHash: string;
  registrationTime: number;
  imageUrl?: string;
}

export const OwnedNamesDisplay: React.FC<OwnedNamesDisplayProps> = ({
  contract,
  onNameClick,
}) => {
  const { addToast } = useToast();
  const { address } = useAccount();
  const [ownedNames, setOwnedNames] = useState<string[]>([]);
  const [nameDetails, setNameDetails] = useState<NameDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [currentSearchAddress, setCurrentSearchAddress] = useState('');

  useEffect(() => {
    if (address && contract) {
      loadNamesForAddress(address);
    }
  }, [address, contract]);

  const loadNamesForAddress = async (targetAddress: string) => {
    if (!contract || !targetAddress) return;

    try {
      setLoading(true);
      setCurrentSearchAddress(targetAddress);
      
      const names = await contract.getNamesOwnedBy(targetAddress);
      setOwnedNames(names);
      
      if (names.length > 0) {
        await loadNameDetails(names);
      } else {
        setNameDetails([]);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading owned names:', error);
      setLoading(false);
      addToast({ type: 'error', message: 'Failed to load owned names' });
    }
  };

  const loadNameDetails = async (names: string[]) => {
    if (!contract) return;

    try {
      setLoadingDetails(true);
      const details: NameDetails[] = [];

      for (const name of names) {
        try {
          const result = await contract.resolveName(name);
          const [owner, resolvedAddress, imageHash, registrationTime] = result;
          
          let imageUrl;
          if (imageHash) {
            imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
          }

          details.push({
            name,
            owner,
            resolvedAddress,
            imageHash,
            registrationTime: Number(registrationTime),
            imageUrl,
          });
        } catch (error) {
          console.error(`Error loading details for ${name}:`, error);
        }
      }

      setNameDetails(details);
      setLoadingDetails(false);
    } catch (error) {
      console.error('Error loading name details:', error);
      setLoadingDetails(false);
      addToast({ type: 'error', message: 'Failed to load name details' });
    }
  };

  const handleSearch = () => {
    if (!searchAddress.trim()) {
      addToast({ type: 'error', message: 'Please enter an address to search' });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(searchAddress.trim())) {
      addToast({ type: 'error', message: 'Please enter a valid Ethereum address' });
      return;
    }

    loadNamesForAddress(searchAddress.trim());
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleLoadMyNames = () => {
    if (address) {
      setSearchAddress(address);
      loadNamesForAddress(address);
    }
  };

  return (
    <div className="bg-accent-purple rounded-2xl p-8 space-y-8 border border-light-purple shadow-xl hover-lift fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-light-purple">Owned Names</h2>
        {address && (
          <button
            onClick={handleLoadMyNames}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
          >
            Load My Names
          </button>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-light-purple">
          Search names by owner address
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Enter Ethereum address (0x...)"
            className="flex-1 px-4 py-3 bg-primary-purple border border-light-purple rounded-lg text-white placeholder-light-purple focus:outline-none focus:border-light-purple focus:ring-2 focus:ring-light-purple/20"
          />
          <button
            onClick={handleSearch}
            disabled={!searchAddress.trim() || loading}
            className="px-6 py-3 bg-secondary-purple hover:bg-accent-purple disabled:bg-dark-purple disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
          >
            Search
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-light-purple">
            <div className="w-6 h-6 border-2 border-light-purple border-t-transparent rounded-full animate-spin"></div>
            Loading names...
          </div>
        </div>
      )}

      {currentSearchAddress && !loading && (
        <div className="bg-primary-purple rounded-lg p-4 border border-light-purple">
          <p className="text-light-purple text-sm">
            Showing names owned by: <span className="text-light-purple font-mono">{truncateAddr(currentSearchAddress)}</span>
          </p>
          <p className="text-light-purple text-xs mt-1">
            Found {ownedNames.length} name{ownedNames.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {!loading && ownedNames.length === 0 && currentSearchAddress && (
        <div className="text-center py-8 text-light-purple">
          <p>No names found for this address</p>
        </div>
      )}

      {!loading && ownedNames.length > 0 && (
        <div className="space-y-4">
          {loadingDetails && (
            <div className="text-center text-light-purple">
              <p>Loading name details...</p>
            </div>
          )}

          <div className="grid gap-4">
            {nameDetails.map((nameDetail) => (
              <div
                key={nameDetail.name}
                className="bg-primary-purple rounded-xl p-6 border border-light-purple hover:border-accent-purple transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover-lift"
                onClick={() => onNameClick?.(nameDetail.name)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-secondary-purple flex-shrink-0 overflow-hidden border border-accent-purple">
                    {nameDetail.imageUrl ? (
                      <img
                        src={nameDetail.imageUrl}
                        alt={`${nameDetail.name} profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0zMiAyOEMyNi40NzcgMjggMjIgMjMuNTIzIDIyIDE4UzI2LjQ3NyA4IDMyIDhTNDIgMTIuNDc3IDQyIDE4UzM3LjUyMyAyOCAzMiAyOFpNMzIgMzJDNDEuMzMzIDMyIDQ5IDM5LjY2NyA0OSA0OUM0OSA1MS4yMDkgNDcuMjA5IDUzIDQ1IDUzSDE5QzE2Ljc5MSA1MyAxNSA1MS4yMDkgMTUgNDlDMTUgMzkuNjY3IDIyLjY2NyAzMiAzMiAzMloiIGZpbGw9IiM2QjczODAiLz4KPC9zdmc+';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-light-purple">
                        <div className="w-8 h-8 rounded-full bg-secondary-purple flex items-center justify-center">
                          <span className="text-sm font-bold text-white">U</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-light-purple truncate">
                        {nameDetail.name}
                      </h3>
                      <span className="px-3 py-1 bg-accent-purple text-white text-xs rounded-full font-medium">
                        ENS
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-light-purple">
                        <span className="text-light-purple">Resolves to:</span>
                        <span className="font-mono text-light-purple">
                          {truncateAddr(nameDetail.resolvedAddress)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-light-purple">
                        <span className="text-light-purple">Owner:</span>
                        <span className="font-mono text-green-400">
                          {truncateAddr(nameDetail.owner)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-light-purple">
                        <span className="text-light-purple">Registered:</span>
                        <span className="text-light-purple">{formatDate(nameDetail.registrationTime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-light-purple">
                    <span className="text-sm">Click for details</span>
                    <span className="ml-2 text-light-purple">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};