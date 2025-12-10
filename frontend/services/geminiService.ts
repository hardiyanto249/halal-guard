
import { TransactionInput, AnalysisResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8087/api';

export const analyzeTransactions = async (transactions: TransactionInput[]): Promise<AnalysisResult[]> => {
    if (!transactions || transactions.length === 0) return [];

    try {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transactions }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to analyze transactions');
        }

        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Analysis failed:', error);
        throw error;
    }
};

export const getAllTransactions = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`);

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        throw error;
    }
};

export const getTransactionById = async (id: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${id}`);

        if (!response.ok) {
            throw new Error('Failed to fetch transaction');
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch transaction:', error);
        throw error;
    }
};

export const healthCheck = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await response.json();
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};
