/* =========================================
   طريق العمرة والأضحية
   Pure JavaScript + localStorage
========================================= */

"use strict";


/* =========================================
   Settings
========================================= */

const STORAGE_KEY = "umrah_sacrifice_savings_v1";

const GOALS = {
    umrah: 45000,
    sacrifice: 15000,
    total: 60000
};


/* =========================================
   State
========================================= */

let transactions = loadTransactions();


/* =========================================
   DOM
========================================= */

const savingForm = document.getElementById("savingForm");

const savingType = document.getElementById("savingType");
const amountInput = document.getElementById("amount");
const noteInput = document.getElementById("note");

const transactionsList =
    document.getElementById("transactionsList");

const emptyState =
    document.getElementById("emptyState");

const toast =
    document.getElementById("toast");


/* Edit */
const editModal =
    document.getElementById("editModal");

const editForm =
    document.getElementById("editForm");

const editId =
    document.getElementById("editId");

const editType =
    document.getElementById("editType");

const editAmount =
    document.getElementById("editAmount");

const editNote =
    document.getElementById("editNote");

const closeModal =
    document.getElementById("closeModal");

const cancelEdit =
    document.getElementById("cancelEdit");


/* =========================================
   Helpers
========================================= */

function formatNumber(number) {

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2
    }).format(number);

}


function clampPercent(value) {

    return Math.min(100, Math.max(0, value));

}


function getPercentage(saved, goal) {

    if (goal <= 0) {
        return 0;
    }

    return clampPercent(
        (saved / goal) * 100
    );

}


function getRemaining(saved, goal) {

    return Math.max(0, goal - saved);

}


function getTypeName(type) {

    return type === "umrah"
        ? "العمرة"
        : "الأضحية";

}


function getTypeIcon(type) {

    return type === "umrah"
        ? "🕋"
        : "🐑";

}


function getMonthName(monthIndex) {

    const months = [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر"
    ];

    return months[monthIndex];

}


/* =========================================
   Local Storage
========================================= */

function loadTransactions() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;

    } catch (error) {

        console.error(
            "تعذر تحميل البيانات:",
            error
        );

        return [];
    }

}


function saveTransactions() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
    );

}


/* =========================================
   Calculations
========================================= */

function getTotals() {

    let umrah = 0;
    let sacrifice = 0;

    transactions.forEach(transaction => {

        const amount =
            Number(transaction.amount) || 0;

        if (transaction.type === "umrah") {
            umrah += amount;
        }

        if (transaction.type === "sacrifice") {
            sacrifice += amount;
        }

    });

    return {
        umrah,
        sacrifice,
        total: umrah + sacrifice
    };

}


/* =========================================
   Update Goal Cards
========================================= */

function updateGoals() {

    const totals = getTotals();

    /* Total */

    const totalPercent =
        getPercentage(
            totals.total,
            GOALS.total
        );

    document.getElementById(
        "totalSaved"
    ).textContent =
        formatNumber(totals.total);

    document.getElementById(
        "totalSavedSmall"
    ).textContent =
        formatNumber(totals.total);

    document.getElementById(
        "totalRemaining"
    ).textContent =
        formatNumber(
            getRemaining(
                totals.total,
                GOALS.total
            )
        );

    document.getElementById(
        "totalPercent"
    ).textContent =
        `${Math.round(totalPercent)}%`;

    document.getElementById(
        "totalProgressText"
    ).textContent =
        `${Math.round(totalPercent)}%`;

    document.getElementById(
        "totalProgress"
    ).style.width =
        `${totalPercent}%`;


    /* Umrah */

    updateGoal(
        "umrah",
        totals.umrah,
        GOALS.umrah
    );


    /* Sacrifice */

    updateGoal(
        "sacrifice",
        totals.sacrifice,
        GOALS.sacrifice
    );


    /* Congratulations */

    const totalCompleted =
        totals.total >= GOALS.total;

    document
        .getElementById("goalCompleted")
        .classList.toggle(
            "hidden",
            !totalCompleted
        );

}


function updateGoal(
    type,
    saved,
    goal
) {

    const percent =
        getPercentage(saved, goal);

    const remaining =
        getRemaining(saved, goal);

    document.getElementById(
        `${type}Saved`
    ).textContent =
        formatNumber(saved);

    document.getElementById(
        `${type}Remaining`
    ).textContent =
        formatNumber(remaining);

    document.getElementById(
        `${type}Percent`
    ).textContent =
        `${Math.round(percent)}%`;

    document.getElementById(
        `${type}ProgressText`
    ).textContent =
        `${Math.round(percent)}%`;

    document.getElementById(
        `${type}Progress`
    ).style.width =
        `${percent}%`;

    document
        .getElementById(`${type}Completed`)
        .classList.toggle(
            "hidden",
            saved < goal
        );

}


/* =========================================
   Statistics
========================================= */

function updateStatistics() {

    const now = new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();


    /* This month */

    const monthlyTotal =
        transactions
            .filter(transaction => {

                const date =
                    new Date(transaction.createdAt);

                return (
                    date.getFullYear() === currentYear &&
                    date.getMonth() === currentMonth
                );

            })
            .reduce(
                (sum, transaction) =>
                    sum + Number(transaction.amount),
                0
            );


    document.getElementById(
        "monthlySaved"
    ).textContent =
        formatNumber(monthlyTotal);


    /* Count */

    document.getElementById(
        "transactionCount"
    ).textContent =
        transactions.length;

    document.getElementById(
        "transactionCountBadge"
    ).textContent =
        transactions.length;


    /* Best month */

    const monthlyTotals = {};

    transactions.forEach(transaction => {

        const date =
            new Date(transaction.createdAt);

        const key =
            `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

        if (!monthlyTotals[key]) {
            monthlyTotals[key] = 0;
        }

        monthlyTotals[key] +=
            Number(transaction.amount);

    });


    const entries =
        Object.entries(monthlyTotals);


    if (entries.length === 0) {

        document.getElementById(
            "bestMonth"
        ).textContent = "—";

        document.getElementById(
            "bestMonthAmount"
        ).textContent = "0 جنيه";

        return;
    }


    entries.sort(
        (a, b) => b[1] - a[1]
    );


    const [bestKey, bestAmount] =
        entries[0];

    const [
        year,
        month
    ] = bestKey.split("-");


    const monthName =
        getMonthName(
            Number(month) - 1
        );


    document.getElementById(
        "bestMonth"
    ).textContent =
        `${monthName} ${year}`;

    document.getElementById(
        "bestMonthAmount"
    ).textContent =
        `${formatNumber(bestAmount)} جنيه`;

}


/* =========================================
   Render Transactions
========================================= */

function renderTransactions() {

    const sorted =
        [...transactions]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );


    const latest =
        sorted.slice(0, 30);


    transactionsList.innerHTML = "";


    if (latest.length === 0) {

        emptyState.classList.remove(
            "hidden"
        );

        return;
    }


    emptyState.classList.add(
        "hidden"
    );


    latest.forEach(transaction => {

        const item =
            createTransactionElement(
                transaction
            );

        transactionsList.appendChild(item);

    });

}


function createTransactionElement(
    transaction
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        `transaction ${transaction.type}`;


    const icon =
        document.createElement("div");

    icon.className =
        "transaction-icon";

    icon.textContent =
        getTypeIcon(transaction.type);


    const info =
        document.createElement("div");

    info.className =
        "transaction-info";


    const title =
        document.createElement("div");

    title.className =
        "transaction-title";

    title.textContent =
        getTypeName(transaction.type);


    const date =
        document.createElement("div");

    date.className =
        "transaction-date";

    date.textContent =
        formatDate(transaction.createdAt);


    info.appendChild(title);
    info.appendChild(date);


    if (transaction.note) {

        const note =
            document.createElement("div");

        note.className =
            "transaction-note";

        note.textContent =
            transaction.note;

        info.appendChild(note);

    }


    const amountArea =
        document.createElement("div");

    amountArea.className =
        "transaction-amount";


    const amount =
        document.createElement("strong");

    amount.textContent =
        `+${formatNumber(
            Number(transaction.amount)
        )} جنيه`;


    const actions =
        document.createElement("div");

    actions.className =
        "transaction-actions";


    const editButton =
        document.createElement("button");

    editButton.type = "button";

    editButton.className =
        "action-btn";

    editButton.textContent =
        "✏️ تعديل";

    editButton.addEventListener(
        "click",
        () => openEditModal(transaction.id)
    );


    const deleteButton =
        document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className =
        "action-btn delete";

    deleteButton.textContent =
        "🗑️ حذف";

    deleteButton.addEventListener(
        "click",
        () => deleteTransaction(transaction.id)
    );


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);


    amountArea.appendChild(amount);
    amountArea.appendChild(actions);


    wrapper.appendChild(icon);
    wrapper.appendChild(info);
    wrapper.appendChild(amountArea);


    return wrapper;

}


/* =========================================
   Date
========================================= */

function formatDate(dateString) {

    const date =
        new Date(dateString);

    return new Intl.DateTimeFormat(
        "ar-EG",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);

}


/* =========================================
   Add Transaction
========================================= */

savingForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const type =
            savingType.value;

        const amount =
            Number(amountInput.value);

        const note =
            noteInput.value.trim();


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            showToast(
                "من فضلك أدخل مبلغًا صحيحًا."
            );

            return;
        }


        const transaction = {

            id:
                generateId(),

            type,

            amount:

                Math.round(
                    amount * 100
                ) / 100,

            note,

            createdAt:
                new Date().toISOString()

        };


        transactions.push(
            transaction
        );


        saveTransactions();

        updateUI();


        savingForm.reset();

        savingType.value = "umrah";


        showToast(
            `✅ تم إضافة ${formatNumber(amount)} جنيه بنجاح`
        );


        checkTotalAchievement();

    }
);


/* =========================================
   Generate ID
========================================= */

function generateId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* =========================================
   Delete
========================================= */

function deleteTransaction(id) {

    const transaction =
        transactions.find(
            item => item.id === id
        );


    if (!transaction) {
        return;
    }


    const confirmed =
        confirm(
            `هل تريد حذف ادخار ${formatNumber(
                Number(transaction.amount)
            )} جنيه؟`
        );


    if (!confirmed) {
        return;
    }


    transactions =
        transactions.filter(
            item => item.id !== id
        );


    saveTransactions();

    updateUI();

    showToast(
        "🗑️ تم حذف العملية."
    );

}


/* =========================================
   Edit Modal
========================================= */

function openEditModal(id) {

    const transaction =
        transactions.find(
            item => item.id === id
        );


    if (!transaction) {
        return;
    }


    editId.value =
        transaction.id;

    editType.value =
        transaction.type;

    editAmount.value =
        transaction.amount;

    editNote.value =
        transaction.note || "";


    editModal.classList.remove(
        "hidden"
    );

}


function closeEditModal() {

    editModal.classList.add(
        "hidden"
    );

}


closeModal.addEventListener(
    "click",
    closeEditModal
);


cancelEdit.addEventListener(
    "click",
    closeEditModal
);


editModal.addEventListener(
    "click",
    function (event) {

        if (event.target === editModal) {
            closeEditModal();
        }

    }
);


editForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const id =
            editId.value;

        const amount =
            Number(editAmount.value);

        const type =
            editType.value;

        const note =
            editNote.value.trim();


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            showToast(
                "من فضلك أدخل مبلغًا صحيحًا."
            );

            return;
        }


        const index =
            transactions.findIndex(
                item => item.id === id
            );


        if (index === -1) {
            return;
        }


        transactions[index] = {

            ...transactions[index],

            type,

            amount:
                Math.round(
                    amount * 100
                ) / 100,

            note

        };


        saveTransactions();

        updateUI();

        closeEditModal();


        showToast(
            "✏️ تم تعديل العملية بنجاح."
        );

    }
);


/* =========================================
   Clear All
========================================= */

document
    .getElementById("clearAllBtn")
    .addEventListener(
        "click",
        function () {

            if (transactions.length === 0) {

                showToast(
                    "لا توجد بيانات لمسحها."
                );

                return;
            }


            const firstConfirm =
                confirm(
                    "⚠️ هل أنت متأكد أنك تريد مسح جميع المدخرات؟"
                );


            if (!firstConfirm) {
                return;
            }


            const secondConfirm =
                confirm(
                    "سيتم حذف كل العمليات نهائيًا من هذا المتصفح. هل تريد المتابعة؟"
                );


            if (!secondConfirm) {
                return;
            }


            transactions = [];

            saveTransactions();

            updateUI();


            showToast(
                "🗑️ تم مسح جميع البيانات."
            );

        }
    );


/* =========================================
   Export JSON
========================================= */

document
    .getElementById("exportBtn")
    .addEventListener(
        "click",
        exportData
    );


function exportData() {

    if (transactions.length === 0) {

        showToast(
            "لا توجد بيانات لتصديرها."
        );

        return;
    }


    const backup = {

        app:
            "طريق العمرة والأضحية",

        version:
            1,

        exportedAt:
            new Date().toISOString(),

        goals:
            GOALS,

        transactions

    };


    const json =
        JSON.stringify(
            backup,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;


    const date =
        new Date()
            .toISOString()
            .slice(0, 10);


    link.download =
        `umrah-sacrifice-backup-${date}.json`;


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);


    showToast(
        "💾 تم إنشاء النسخة الاحتياطية."
    );

}


/* =========================================
   Import JSON
========================================= */

document
    .getElementById("importBtn")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById("importFile")
                .click();

        }
    );


document
    .getElementById("importFile")
    .addEventListener(
        "change",
        importData
    );


function importData(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function (e) {

            try {

                const data =
                    JSON.parse(
                        e.target.result
                    );


                let importedTransactions;


                /*
                   Support both:

                   {
                     transactions: [...]
                   }

                   or

                   [...]
                */

                if (
                    Array.isArray(data)
                ) {

                    importedTransactions =
                        data;

                } else if (
                    data &&
                    Array.isArray(
                        data.transactions
                    )
                ) {

                    importedTransactions =
                        data.transactions;

                } else {

                    throw new Error(
                        "Invalid format"
                    );

                }


                const valid =
                    importedTransactions.every(
                        isValidTransaction
                    );


                if (!valid) {

                    throw new Error(
                        "Invalid transactions"
                    );

                }


                const confirmed =
                    confirm(
                        `سيتم استبدال البيانات الحالية بـ ${importedTransactions.length} عملية. هل تريد المتابعة؟`
                    );


                if (!confirmed) {
                    return;
                }


                transactions =
                    importedTransactions.map(
                        transaction => ({

                            id:
                                transaction.id ||
                                generateId(),

                            type:
                                transaction.type,

                            amount:
                                Number(
                                    transaction.amount
                                ),

                            note:
                                String(
                                    transaction.note || ""
                                ),

                            createdAt:
                                transaction.createdAt ||
                                new Date().toISOString()

                        })
                    );


                saveTransactions();

                updateUI();


                showToast(
                    "📥 تم استيراد البيانات بنجاح."
                );


            } catch (error) {

                console.error(error);

                showToast(
                    "❌ ملف JSON غير صالح."
                );

            } finally {

                event.target.value = "";

            }

        };


    reader.readAsText(file);

}


function isValidTransaction(transaction) {

    if (!transaction) {
        return false;
    }


    if (
        transaction.type !== "umrah" &&
        transaction.type !== "sacrifice"
    ) {

        return false;

    }


    const amount =
        Number(transaction.amount);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return false;

    }


    return true;

}


/* =========================================
   Toast
========================================= */

let toastTimer = null;


function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2600
        );

}


/* =========================================
   Achievement
========================================= */

let achievementAlreadyShown = false;


function checkTotalAchievement() {

    const totals =
        getTotals();


    if (
        totals.total >= GOALS.total &&
        !achievementAlreadyShown
    ) {

        achievementAlreadyShown = true;


        setTimeout(
            () => {

                showToast(
                    "🎉🎉 ما شاء الله! وصلت إلى 60,000 جنيه! ربنا يكتب لك العمرة والأضحية ❤️"
                );

            },
            400
        );

    }


    if (
        totals.total < GOALS.total
    ) {

        achievementAlreadyShown = false;

    }

}


/* =========================================
   Update Everything
========================================= */

function updateUI() {

    updateGoals();

    updateStatistics();

    renderTransactions();

}


/* =========================================
   Initial Render
========================================= */

updateUI();
