import React, { useState } from 'react';
import type { Contract } from 'ethers';
import { useToast } from '../ui/toast';

export const CheckAvailability: React.FC<{ contract: Contract | null; }> = ({ contract }) => {
	const { addToast } = useToast();
	const [name, setName] = useState('');
	const [checking, setChecking] = useState(false);
	const [available, setAvailable] = useState<boolean | null>(null);

	const check = async () => {
		if (!contract) return addToast({ type: 'error', message: 'Contract not initialized' });
		if (!name.trim()) return;
		try {
			setChecking(true);
			const a = await contract.isNameAvailable(name.trim());
			setAvailable(a);
			setChecking(false);
		} catch (e: any) {
			setChecking(false);
			addToast({ type: 'error', message: e?.message || 'Failed to check availability' });
		}
	};

	return (
		<div className="bg-secondary-purple rounded-2xl p-8 space-y-6 border border-accent-purple shadow-xl hover-lift fade-in">
			<h2 className="text-3xl font-bold text-light-purple">Check Availability</h2>
			<div className="flex gap-3">
				<input
					type="text"
					value={name}
					onChange={(e) => { setName(e.target.value); setAvailable(null); }}
					placeholder="Enter name"
					className="flex-1 px-4 py-3 bg-primary-purple border border-accent-purple rounded-lg text-white placeholder-light-purple focus:outline-none focus:border-light-purple focus:ring-2 focus:ring-light-purple/20"
				/>
				<button onClick={check} disabled={!name.trim() || checking} className="px-6 py-3 bg-accent-purple hover:bg-light-purple disabled:bg-dark-purple disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg">
					{checking ? 'Checking...' : 'Check'}
				</button>
			</div>
			{available === true && <p className="text-green-400 text-sm font-medium">Available</p>}
			{available === false && <p className="text-red-400 text-sm font-medium">Taken</p>}
		</div>
	);
};