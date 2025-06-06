import { Regex } from "lucide-react";
import { foodStoreKeywords } from "../components/budgets/budgetCategories";
import { Transaction } from "../types/transactionsType";
import { format } from 'date-fns';

export function isFoodTransaction(description:string | undefined): boolean {
    if(!description) return false;
    const desc = description.trim().toLowerCase();

    return foodStoreKeywords.some(keyword => {
        const kw = keyword.toLowerCase();
        const regex = new RegExp(`\\b${kw}\\b`, 'i');

        return regex.test(desc)
    });
}

export function calculateFoodSpentForMonth(
    transactions:Transaction[],
    currentMonth:Date
): number {
    const selectedMonth = format(currentMonth, 'yyyy-MM');

    const matchedTransactions = transactions.filter(tx => {
        const txMonth = format(new Date(tx.date), 'yyyy-MM');
        
        if (txMonth !== selectedMonth) return false;
        if (tx.category !== 'expense') return false

        return isFoodTransaction(tx.description);
    });

    console.log("calculating food budget. matched transactions:");
    matchedTransactions.forEach(tx => {
        console.log(`Date: ${tx.date}, amount: ${tx.amount}, Description: ${tx.description}`);
    });

    return matchedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
}

export function calculateRecurringExpenses(
    transactions: Transaction[],
    currentMonth: Date
    ): number {
    const selectedMonth = format(currentMonth, 'yyyy-MM');

    return transactions
    .filter((tx) => {
        const txMonth = format(new Date(tx.date), 'yyyy-MM');
        return tx.is_recurring === true && tx.category === 'expense' && txMonth === selectedMonth;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
    }