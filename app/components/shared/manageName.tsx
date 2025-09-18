import React, { useState } from 'react';
import type { Contract } from 'ethers';
import { useToast } from '../ui/toast';

interface ManageNameProps {
	contract: Contract | null;
	name: string;
	onSuccess?: (action: string) => void;
}

export const ManageName: React.FC<ManageNameProps> = ({ contract, name, onSuccess }) => {
	const { addToast } = useToast();
	const [newAddress, setNewAddress] = useState('');
	const [newImageHash, setNewImageHash] = useState('');
	const [transferTo, setTransferTo] = useState('');
	const [pending, setPending] = useState<string | null>(null);

	const isAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

	const doUpdateAddress = async () => {
		if (!contract) return addToast({ type: 'error', message: 'Contract not initialized' });
		if (!isAddress(newAddress)) return addToast({ type: 'error', message: 'Invalid address' });
		try {
			setPending('updateAddress');
			const tx = await contract.updateAddress(name, newAddress.trim());
			await tx.wait();
			setPending(null);
			addToast({ type: 'success', message: 'Address updated successfully' });
			onSuccess?.('updateAddress');
			setNewAddress('');
		} catch (e: any) {
			setPending(null);
			addToast({ type: 'error', message: e?.message || 'Failed to update address' });
		}
	};

	const doUpdateImage = async () => {
		if (!contract) return addToast({ type: 'error', message: 'Contract not initialized' });
		if (!newImageHash.trim()) return addToast({ type: 'error', message: 'Image hash required' });
		try {
			setPending('updateImage');
			const tx = await contract.updateImage(name, newImageHash.trim());
			await tx.wait();
			setPending(null);
			addToast({ type: 'success', message: 'Image updated successfully' });
			onSuccess?.('updateImage');
			setNewImageHash('');
		} catch (e: any) {
			setPending(null);
			addToast({ type: 'error', message: e?.message || 'Failed to update image' });
		}
	};

	const doTransfer = async () => {
		if (!contract) return addToast({ type: 'error', message: 'Contract not initialized' });
		if (!isAddress(transferTo)) return addToast({ type: 'error', message: 'Invalid recipient' });
		try {
			setPending('transfer');
			const tx = await contract.transferName(name, transferTo.trim());
			await tx.wait();
			setPending(null);
			addToast({ type: 'success', message: 'Name transferred successfully' });
			onSuccess?.('transfer');
			setTransferTo('');
		} catch (e: any) {
			setPending(null);
			addToast({ type: 'error', message: e?.message || 'Failed to transfer' });
		}
	};

	return (
		<div className="bg-primary-purple rounded-2xl p-8 space-y-8 border border-accent-purple shadow-xl hover-lift fade-in">
			<h3 className="text-2xl font-semibold text-light-purple">Manage: {name}</h3>

			<div className="space-y-3">
				<label className="block text-sm text-light-purple">New resolve address</label>
				<div className="flex gap-3">
					<input
						type="text"
						value={newAddress}
						onChange={(e) => setNewAddress(e.target.value)}
						placeholder="0x..."
						className="flex-1 px-4 py-3 bg-secondary-purple border border-accent-purple rounded-lg text-white placeholder-light-purple focus:outline-none focus:border-light-purple focus:ring-2 focus:ring-light-purple/20"
					/>
					<button
						onClick={doUpdateAddress}
						disabled={!isAddress(newAddress) || pending !== null}
						className="px-6 py-3 bg-accent-purple hover:bg-light-purple disabled:bg-dark-purple disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
					>
						{pending === 'updateAddress' ? 'Updating...' : 'Update'}
					</button>
				</div>
				{newAddress && !isAddress(newAddress) && (
					<p className="text-red-400 text-sm font-medium">Invalid address format</p>
				)}
			</div>

			<div className="space-y-3">
				<label className="block text-sm text-light-purple">New image IPFS hash</label>
				<div className="flex gap-3">
					<input
						type="text"
						value={newImageHash}
						onChange={(e) => setNewImageHash(e.target.value)}
						placeholder="Qm..."
						className="flex-1 px-4 py-3 bg-secondary-purple border border-accent-purple rounded-lg text-white placeholder-light-purple focus:outline-none focus:border-light-purple focus:ring-2 focus:ring-light-purple/20"
					/>
					<button
						onClick={doUpdateImage}
						disabled={!newImageHash.trim() || pending !== null}
						className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-dark-purple disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
					>
						{pending === 'updateImage' ? 'Updating...' : 'Update'}
					</button>
				</div>
			</div>

			<div className="space-y-3">
				<label className="block text-sm text-light-purple">Transfer ownership to</label>
				<div className="flex gap-3">
					<input
						type="text"
						value={transferTo}
						onChange={(e) => setTransferTo(e.target.value)}
						placeholder="0x..."
						className="flex-1 px-4 py-3 bg-secondary-purple border border-accent-purple rounded-lg text-white placeholder-light-purple focus:outline-none focus:border-light-purple focus:ring-2 focus:ring-light-purple/20"
					/>
					<button
						onClick={doTransfer}
						disabled={!isAddress(transferTo) || pending !== null}
						className="px-6 py-3 bg-accent-purple hover:bg-light-purple disabled:bg-dark-purple disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
					>
						{pending === 'transfer' ? 'Transferring...' : 'Transfer'}
					</button>
				</div>
				{transferTo && !isAddress(transferTo) && (
					<p className="text-red-400 text-sm font-medium">Invalid address format</p>
				)}
			</div>
		</div>
	);
};