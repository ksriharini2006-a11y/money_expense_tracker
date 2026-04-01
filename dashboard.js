
let transactions = [];

const quotes = [
    "Track today. Secure tomorrow.",
    "Small savings today, big dreams tomorrow.",
    "Every penny counts toward your goals.",
    "Financial freedom starts with awareness.",
    "Budget wisely, live freely.",
    "Save more, stress less.",
    "Your future self will thank you."
];


const transactionForm = document.getElementById('transactionForm');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const categorySelect = document.getElementById('category');
const transactionList = document.getElementById('transactionList');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const currentBalanceEl = document.getElementById('currentBalance');
const themeToggle = document.getElementById('themeToggle');
const currentDateEl = document.getElementById('currentDate');
const dailyQuoteEl = document.getElementById('dailyQuote');


document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateUI();
    displayCurrentDate();
    displayDailyQuote();
    loadTheme();
});


transactionForm.addEventListener('submit', addTransaction);
themeToggle.addEventListener('click', toggleTheme);


function displayCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    currentDateEl.textContent = today;
}


function displayDailyQuote() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    dailyQuoteEl.textContent = `"${randomQuote}"`;
}


function addTransaction(e) {
    e.preventDefault();

    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    const type = document.querySelector('input[name="type"]:checked').value;
    const category = categorySelect.value;

    if (!amount || amount <= 0) {
        showNotification('⚠️ Please enter a valid amount greater than 0', 'error');
        return;
    }

    if (!description) {
        showNotification('⚠️ Please enter a description', 'error');
        return;
    }

    if (!category) {
        showNotification('⚠️ Please select a category', 'error');
        return;
    }

    
    const transaction = {
        id: generateID(),
        amount: amount,
        description: description,
        type: type,
        category: category,
        date: new Date().toLocaleDateString()
    };

    
    transactions.push(transaction);

    
    saveToLocalStorage();

    updateUI();

    transactionForm.reset();

    showNotification(`✅ ${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
}


function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveToLocalStorage();
        updateUI();
        showNotification('🗑️ Transaction deleted successfully!', 'success');
    }
}


function updateUI() {
    
    transactionList.innerHTML = '';

    if (transactions.length === 0) {
        transactionList.innerHTML = '<p class="no-transactions">No transactions yet. Add your first one!</p>';
    } else {
        
        const sortedTransactions = [...transactions].reverse();
        
        sortedTransactions.forEach(transaction => {
            const transactionEl = createTransactionElement(transaction);
            transactionList.appendChild(transactionEl);
        });
    }

    
    updateSummary();
}


function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.classList.add('transaction-item', transaction.type);

    const sign = transaction.type === 'income' ? '+' : '-';

    div.innerHTML = `
        <div class="transaction-details">
            <h4>${transaction.description}</h4>
            <p>${transaction.category} • ${transaction.date}</p>
        </div>
        <span class="transaction-amount ${transaction.type}">${sign}₹${transaction.amount.toFixed(2)}</span>
        <button class="btn-delete" onclick="deleteTransaction(${transaction.id})">🗑️ Delete</button>
    `;

    return div;
}


function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    totalIncomeEl.textContent = `₹${income.toFixed(2)}`;
    totalExpenseEl.textContent = `₹${expense.toFixed(2)}`;
    currentBalanceEl.textContent = `₹${balance.toFixed(2)}`;

    
    if (balance >= 0) {
        currentBalanceEl.style.color = 'var(--income-color)';
    } else {
        currentBalanceEl.style.color = 'var(--expense-color)';
    }
}


function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadFromLocalStorage() {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }
}


function generateID() {
    return Date.now();
}


function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    themeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    
    
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}


function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Light Mode';
    }
}


function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const bgColor = type === 'success' 
        ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' 
        : 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


amountInput.addEventListener('input', (e) => {
    if (e.target.value < 0) {
        e.target.value = 0;
    }
});


document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.type !== 'submit') {
            e.preventDefault();
        }
    });
});
