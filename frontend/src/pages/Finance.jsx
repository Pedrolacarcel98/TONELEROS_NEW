import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import FinanceSummary from '../components/finance/FinanceSummary';
import ExpenseForm from '../components/finance/ExpenseForm';
import styles from './Finance.module.css';

const Finance = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const handleCreated = () => setRefreshKey(k => k + 1);

    return (
        <div className={styles.page}>
            <Header showBack={true} />
            <main className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>Panel de Finanzas</h1>
                    <p className={styles.subtitle}>Gestiona los ingresos y gastos de la agrupación</p>
                </header>
                
                <div className={styles.contentGrid}>
                    <section className={styles.summarySection}>
                        <FinanceSummary refreshKey={refreshKey} />
                    </section>
                    
                    <section className={styles.expensesSection}>
                        <ExpenseForm onCreated={handleCreated} refreshKey={refreshKey} />
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Finance;
