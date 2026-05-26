// State Engine Database Initialization
let ledgerData = [
    { id: 1, description: "Freelance Engine CAD Design Layout", amount: 450.00, type: "income", date: "May 25, 2026" },
    { id: 2, description: "Next-Gen Racing Sim Transmission Mod", amount: 65.00, type: "expense", date: "May 24, 2026" },
    { id: 3, description: "Monthly Garage Workspace Rental Fees", amount: 200.00, type: "expense", date: "May 20, 2026" }
];

const EXPENSE_LIMIT = 1500.00;
let currentViewFilter = 'all'; // Filter modes: all, income, expense

// Node Target Selectors
const ledgerBody = document.getElementById('ledgerBody');
const transactionForm = document.getElementById('transactionForm');
const netBalanceEl = document.getElementById('netBalance');
const totalExpensesEl = document.getElementById('totalExpenses');
const budgetPercentEl = document.getElementById('budgetPercent');
const budgetBarFill = document.getElementById('budgetBarFill');
const alertMessage = document.getElementById('alertMessage');
const recordCountEl = document.getElementById('recordCount');
const sidebarItems = document.querySelectorAll('.sidebar ul li');

function initLedger() {
    calculateFinancials();
    setupFormInterceptor();
    setupViewFilters();
}

// core processing math calculations
function calculateFinancials() {
    let incomeTotal = 0;
    let expenseTotal = 0;

    ledgerData.forEach(item => {
        if (item.type === 'income') incomeTotal += item.amount;
        if (item.type === 'expense') expenseTotal += item.amount;
    });

    const netBalance = incomeTotal - expenseTotal;

    // Render numbers safely onto display targets
    netBalanceEl.innerText = `$${netBalance.toFixed(2)}`;
    totalExpensesEl.innerText = `$${expenseTotal.toFixed(2)}`;

    // Handle interactive styling variants based on balance values
    if (netBalance < 0) {
        netBalanceEl.className = "value text-danger";
        document.getElementById('netTrend').innerText = "Running deficit operation";
    } else {
        netBalanceEl.className = "value";
        document.getElementById('netTrend').innerText = "Capital balance stable";
    }

    // Process budget threshold alerts
    const utilizationPercentage = Math.min((expenseTotal / EXPENSE_LIMIT) * 100, 100);
    budgetPercentEl.innerText = `${Math.round(utilizationPercentage)}%`;
    budgetBarFill.style.width = `${utilizationPercentage}%`;

    if (utilizationPercentage >= 85) {
        budgetBarFill.className = "alert-bar-fill danger";
        alertMessage.innerText = "CRITICAL: Approaching expenditure ceiling!";
        alertMessage.style.color = "var(--accent-red)";
    } else {
        budgetBarFill.className = "alert-bar-fill";
        alertMessage.innerText = "Capital outflow limits structural green.";
        alertMessage.style.color = "var(--text-muted)";
    }

    renderTableRows();
}

// Table row generation engine
function renderTableRows() {
    ledgerBody.innerHTML = '';

    const sortedData = ledgerData.filter(item => {
        if (currentViewFilter === 'all') return true;
        return item.type === currentViewFilter;
    });

    recordCountEl.innerText = `${sortedData.length} entries`;

    if (sortedData.length === 0) {
        ledgerBody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: var(--text-muted); padding: 2rem;">No transaction assets logged inside current view context.</td></tr>`;
        return;
    }

    sortedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.description}</td>
            <td><span class="type-badge ${item.type === 'income' ? 'inc' : 'exp'}">${item.type}</span></td>
            <td>${item.date}</td>
            <td class="text-right ${item.type === 'income' ? 'amt-income' : 'amt-expense'}">
                ${item.type === 'income' ? '+' : '-'}$${item.amount.toFixed(2)}
            </td>
            <td class="text-center">
                <button class="delete-btn" data-id="${item.id}">❌</button>
            </td>
        `;
        ledgerBody.appendChild(row);
    });
}

// Intercept form operations
function setupFormInterceptor() {
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const description = document.getElementById('txDescription').value.trim();
        const amount = parseFloat(document.getElementById('txAmount').value);
        const type = document.getElementById('txType').value;
        
        // Grab current system calendar settings
        const currentCalendarDate = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const newAsset = {
            id: Date.now(),
            description: description,
            amount: amount,
            type: type,
            date: currentCalendarDate
        };

        ledgerData.unshift(newAsset); // Add newest item at the top of the deck
        transactionForm.reset();
        calculateFinancials();
    });

    // Delete delegation listener processing
    ledgerBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const assetId = parseInt(e.target.dataset.id);
            ledgerData = ledgerData.filter(item => item.id !== assetId);
            calculateFinancials();
        }
    });
}

// Side dashboard filtering engine
function setupViewFilters() {
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            currentViewFilter = item.dataset.view;
            renderTableRows();
        });
    });
}

// Ignition
initLedger();