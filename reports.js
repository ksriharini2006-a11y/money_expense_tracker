

let transactions = [];
let categoryChart, comparisonChart;


const themeToggle = document.getElementById('themeToggle');
const totalTransactionsEl = document.getElementById('totalTransactions');
const highestIncomeEl = document.getElementById('highestIncome');
const highestExpenseEl = document.getElementById('highestExpense');
const topCategoryEl = document.getElementById('topCategory');
const categoryBreakdownEl = document.getElementById('categoryBreakdown');
const insightsListEl = document.getElementById('insightsList');


document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    loadTheme();
    updateStats();
    createCharts();
    displayCategoryBreakdown();
    displayInsights();
});

themeToggle.addEventListener('click', toggleTheme);

function loadFromLocalStorage() {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }
}

function updateStats() {
    
    totalTransactionsEl.textContent = transactions.length;

    
    const incomes = transactions.filter(t => t.type === 'income');
    const highestIncome = incomes.length > 0 
        ? Math.max(...incomes.map(t => t.amount)) 
        : 0;
    highestIncomeEl.textContent = `₹${highestIncome.toFixed(2)}`;


    const expenses = transactions.filter(t => t.type === 'expense');
    const highestExpense = expenses.length > 0 
        ? Math.max(...expenses.map(t => t.amount)) 
        : 0;
    highestExpenseEl.textContent = `₹${highestExpense.toFixed(2)}`;


    if (expenses.length > 0) {
        const categoryTotals = {};
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });
        
        const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
            categoryTotals[a] > categoryTotals[b] ? a : b
        );
        
        topCategoryEl.textContent = topCategory;
    } else {
        topCategoryEl.textContent = '-';
    }
}


function createCharts() {
    const categoryChartCanvas = document.getElementById('categoryChart');
    const comparisonChartCanvas = document.getElementById('comparisonChart');

    
    const expenses = transactions.filter(t => t.type === 'expense');
    
    if (expenses.length > 0) {
        const categoryTotals = {};
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        drawBarChart(categoryChartCanvas, categoryTotals, 'Category Expenses');
    } else {
        drawNoDataMessage(categoryChartCanvas, 'No expense data available');
    }

    
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    if (income > 0 || expense > 0) {
        drawComparisonChart(comparisonChartCanvas, income, expense);
    } else {
        drawNoDataMessage(comparisonChartCanvas, 'No transaction data available');
    }
}


function drawBarChart(canvas, data, title) {
    const ctx = canvas.getContext('2d');
    const categories = Object.keys(data);
    const values = Object.values(data);
    const maxValue = Math.max(...values);

    canvas.width = 500;
    canvas.height = 300;

    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e2e8f0' : '#2d3748';
    const barColors = ['#667eea', '#764ba2', '#f56565', '#48bb78', '#ed8936', '#38b2ac', '#9f7aea'];

    const barWidth = (canvas.width - 40) / categories.length - 20;
    const chartHeight = 220;

    categories.forEach((category, index) => {
        const value = values[index];
        const barHeight = (value / maxValue) * chartHeight;
        const x = index * (barWidth + 20) + 20;
        const y = canvas.height - barHeight - 50;

        
        ctx.fillStyle = barColors[index % barColors.length];
        ctx.fillRect(x, y, barWidth, barHeight);

        
        ctx.fillStyle = textColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(category, x + barWidth / 2, canvas.height - 30);

       
        ctx.fillText(`₹${value.toFixed(0)}`, x + barWidth / 2, y - 5);
    });
}


function drawComparisonChart(canvas, income, expense) {
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 300;

    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e2e8f0' : '#2d3748';

    const total = income + expense;
    const barWidth = 100;
    const maxHeight = 200;

    
    const incomeHeight = total > 0 ? (income / total) * maxHeight : 0;
    const incomeX = 100;
    const incomeY = canvas.height - incomeHeight - 50;

    ctx.fillStyle = '#48bb78';
    ctx.fillRect(incomeX, incomeY, barWidth, incomeHeight);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Income', incomeX + barWidth / 2, canvas.height - 30);
    ctx.fillText(`₹${income.toFixed(0)}`, incomeX + barWidth / 2, incomeY - 10);

    
    const expenseHeight = total > 0 ? (expense / total) * maxHeight : 0;
    const expenseX = 300;
    const expenseY = canvas.height - expenseHeight - 50;

    ctx.fillStyle = '#f56565';
    ctx.fillRect(expenseX, expenseY, barWidth, expenseHeight);

    ctx.fillStyle = textColor;
    ctx.fillText('Expense', expenseX + barWidth / 2, canvas.height - 30);
    ctx.fillText(`₹${expense.toFixed(0)}`, expenseX + barWidth / 2, expenseY - 10);
}


function drawNoDataMessage(canvas, message) {
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 300;

    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e2e8f0' : '#2d3748';

    ctx.fillStyle = textColor;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}


function displayCategoryBreakdown() {
    const expenses = transactions.filter(t => t.type === 'expense');

    if (expenses.length === 0) {
        categoryBreakdownEl.innerHTML = '<p class="no-data">No expense data available.</p>';
        return;
    }

    const categoryTotals = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const totalExpense = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    categoryBreakdownEl.innerHTML = '';

    sortedCategories.forEach(([category, amount]) => {
        const percentage = (amount / totalExpense) * 100;
        
        const item = document.createElement('div');
        item.className = 'breakdown-item';
        
        item.innerHTML = `
            <div class="breakdown-info">
                <span class="category-icon">${getCategoryIcon(category)}</span>
                <div class="category-details">
                    <h4>${category}</h4>
                    <p>${percentage.toFixed(1)}% of total expenses</p>
                    <div class="breakdown-bar">
                        <div class="breakdown-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            </div>
            <span class="breakdown-amount">₹${amount.toFixed(2)}</span>
        `;
        
        categoryBreakdownEl.appendChild(item);
    });
}


function getCategoryIcon(category) {
    const icons = {
        'Food': '🍔',
        'Travel': '✈️',
        'Rent': '🏠',
        'Shopping': '🛍️',
        'Education': '📚',
        'Medical': '⚕️',
        'Salary': '💼',
        'Others': '📦'
    };
    return icons[category] || '📦';
}


function displayInsights() {
    const insights = [];

    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    if (transactions.length === 0) {
        insightsListEl.innerHTML = `
            <div class="insight-card">
                <p>Start tracking your expenses to get personalized insights!</p>
            </div>
        `;
        return;
    }

    
    if (balance > 0) {
        insights.push(`💰 Great job! You have a positive balance of ₹${balance.toFixed(2)}. Keep saving!`);
    } else if (balance < 0) {
        insights.push(`⚠️ You're overspending by ₹${Math.abs(balance).toFixed(2)}. Try to reduce expenses.`);
    } else {
        insights.push(`✅ You're breaking even! Consider saving more for the future.`);
    }

    
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length > 0) {
        const categoryTotals = {};
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
            categoryTotals[a] > categoryTotals[b] ? a : b
        );

        insights.push(`📊 Your highest spending category is "${topCategory}" with ₹${categoryTotals[topCategory].toFixed(2)}.`);

        const avgExpense = expense / expenses.length;
        insights.push(`💡 Your average expense per transaction is ₹${avgExpense.toFixed(2)}.`);
    }

    
    insightsListEl.innerHTML = insights.map(insight => `
        <div class="insight-card">
            <p>${insight}</p>
        </div>
    `).join('');
}


function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    themeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    
    createCharts();
}


function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Light Mode';
    }
}
