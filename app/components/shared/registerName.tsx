"use client";
import React, { useState } from 'react';
import type { Contract } from 'ethers';
import { pinata } from '@/utils/config';
import { useToast } from '../ui/toast';

interface RegisterNameProps {
  contract: Contract | null;
  onSuccess?: (name: string, txHash: string) => void;
}

export const RegisterName: React.FC<RegisterNameProps> = ({
  contract,
  onSuccess,
}) => {
  const { addToast } = useToast();
  
  const [name, setName] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [file, setFile] = useState<File>();
  const [imageUrl, setImageUrl] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [gasless, setGasless] = useState(false);
  
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [imageHash, setImageHash] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target?.files?.[0]);
    setImageUrl('');
    setImageHash('');
  };

  const uploadImage = async () => {
    if (!file) {
      addToast({ type: 'error', message: 'Please select an image file' });
      return;
    }

    try {
      setUploading(true);
      
      const urlRequest = await fetch('/api/url');
      const urlResponse = await urlRequest.json();
      
      const upload = await pinata.upload.public.file(file).url(urlResponse.url);
      const fileUrl = await pinata.gateways.public.convert(upload.cid);
      
      setImageUrl(fileUrl);
      setImageHash(upload.cid);
      setUploading(false);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      addToast({ type: 'error', message: 'Failed to upload image. Please try again.' });
    }
  };

  const checkNameAvailability = async () => {
    if (!contract || !name.trim()) return;

    try {
      setCheckingAvailability(true);
      const available = await contract.isNameAvailable(name.trim());
      setNameAvailable(available);
      setCheckingAvailability(false);
    } catch (error: any) {
      console.error('Availability check error:', error);
      setCheckingAvailability(false);
      addToast({ type: 'error', message: 'Failed to check name availability' });
    }
  };

  const registerName = async () => {
    if (!contract) {
      addToast({ type: 'error', message: 'Contract not initialized' });
      return;
    }

    if (!name.trim()) {
      addToast({ type: 'error', message: 'Please enter a name' });
      return;
    }

    if (!targetAddress.trim()) {
      addToast({ type: 'error', message: 'Please enter a target address' });
      return;
    }

    if (!imageHash) {
      addToast({ type: 'error', message: 'Please upload an image first' });
      return;
    }

    if (nameAvailable === false) {
      addToast({ type: 'error', message: 'Name is not available' });
      return;
    }

    try {
      setRegistering(true);
      const tx = await contract.registerName(
        name.trim(),
        imageHash,
        targetAddress.trim()
      );
      const receipt = await tx.wait();
      setRegistering(false);
      addToast({ type: 'success', message: `Successfully registered ${name}` });
      onSuccess?.(name.trim(), receipt.transactionHash);
      
      setName('');
      setTargetAddress('');
      setFile(undefined);
      setImageUrl('');
      setImageHash('');
      setNameAvailable(null);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setRegistering(false);
      
      if (error.code === 4001) {
        addToast({ type: 'error', message: 'Transaction rejected by user' });
      } else if (error.message?.includes('Name already registered')) {
        addToast({ type: 'error', message: 'Name is already registered' });
      } else if (error.message?.includes('insufficient funds')) {
        addToast({ type: 'error', message: 'Insufficient funds for transaction' });
      } else {
        addToast({ type: 'error', message: 'Registration failed. Please try again.' });
      }
    }
  };

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  return (
    <div className="bg-primary-purple rounded-2xl p-8 space-y-8 border border-accent-purple shadow-xl hover-lift fade-in">
      <h2 className="text-3xl font-bold text-light-purple mb-6">Register New Name</h2>
      
      <div className="space-y-3">
        <label className="block text-sm font-medium text-light-purple">
          Name
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameAvailable(null);
            }}
            placeholder="Enter name (e.g., alice)"
            className="flex-1 px-4 py-3 bg-secondary-purple border border-accent-purple rounded-lg text-white placeholder-light-purple focus:outline-none focus:border-light-purple focus:ring-2 focus:ring-light-purple/20"
            maxLength={64}
          />
          <button
            onClick={checkNameAvailability}
            disabled={!name.trim() || checkingAvailability}
            className="px-6 py-3 bg-accent-purple hover:bg-light-purple disabled:bg-dark-purple disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
          >
            {checkingAvailability ? 'Checking...' : 'Check'}
          </button>
        </div>
        
        {nameAvailable === true && (
          <p className="text-green-400 text-sm font-medium">Name is available</p>
        )}
        {nameAvailable === false && (
          <p className="text-red-400 text-sm font-medium">Name is already taken</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-light-purple">
          Target Address
        </label>
        <input
          type="text"
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
          placeholder="0x..."
          className="w-full px-4 py-3 bg-secondary-purple border border-accent-purple rounded-lg text-white placeholder-light-purple focus:outline-none focus:border-light-purple focus:ring-2 focus:ring-light-purple/20"
        />
        {targetAddress && !isValidAddress(targetAddress) && (
          <p className="text-red-400 text-sm font-medium">Invalid Ethereum address format</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-light-purple">
          Profile Image
        </label>
        <div className="flex gap-3">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="flex-1 px-4 py-3 bg-secondary-purple border border-accent-purple rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-accent-purple file:text-white file:cursor-pointer file:font-medium"
          />
          <button
            onClick={uploadImage}
            disabled={!file || uploading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-dark-purple disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        
        {imageUrl && (
          <div className="mt-4">
            <p className="text-green-400 text-sm font-medium mb-3">Image uploaded successfully</p>
            <img
              src={imageUrl}
              alt="Uploaded preview"
              className="w-32 h-32 object-cover rounded-xl border-2 border-accent-purple shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Gasless option removed to revert to pre-AA implementation */}

      <button
        onClick={registerName}
        disabled={
          !name.trim() ||
          !targetAddress.trim() ||
          !imageHash ||
          !isValidAddress(targetAddress) ||
          nameAvailable === false ||
          registering
        }
        className="w-full px-6 py-4 bg-accent-purple hover:bg-light-purple disabled:bg-dark-purple disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 shadow-lg text-lg"
      >
        {registering ? 'Registering...' : 'Register Name'}
      </button>
    </div>
  );
}; 
